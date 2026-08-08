import { useState } from "react";
import { AppProvider } from "./context/AppContext";
import TopToggle from "./components/shared/TopToggle";
import AdminDashboard from "./components/admin/AdminDashboard";
import Storefront from "./components/storefront/Storefront";

function App() {
  const [view, setView] = useState("admin");

  return (
    <AppProvider>
      <TopToggle view={view} onChange={setView} />
      {/* Both views stay mounted so the customer's cart / active order tracker survives
          toggling back and forth to preview admin changes live. */}
      <div className={view === "admin" ? "block" : "hidden"}>
        <AdminDashboard />
      </div>
      <div className={view === "storefront" ? "block" : "hidden"}>
        <Storefront />
      </div>
    </AppProvider>
  );
}

export default App;
