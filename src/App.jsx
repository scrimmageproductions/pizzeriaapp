import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ShopProvider } from "./context/ShopContext";
import { ThemeProvider } from "./context/ThemeContext";
import LandingPage from "./components/landing/LandingPage";
import OnboardingWizard from "./components/onboarding/OnboardingWizard";
import AdminApp from "./components/admin/AdminApp";
import PosPage from "./components/admin/PosPage";
import PublicStorefront from "./components/storefront/PublicStorefront";
import PayOrderPage from "./components/payment/PayOrderPage";
import PagerPage from "./components/pager/PagerPage";
import FeedbackPage from "./components/feedback/FeedbackPage";

function App() {
  return (
    <ThemeProvider>
      <ShopProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/onboarding" element={<OnboardingWizard />} />
            {/* Full-screen kiosk mode — deliberately outside AdminLayout's sidebar for speed on a tablet. */}
            <Route path="/admin/pos" element={<PosPage />} />
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="/pay/:orderId" element={<PayOrderPage />} />
            <Route path="/pager/:orderId" element={<PagerPage />} />
            <Route path="/feedback/:orderId" element={<FeedbackPage />} />
            <Route path="/:slug" element={<PublicStorefront />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ShopProvider>
    </ThemeProvider>
  );
}

export default App;
