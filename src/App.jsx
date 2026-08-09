import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ShopProvider } from "./context/ShopContext";
import LandingPage from "./components/landing/LandingPage";
import OnboardingWizard from "./components/onboarding/OnboardingWizard";
import AdminApp from "./components/admin/AdminApp";
import PosPage from "./components/admin/PosPage";
import DispatchTerminalPage from "./components/admin/DispatchTerminalPage";
import DriverAppPage from "./components/driver/DriverAppPage";
import PublicStorefront from "./components/storefront/PublicStorefront";
import CareersPage from "./components/storefront/CareersPage";
import PayOrderPage from "./components/payment/PayOrderPage";
import AgentEventHost from "./components/shared/AgentEventHost";

function App() {
  return (
    <ShopProvider>
      <BrowserRouter>
        <AgentEventHost />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<OnboardingWizard />} />
          {/* Full-screen kiosk modes — deliberately outside AdminLayout's sidebar for speed on a tablet. */}
          <Route path="/admin/pos" element={<PosPage />} />
          <Route path="/admin/dispatch-terminal" element={<DispatchTerminalPage />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/driver/:token" element={<DriverAppPage />} />
          <Route path="/pay/:orderId" element={<PayOrderPage />} />
          <Route path="/:slug/careers" element={<CareersPage />} />
          <Route path="/:slug" element={<PublicStorefront />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ShopProvider>
  );
}

export default App;
