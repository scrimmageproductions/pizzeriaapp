import { useState } from "react";
import { AppProvider } from "./context/AppContext";
import AdminDashboard from "./components/admin/AdminDashboard";
import Storefront from "./components/storefront/Storefront";

function App() {
  const [view, setView] = useState("admin");

  return (
    <AppProvider>
      {/* Both views stay mounted so the customer's cart / active order tracker survives
          toggling back and forth to preview admin changes live. */}
      <div className={view === "admin" ? "block" : "hidden"}>
        <AdminDashboard onPreviewStorefront={() => setView("storefront")} />
      </div>
      <div className={view === "storefront" ? "block" : "hidden"}>
        <Storefront onBackToAdmin={() => setView("admin")} />
      </div>
    </AppProvider>
  );
}

export default App;
