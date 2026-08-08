import { Navigate, Route, Routes } from "react-router-dom";
import { useShopState } from "../../context/ShopContext";
import AdminLayout from "./AdminLayout";
import OverviewPage from "./OverviewPage";
import MenuManagerPage from "./MenuManagerPage";
import StoreSettingsPage from "./StoreSettingsPage";
import OrderKDSPage from "./OrderKDSPage";

export default function AdminApp() {
  const { shop } = useShopState();

  // No shop set up yet — send them through the onboarding wizard first.
  if (!shop) return <Navigate to="/onboarding" replace />;

  return (
    <AdminLayout>
      <Routes>
        <Route index element={<OverviewPage />} />
        <Route path="menu" element={<MenuManagerPage />} />
        <Route path="settings" element={<StoreSettingsPage />} />
        <Route path="kds" element={<OrderKDSPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}
