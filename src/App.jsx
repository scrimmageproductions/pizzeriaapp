import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ShopProvider } from "./context/ShopContext";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./components/landing/LandingPage";
import OnboardingWizard from "./components/onboarding/OnboardingWizard";
import AdminApp from "./components/admin/AdminApp";
import PosPage from "./components/admin/PosPage";
import DispatchTerminalPage from "./components/admin/DispatchTerminalPage";
import DriverAppPage from "./components/driver/DriverAppPage";
import PublicStorefront from "./components/storefront/PublicStorefront";
import CareersPage from "./components/storefront/CareersPage";
import PayOrderPage from "./components/payment/PayOrderPage";
import LoginPage from "./components/auth/LoginPage";
import RequireAuth from "./components/auth/RequireAuth";
import AgentEventHost from "./components/shared/AgentEventHost";
import WaitTimeSync from "./components/shared/WaitTimeSync";

function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <BrowserRouter>
          <AgentEventHost />
          <WaitTimeSync />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/onboarding" element={<OnboardingWizard />} />
            <Route path="/login" element={<LoginPage />} />
            {/* Full-screen kiosk modes — deliberately outside AdminLayout's sidebar for speed on a tablet. */}
            <Route element={<RequireAuth />}>
              <Route path="/admin/pos" element={<PosPage />} />
              <Route path="/admin/dispatch-terminal" element={<DispatchTerminalPage />} />
              <Route path="/admin/*" element={<AdminApp />} />
            </Route>
            <Route path="/driver/:token" element={<DriverAppPage />} />
            <Route path="/pay/:orderId" element={<PayOrderPage />} />
            <Route path="/:slug/careers" element={<CareersPage />} />
            <Route path="/:slug" element={<PublicStorefront />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ShopProvider>
    </AuthProvider>
  );
}

export default App;
