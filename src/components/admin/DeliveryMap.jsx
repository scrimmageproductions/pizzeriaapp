import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom emoji-in-a-circle markers — sidesteps Leaflet's default marker image paths, which
// break under Vite's asset bundling unless manually patched.
function pinIcon({ bg, symbol, size = 34, ring = false }) {
  return L.divIcon({
    className: "",
    html: `<div style="
        background:${bg};
        width:${size}px;height:${size}px;border-radius:9999px;
        display:flex;align-items:center;justify-content:center;
        font-size:${size * 0.5}px;
        border:3px solid white;
        box-shadow:0 3px 8px rgba(0,0,0,0.35)${ring ? `, 0 0 0 5px ${bg}55` : ""};
      ">${symbol}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

const SHOP_ICON = pinIcon({ bg: "#121212", symbol: "🏬", size: 36 });
const READY_ICON = pinIcon({ bg: "#F39C12", symbol: "🍕" });
const DISPATCHED_ICON = pinIcon({ bg: "#00A651", symbol: "🛵" });
const SELECTED_READY_ICON = pinIcon({ bg: "#F39C12", symbol: "🍕", size: 42, ring: true });
const SELECTED_DISPATCHED_ICON = pinIcon({ bg: "#00A651", symbol: "🛵", size: 42, ring: true });

function FlyToOrder({ order }) {
  const map = useMap();
  useEffect(() => {
    if (order?.lat != null) {
      map.flyTo([order.lat, order.lng], Math.max(map.getZoom(), 14), { duration: 0.6 });
    }
  }, [order?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function DeliveryMap({ shop, orders, selectedOrderId }) {
  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  return (
    <MapContainer
      center={[shop.lat, shop.lng]}
      zoom={13}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
      className="rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[shop.lat, shop.lng]} icon={SHOP_ICON}>
        <Popup>
          <strong>{shop.name}</strong>
          <br />
          Store location
        </Popup>
      </Marker>

      {orders.map((order) => {
        if (order.lat == null) return null;
        const isSelected = order.id === selectedOrderId;
        const dispatched = !!order.assignedDriver;
        const icon = isSelected
          ? dispatched
            ? SELECTED_DISPATCHED_ICON
            : SELECTED_READY_ICON
          : dispatched
          ? DISPATCHED_ICON
          : READY_ICON;
        return (
          <Marker key={order.id} position={[order.lat, order.lng]} icon={icon}>
            <Popup>
              <strong>{order.id}</strong> — {order.customerName}
              <br />
              {order.address}
              <br />
              {dispatched ? `Out for delivery with ${order.assignedDriver}` : "Ready — awaiting driver"}
            </Popup>
          </Marker>
        );
      })}

      <FlyToOrder order={selectedOrder} />
    </MapContainer>
  );
}
