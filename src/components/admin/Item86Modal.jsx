import { Ban, CheckCircle2 } from "lucide-react";
import { useShopActions } from "../../context/ShopContext";
import Modal from "../shared/Modal";
import Button from "../shared/Button";

export default function Item86Modal({ item, onClose }) {
  const { updateItem } = useShopActions();
  if (!item) return null;
  const unavailable = item.isAvailable === false;

  const toggle = () => {
    updateItem(item.id, { isAvailable: unavailable ? true : false });
    onClose();
  };

  return (
    <Modal open={!!item} onClose={onClose} title={item.name}>
      <div className="space-y-4 text-center">
        <span
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
            unavailable ? "bg-[#E31837]/10 text-[#E31837]" : "bg-[#00A651]/10 text-[#00A651]"
          }`}
        >
          {unavailable ? <Ban size={26} /> : <CheckCircle2 size={26} />}
        </span>
        <p className="text-sm text-gray-500 dark:text-white/50">
          {unavailable
            ? "This item is marked Sold Out — it's hidden from checkout on the POS and storefront."
            : "This item is available for ordering right now."}
        </p>
        <Button size="lg" className="w-full" variant={unavailable ? "secondary" : "danger"} onClick={toggle}>
          {unavailable ? "Bring Back In Stock" : "86 This Item — Mark Sold Out"}
        </Button>
      </div>
    </Modal>
  );
}
