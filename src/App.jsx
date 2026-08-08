import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ShopProvider } from "./context/ShopContext";
import LandingPage from "./components/landing/LandingPage";
import OnboardingWizard from "./components/onboarding/OnboardingWizard";
import AdminApp from "./components/admin/AdminApp";
import PublicStorefront from "./components/storefront/PublicStorefront";

function App() {
  return (
    <ShopProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<OnboardingWizard />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/:slug" element={<PublicStorefront />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ShopProvider>
  );
}

export default App;
