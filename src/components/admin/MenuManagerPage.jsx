import { useState } from "react";
import { Pencil, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { CATEGORIES } from "../../data/menuScan";
import { formatCurrency } from "../../utils/helpers";
import Card from "../shared/Card";
import Button from "../shared/Button";
import Modal from "../shared/Modal";
import ItemFormModal from "./ItemFormModal";

export default function MenuManagerPage() {
  const { items } = useShopState();
  const { addItem, updateItem, deleteItem } = useShopActions();

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Menu Manager</h1>
          <p className="text-sm text-gray-500">Changes save instantly and appear live on your site.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openAdd}>
          Add Item
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400">
            <ShoppingBag size={28} />
            <p className="text-sm">No menu items yet. Add your first one.</p>
          </div>
        </Card>
      ) : (
        CATEGORIES.map((category) => {
          const catItems = items.filter((i) => i.category === category);
          if (catItems.length === 0) return null;
          return (
            <Card key={category} title={category}>
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
            </Card>
          );
        })
      )}

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
