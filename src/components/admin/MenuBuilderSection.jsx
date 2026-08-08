import { useState } from "react";
import * as Icons from "lucide-react";
import { Plus, Pencil, Trash2, Sparkles, Star, UtensilsCrossed } from "lucide-react";
import { useAppActions, useAppState } from "../../context/AppContext";
import Card from "../shared/Card";
import Button from "../shared/Button";
import Modal from "../shared/Modal";
import { FormField, TextInput } from "../shared/FormField";
import ItemFormModal from "./ItemFormModal";
import AIScannerModal from "./AIScannerModal";
import { formatCurrency } from "../../utils/helpers";

function CategoryIcon({ name, ...props }) {
  const IconComp = Icons[name] || UtensilsCrossed;
  return <IconComp {...props} />;
}

export default function MenuBuilderSection() {
  const { categories, items } = useAppState();
  const { addCategory, deleteCategory, addItem, updateItem, deleteItem, importItems } = useAppActions();

  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState(null);

  const activeCategory = categories.find((c) => c.id === activeCategoryId) || categories[0];
  const categoryItems = items.filter((i) => i.categoryId === activeCategory?.id);

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCategory({ name: newCategoryName.trim() });
    setNewCategoryName("");
    setCategoryModalOpen(false);
  };

  const confirmDeleteCategory = () => {
    if (!deleteCategoryTarget) return;
    deleteCategory(deleteCategoryTarget.id);
    if (activeCategoryId === deleteCategoryTarget.id) {
      const remaining = categories.filter((c) => c.id !== deleteCategoryTarget.id);
      setActiveCategoryId(remaining[0]?.id);
    }
    setDeleteCategoryTarget(null);
  };

  const openAddItem = () => {
    setEditingItem(null);
    setItemModalOpen(true);
  };

  const openEditItem = (item) => {
    setEditingItem(item);
    setItemModalOpen(true);
  };

  const handleSaveItem = (form) => {
    if (editingItem) {
      updateItem(editingItem.id, form);
    } else {
      addItem(form);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-[#F39C12]/40 bg-gradient-to-r from-[#F39C12]/10 to-transparent p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F39C12] text-white">
            <Sparkles size={22} />
          </span>
          <div>
            <h3 className="font-bold text-gray-900">AI Menu Scanner</h3>
            <p className="text-sm text-gray-500">
              Snap or upload your paper menu and let AI auto-populate items for you.
            </p>
          </div>
        </div>
        <Button variant="primary" icon={Sparkles} onClick={() => setScannerOpen(true)} className="shrink-0">
          Scan Paper Menu
        </Button>
      </div>

      <Card
        title="Categories"
        action={
          <Button variant="outline" size="sm" icon={Plus} onClick={() => setCategoryModalOpen(true)}>
            Add Category
          </Button>
        }
      >
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div key={cat.id} className="group relative">
              <button
                onClick={() => setActiveCategoryId(cat.id)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  activeCategory?.id === cat.id
                    ? "border-[#E31837] bg-[#E31837] text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <CategoryIcon name={cat.icon} size={15} />
                {cat.name}
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    activeCategory?.id === cat.id ? "bg-white/20" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {items.filter((i) => i.categoryId === cat.id).length}
                </span>
              </button>
              <button
                onClick={() => setDeleteCategoryTarget(cat)}
                className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-white shadow group-hover:flex"
                title="Delete category"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title={activeCategory ? `${activeCategory.name} Items` : "Items"}
        action={
          <Button variant="primary" size="sm" icon={Plus} onClick={openAddItem} disabled={!activeCategory}>
            Add Item
          </Button>
        }
      >
        {categoryItems.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400">
            <UtensilsCrossed size={28} />
            <p className="text-sm">No items in this category yet.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {categoryItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-xl border border-gray-200 p-3 transition hover:border-gray-300 hover:shadow-sm"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-bold text-gray-900">{item.name}</p>
                    <span className="shrink-0 text-sm font-bold text-[#E31837]">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{item.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {item.popular && (
                      <span className="flex items-center gap-1 rounded-full bg-[#F39C12]/10 px-2 py-0.5 text-[10px] font-bold text-[#F39C12]">
                        <Star size={10} fill="currentColor" /> Popular
                      </span>
                    )}
                    <div className="ml-auto flex gap-1">
                      <button
                        onClick={() => openEditItem(item)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ItemFormModal
        open={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        onSave={handleSaveItem}
        categories={categories}
        initialItem={editingItem}
      />

      <AIScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        categoryId={activeCategory?.id}
        onImport={importItems}
      />

      <Modal open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} title="Add Category">
        <form onSubmit={handleAddCategory} className="space-y-4">
          <FormField label="Category Name">
            <TextInput
              autoFocus
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. Calzones"
            />
          </FormField>
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Category
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteCategoryTarget}
        onClose={() => setDeleteCategoryTarget(null)}
        title="Delete Category"
        maxWidth="max-w-sm"
      >
        <p className="text-sm text-gray-600">
          Delete <strong>{deleteCategoryTarget?.name}</strong> and all its items? This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteCategoryTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteCategory}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
