import { Navigate, Route, Routes } from "react-router-dom";
import { useShopState } from "../../context/ShopContext";
import AdminLayout from "./AdminLayout";
import OverviewPage from "./OverviewPage";
import OrderKDSPage from "./OrderKDSPage";
import MenuBrandManagerPage from "./MenuBrandManagerPage";
import CrmPage from "./CrmPage";
import MarketingPage from "./MarketingPage";
import DeliveryDispatchPage from "./DeliveryDispatchPage";
import ReputationPage from "./ReputationPage";
import PayoutsPage from "./PayoutsPage";

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
        <Route path="menu" element={<MenuBrandManagerPage />} />
        <Route path="crm" element={<CrmPage />} />
        <Route path="marketing" element={<MarketingPage />} />
        <Route path="reputation" element={<ReputationPage />} />
        <Route path="payouts" element={<PayoutsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}
