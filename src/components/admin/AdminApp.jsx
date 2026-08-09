import { Navigate, Route, Routes } from "react-router-dom";
import { useShopState } from "../../context/ShopContext";
import AdminLayout from "./AdminLayout";
import OverviewPage from "./OverviewPage";
import OrderKDSPage from "./OrderKDSPage";
import MenuBrandManagerPage from "./MenuBrandManagerPage";
import CrmPage from "./CrmPage";
import MarketingPage from "./MarketingPage";
import DeliveryDispatchPage from "./DeliveryDispatchPage";
import InventoryPage from "./InventoryPage";
import PrinterSettingsPage from "./PrinterSettingsPage";
import BillingPage from "./BillingPage";
import IntegrationsPage from "./IntegrationsPage";
import TeamDriversPage from "./TeamDriversPage";
import ShiftReportsPage from "./ShiftReportsPage";
import EODPage from "./EODPage";
import SupplyStorePage from "./SupplyStorePage";
import CustomBrandStudioPage from "./CustomBrandStudioPage";

export default function AdminApp() {
  const { shop } = useShopState();

  // No shop set up yet — send them through the onboarding wizard first.
  if (!shop) return <Navigate to="/onboarding" replace />;

  return (
    <AdminLayout>
      <Routes>
        <Route index element={<OverviewPage />} />
        <Route path="kds" element={<OrderKDSPage />} />
        <Route path="delivery" element={<DeliveryDispatchPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="menu" element={<MenuBrandManagerPage />} />
        <Route path="crm" element={<CrmPage />} />
        <Route path="marketing" element={<MarketingPage />} />
        <Route path="printers" element={<PrinterSettingsPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="team" element={<TeamDriversPage />} />
        <Route path="reports" element={<ShiftReportsPage />} />
        <Route path="eod" element={<EODPage />} />
        <Route path="supply-store" element={<SupplyStorePage />} />
        <Route path="supply-store/custom" element={<CustomBrandStudioPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}
