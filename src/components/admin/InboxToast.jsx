import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useShopState } from "../../context/ShopContext";
import Toast from "../shared/Toast";

/**
 * Drop this into any admin screen (POS, KDS) to get a slide-down toast whenever a new customer
 * text lands, without wiring the Inbox's message state into that page directly.
 */
export default function InboxToast() {
  const { conversations } = useShopState();
  const navigate = useNavigate();
  const [toast, setToast] = useState("");
  const prevCountRef = useRef(null);

  const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);

  useEffect(() => {
    if (prevCountRef.current !== null && totalMessages > prevCountRef.current) {
      let latest = null;
      for (const c of conversations) {
        const lastMsg = c.messages[c.messages.length - 1];
        if (lastMsg?.sender === "customer" && (!latest || lastMsg.createdAt > latest.msg.createdAt)) {
          latest = { msg: lastMsg, name: c.customerName };
        }
      }
      if (latest) {
        setToast(`${latest.name}: ${latest.msg.text}`);
        const timeout = setTimeout(() => setToast(""), 5000);
        prevCountRef.current = totalMessages;
        return () => clearTimeout(timeout);
      }
    }
    prevCountRef.current = totalMessages;
  }, [totalMessages, conversations]);

  return (
    <Toast
      show={!!toast}
      message={toast}
      icon={MessageCircle}
      onClick={() => {
        setToast("");
        navigate("/admin/inbox");
      }}
    />
  );
}
