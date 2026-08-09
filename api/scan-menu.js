import Anthropic from "@anthropic-ai/sdk";

// Sonnet 3.5 (the model this endpoint was originally specced against) was retired in Oct 2025 —
// Claude Sonnet 5 is the current Sonnet-tier replacement and is what actually answers here.
const MODEL = "claude-sonnet-5";

const SYSTEM_PROMPT =
  "You are an expert data extraction assistant. You will be given a photo of a restaurant menu. " +
  "Extract every item on it — its name, its description if one is printed, and every size/price " +
  "pairing listed for it. Transcribe prices exactly as printed; never invent, round, or guess a " +
  "price you can't actually read. If an item lists only one price, return a single entry in " +
  "\"prices\" with \"size\" set to null. Group items under the category headers printed on the " +
  "menu (e.g. Pizzas, Sandwiches, Sides); if the menu has no visible category headers, put " +
  "everything under a single category named \"Menu\".";

// Enforced by output_config.format below — the model's response is constrained to this shape at
// the API level, which is what actually prevents the "Claude hallucinates invalid JSON" failure
// mode rather than just asking nicely for it in the prompt.
const MENU_SCHEMA = {
  type: "object",
  properties: {
    categories: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Category name, e.g. Pizzas, Sandwiches" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: {
                  anyOf: [{ type: "string" }, { type: "null" }],
                  description: "Item description if present on the menu, otherwise null",
                },
                prices: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      size: { anyOf: [{ type: "string" }, { type: "null" }], description: "e.g. Small/Medium/Large, or null for a single-price item" },
                      price: { type: "number" },
                    },
                    required: ["size", "price"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["name", "description", "prices"],
              additionalProperties: false,
            },
          },
        },
        required: ["name", "items"],
        additionalProperties: false,
      },
    },
  },
  required: ["categories"],
  additionalProperties: false,
};

const DATA_URL_RE = /^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/;
// Vercel serverless functions cap request bodies at 4.5MB; the client compresses images well
// under that, but reject oversized payloads outright rather than let the platform 413 us blind.
const MAX_BASE64_LENGTH = 6_000_000;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("scan-menu: ANTHROPIC_API_KEY is not configured");
    return res.status(500).json({ error: "Menu scanning isn't configured on the server yet." });
  }

  const image = req.body?.image;
  if (typeof image !== "string") {
    return res.status(400).json({ error: "Missing image." });
  }

  const match = image.match(DATA_URL_RE);
  if (!match) {
    return res.status(400).json({ error: "Unsupported image format — use a JPEG, PNG, or WebP photo." });
  }
  const [, rawMediaType, base64Data] = match;
  if (base64Data.length > MAX_BASE64_LENGTH) {
    return res.status(413).json({ error: "That photo is too large. Try a smaller image." });
  }
  const mediaType = rawMediaType === "image/jpg" ? "image/jpeg" : rawMediaType;

  const client = new Anthropic({ apiKey });

  let response;
  try {
    response = await client.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64Data } },
            { type: "text", text: "Extract every menu item from this photo into the JSON schema you were given." },
          ],
        },
      ],
      output_config: { format: { type: "json_schema", schema: MENU_SCHEMA } },
    });
  } catch (err) {
    console.error("scan-menu: Anthropic request failed", err);
    return res.status(502).json({ error: "Couldn't scan that menu right now. Please try again." });
  }

  if (response.stop_reason === "refusal") {
    return res.status(422).json({ error: "Couldn't read that image. Try a clearer photo of the menu." });
  }

  if (response.parsed_output == null) {
    console.error("scan-menu: no parsed_output, stop_reason =", response.stop_reason);
    return res.status(502).json({ error: "Couldn't make sense of that menu. Try a clearer, well-lit photo." });
  }

  return res.status(200).json(response.parsed_output);
}
