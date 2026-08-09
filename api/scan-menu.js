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
// Don't let a stalled upstream request hang a serverless invocation indefinitely — time out and
// fall back to the demo-mode mock rather than have the client wait on a dead connection.
const REQUEST_TIMEOUT_MS = 25_000;

// Served whenever the real Vision call can't run — no ANTHROPIC_API_KEY configured, the request
// errors, times out, gets refused, or otherwise fails to parse. Shaped exactly like a real
// response so the frontend's review grid works identically; the `demo: true` flag is the only
// difference, and is how the client knows to show the "Demo Mode" notice instead of pretending
// this came from a live scan.
const MOCK_MENU_RESULT = {
  categories: [
    {
      name: "Specialty Pizzas",
      items: [
        {
          name: "The Godfather",
          description: "Pepperoni, hot honey, calabrian chili, fresh mozzarella",
          prices: [
            { size: "Small", price: 16.99 },
            { size: "Medium", price: 20.99 },
            { size: "Large", price: 24.99 },
          ],
        },
        {
          name: "White Truffle Pie",
          description: "Ricotta, mozzarella, truffle oil, cracked black pepper",
          prices: [
            { size: "Small", price: 17.99 },
            { size: "Large", price: 25.99 },
          ],
        },
        {
          name: "Margherita",
          description: "San Marzano tomato, fresh basil, fresh mozzarella",
          prices: [
            { size: "Small", price: 14.99 },
            { size: "Medium", price: 18.99 },
            { size: "Large", price: 22.99 },
          ],
        },
      ],
    },
    {
      name: "Appetizers",
      items: [
        { name: "Garlic Knots", description: "Six knots, garlic butter, shaved parmesan", prices: [{ size: null, price: 7.5 }] },
        { name: "Fried Calamari", description: "Lightly fried, served with house marinara", prices: [{ size: null, price: 12.5 }] },
        { name: "Loaded Fries", description: "Mozzarella, bacon, ranch drizzle", prices: [{ size: null, price: 9.0 }] },
      ],
    },
  ],
};

function sendDemoFallback(res, reason, err) {
  if (err) console.error(`scan-menu: ${reason} — serving demo-mode mock menu`, err);
  else console.warn(`scan-menu: ${reason} — serving demo-mode mock menu`);
  return res.status(200).json({ ...MOCK_MENU_RESULT, demo: true });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
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

  // Bulletproof for the prototype environment: a missing key or any failure of the live call
  // (network error, timeout, refusal, unparseable output) degrades to a realistic mock instead of
  // a 500 — the onboarding flow, loading animation, and editable review grid all keep working.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return sendDemoFallback(res, "ANTHROPIC_API_KEY is not configured");
  }

  const client = new Anthropic({ apiKey, timeout: REQUEST_TIMEOUT_MS });

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
    return sendDemoFallback(res, "Anthropic request failed or timed out", err);
  }

  if (response.stop_reason === "refusal") {
    return sendDemoFallback(res, "Claude declined to read the image");
  }

  if (response.parsed_output == null) {
    return sendDemoFallback(res, `no parsed_output (stop_reason = ${response.stop_reason})`);
  }

  return res.status(200).json(response.parsed_output);
}
