import { useState } from "react";
import { Clock, Palette, Pencil, Plus, ShoppingBag, Timer, Trash2, Type } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { CATEGORIES } from "../../data/menuScan";
import { COLOR_SWATCHES, FONT_OPTIONS } from "../../data/brand";
import { formatCurrency } from "../../utils/helpers";
import Card from "../shared/Card";
import Button from "../shared/Button";
import Modal from "../shared/Modal";
import Toggle from "../shared/Toggle";
import { FormField, TextInput } from "../shared/FormField";
import ItemFormModal from "./ItemFormModal";

export default function MenuBrandManagerPage() {
  const { shop, items } = useShopState();
  const { updateShop, addItem, updateItem, deleteItem } = useShopActions();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const openAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };
  const openEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };
  const handleSave = (form) => (editingItem ? updateItem(editingItem.id, form) : addItem(form));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Menu & Brand Manager</h1>
        <p className="text-sm text-gray-500">Every change here saves instantly and appears live on your white-labeled site.</p>
      </div>

      <Card title="Brand Color" description="Used across your public site's header, buttons, and accents." icon={Palette}>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={shop.primaryColor}
            onChange={(e) => updateShop({ primaryColor: e.target.value })}
            className="h-11 w-11 cursor-pointer rounded-lg border border-gray-200 bg-white p-1"
          />
          <span className="font-mono text-sm text-gray-600">{shop.primaryColor}</span>
        </div>
        <div className="mt-3 flex gap-2">
          {COLOR_SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => updateShop({ primaryColor: c })}
              style={{ backgroundColor: c }}
              className={`h-7 w-7 rounded-full ring-offset-2 transition ${
                shop.primaryColor === c ? "ring-2 ring-gray-900" : "hover:scale-110"
              }`}
            />
          ))}
        </div>
      </Card>

      <Card title="Storefront Typography" description="Your site's own look — independent of the DeepDish dashboard." icon={Type}>
        <div className="grid gap-3 sm:grid-cols-3">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.id}
              onClick={() => updateShop({ font: font.id })}
              className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition ${
                shop.font === font.id ? "border-[#E31837] bg-red-50/50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <span style={{ fontFamily: font.family }} className="text-2xl text-gray-900">
                Aa
              </span>
              <span className="text-xs font-semibold text-gray-600">{font.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Hours & Order Settings" icon={Clock}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Opening Time">
            <TextInput
              type="time"
              value={shop.hours.open}
              onChange={(e) => updateShop({ hours: { ...shop.hours, open: e.target.value } })}
            />
          </FormField>
          <FormField label="Closing Time">
            <TextInput
              type="time"
              value={shop.hours.close}
              onChange={(e) => updateShop({ hours: { ...shop.hours, close: e.target.value } })}
            />
          </FormField>
        </div>
        <div className="mt-4 border-t border-gray-100 pt-4">
          <FormField label="Default prep time (minutes)" hint="Drives the automated countdown on your Live Order KDS.">
            <TextInput
              type="number"
              min={1}
              max={120}
              value={shop.prepMinutes}
              onChange={(e) => updateShop({ prepMinutes: Math.max(1, Number(e.target.value) || 1) })}
              className="max-w-[160px]"
            />
          </FormField>
        </div>
        <div className="mt-4 border-t border-gray-100 pt-4">
          <Toggle
            checked={shop.acceptingOrders}
            onChange={(val) => updateShop({ acceptingOrders: val })}
            label={shop.acceptingOrders ? "Accepting Orders" : "Paused — not accepting orders"}
            description="Customers see a friendly notice on your site while paused."
          />
        </div>
      </Card>

      <Card
        title="Menu Items"
        icon={ShoppingBag}
        action={
          <Button variant="primary" size="sm" icon={Plus} onClick={openAdd}>
            Add Item
          </Button>
        }
      >
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400">
            <ShoppingBag size={28} />
            <p className="text-sm">No menu items yet. Add your first one.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {CATEGORIES.map((category) => {
              const catItems = items.filter((i) => i.category === category);
              if (catItems.length === 0) return null;
              return (
                <div key={category}>
                  <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wide text-gray-400">{category}</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {catItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 p-3 transition hover:border-gray-300 hover:shadow-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-gray-900">{item.name}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{item.description}</p>
                          <p className="mt-1.5 text-sm font-bold text-[#E31837]">{formatCurrency(item.price)}</p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            onClick={() => openEdit(item)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <ItemFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initialItem={editingItem} />

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Item" maxWidth="max-w-sm">
        <p className="text-sm text-gray-600">
          Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              deleteItem(deleteTarget.id);
              setDeleteTarget(null);
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
