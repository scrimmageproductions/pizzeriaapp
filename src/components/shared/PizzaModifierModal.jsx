import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { PIZZA_TOPPINGS } from "../../data/toppings";
import { formatCurrency, uid } from "../../utils/helpers";
import Modal from "./Modal";
import Button from "./Button";

const MODES = [
  { key: "whole", label: "Whole" },
  { key: "left", label: "Left Half" },
  { key: "right", label: "Right Half" },
];

function toppingsTotal(toppingState) {
  return PIZZA_TOPPINGS.reduce((sum, t) => {
    const sel = toppingState[t.id];
    if (!sel) return sum;
    let add = 0;
    if (sel.whole) add += t.price;
    if (sel.left) add += t.price / 2;
    if (sel.right) add += t.price / 2;
    return sum + add;
  }, 0);
}

/** Formats the split for the kitchen: e.g. "Pepperoni\n[Left]: Mushrooms\n[Right]: Onions, Extra Cheese". */
function formatModifierText(toppingState) {
  const whole = [];
  const left = [];
  const right = [];
  for (const t of PIZZA_TOPPINGS) {
    const sel = toppingState[t.id];
    if (!sel) continue;
    if (sel.whole) whole.push(t.name);
    if (sel.left) left.push(t.name);
    if (sel.right) right.push(t.name);
  }
  const lines = [];
  if (whole.length) lines.push(whole.join(", "));
  if (left.length || right.length) {
    lines.push(`[Left]: ${left.join(", ") || "Plain"}`);
    lines.push(`[Right]: ${right.join(", ") || "Plain"}`);
  }
  return lines.join("\n");
}

export default function PizzaModifierModal({ open, item, primaryColor, onClose, onAdd }) {
  const [sizeIndex, setSizeIndex] = useState(0);
  const [mode, setMode] = useState("whole");
  const [toppingState, setToppingState] = useState({});

  useEffect(() => {
    if (open) {
      setSizeIndex(0);
      setMode("whole");
      setToppingState({});
    }
  }, [open, item?.id]);

  if (!item) return null;
  const size = item.sizes[sizeIndex];
  const total = (size?.price || 0) + toppingsTotal(toppingState);

  const toggleTopping = (id) => {
    setToppingState((prev) => ({
      ...prev,
      [id]: { ...prev[id], [mode]: !prev[id]?.[mode] },
    }));
  };

  const handleAdd = () => {
    const modifiers = formatModifierText(toppingState);
    onAdd({
      id: `${item.id}::${size.label}::${uid("mod")}`,
      name: `${item.name} (${size.label})`,
      price: +total.toFixed(2),
      modifiers: modifiers || null,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={item.name} maxWidth="max-w-lg">
      <div className="space-y-5">
        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">Size</p>
          <div className="flex flex-wrap gap-2">
            {item.sizes.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setSizeIndex(i)}
                className={`rounded-xl border-2 px-3 py-2 text-sm font-bold transition ${
                  i === sizeIndex ? "text-white" : "border-gray-200 text-gray-600"
                }`}
                style={i === sizeIndex ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
              >
                {s.label} — {formatCurrency(s.price)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">Split</p>
          <div className="grid grid-cols-3 gap-2">
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`rounded-xl border-2 py-2.5 text-sm font-bold transition ${
                  mode === m.key ? "text-white" : "border-gray-200 text-gray-600"
                }`}
                style={mode === m.key ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-gray-400">
            Toppings you tap below apply to whichever split is selected — a half-pizza topping is charged at half price.
          </p>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">Toppings</p>
          <div className="grid grid-cols-2 gap-2">
            {PIZZA_TOPPINGS.map((t) => {
              const sel = toppingState[t.id];
              const active = !!sel?.[mode];
              const onWhole = !!sel?.whole;
              const onLeft = !!sel?.left;
              const onRight = !!sel?.right;
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTopping(t.id)}
                  className={`flex items-center justify-between rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition ${
                    active ? "border-current" : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                  style={active ? { color: primaryColor, backgroundColor: `${primaryColor}0d` } : undefined}
                >
                  <span>
                    {t.name}
                    {(onWhole || onLeft || onRight) && (
                      <span className="ml-1.5 text-[10px] font-bold text-gray-400">
                        {onWhole ? "(Whole)" : [onLeft && "L", onRight && "R"].filter(Boolean).join("+")}
                      </span>
                    )}
                  </span>
                  {active ? <Check size={16} /> : <span className="text-xs text-gray-400">+{formatCurrency(t.price)}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <Button size="lg" className="w-full py-3.5" style={{ backgroundColor: primaryColor }} onClick={handleAdd}>
          Add to Cart — {formatCurrency(total)}
        </Button>
      </div>
    </Modal>
  );
}
