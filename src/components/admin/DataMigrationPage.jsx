import { useState } from "react";
import { Boxes, Database, Download, Pizza, Users } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import { CATEGORIES } from "../../data/menuScan";
import { downloadCsv, sanitizePhone } from "../../utils/csv";
import { formatCurrency } from "../../utils/helpers";
import Card from "../shared/Card";
import Button from "../shared/Button";
import Toast from "../shared/Toast";
import CsvImportPanel from "./CsvImportPanel";

const MENU_FIELDS = [
  { key: "name", label: "Item Name", required: true, synonyms: ["itemname", "name", "item", "product", "title"] },
  { key: "price", label: "Price", required: true, synonyms: ["price", "cost", "amount"] },
  { key: "category", label: "Category", required: false, synonyms: ["category", "type", "section"] },
  { key: "description", label: "Description", required: false, synonyms: ["description", "desc", "details"] },
];

const INVENTORY_FIELDS = [
  { key: "name", label: "Item Name", required: true, synonyms: ["itemname", "item", "name", "product", "ingredient"] },
  { key: "quantity", label: "Quantity", required: true, synonyms: ["quantity", "qty", "count", "stock", "onhand"] },
  { key: "unitType", label: "Unit Type", required: true, synonyms: ["unittype", "unit", "uom", "measure"] },
  { key: "vendorCost", label: "Vendor Cost", required: true, synonyms: ["vendorcost", "cost", "price", "vendor"] },
];

const CUSTOMER_FIELDS = [
  { key: "name", label: "Name", required: true, synonyms: ["name", "customer", "fullname", "customername"] },
  { key: "phone", label: "Phone Number", required: true, synonyms: ["phonenumber", "phone", "cell", "mobile", "contact", "telephone"] },
  { key: "email", label: "Email", required: false, synonyms: ["email", "mail", "emailaddress"] },
  { key: "totalOrders", label: "Total Orders", required: false, synonyms: ["totalorders", "orders", "ordercount", "visits"] },
];

function buildPayrollRows(shiftReports, driverCashouts) {
  const byKey = new Map();
  const keyOf = (name, date) => `${name}|${date}`;

  shiftReports.forEach((s) => {
    byKey.set(keyOf(s.employeeName, s.date), {
      employeeName: s.employeeName,
      date: s.date,
      hoursWorked: s.hoursWorked,
      cashTips: s.cashTips,
      mileageOwed: 0,
    });
  });
  driverCashouts.forEach((d) => {
    const key = keyOf(d.employeeName, d.date);
    const existing = byKey.get(key);
    if (existing) {
      existing.mileageOwed += d.mileageOwed;
    } else {
      byKey.set(key, { employeeName: d.employeeName, date: d.date, hoursWorked: 0, cashTips: 0, mileageOwed: d.mileageOwed });
    }
  });

  return [...byKey.values()].sort((a, b) => a.date.localeCompare(b.date) || a.employeeName.localeCompare(b.employeeName));
}

export default function DataMigrationPage() {
  const { items, inventory, customers, shiftReports, driverCashouts } = useShopState();
  const { importScannedItems, importInventory, importCustomers } = useShopActions();
  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3200);
  };

  const handleExportPayroll = () => {
    const rows = buildPayrollRows(shiftReports, driverCashouts);
    downloadCsv(
      "deepdish_payroll_export.csv",
      ["Employee Name", "Date", "Hours Worked", "Cash Tips", "Mileage Owed"],
      rows.map((r) => [r.employeeName, r.date, r.hoursWorked.toFixed(2), r.cashTips.toFixed(2), r.mileageOwed.toFixed(2)])
    );
    showToast(`Exported ${rows.length} payroll rows to deepdish_payroll_export.csv`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Toast show={!!toast} message={toast} icon={Database} />

      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Data & Migration</h1>
        <p className="text-sm text-gray-500 dark:text-white/40">Bring your spreadsheets in, no reformatting required — and take your data back out any time.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <CsvImportPanel
          icon={Pizza}
          title="Import Menu"
          description={`${items.length} items currently live. Add more from a spreadsheet.`}
          accent="#E31837"
          fields={MENU_FIELDS}
          templateFilename="deepdish_menu_template.csv"
          templateHeaders={["Item Name", "Price", "Category", "Description"]}
          templateSampleRow={["Pepperoni Classic", "18.00", "Pizzas", "Double pepperoni, house mozzarella blend, oregano."]}
          transformRow={(row) => {
            const name = String(row.name || "").trim();
            const price = parseFloat(row.price);
            if (!name || !Number.isFinite(price)) return null;
            const category = CATEGORIES.includes(String(row.category || "").trim()) ? row.category.trim() : CATEGORIES[0];
            return { name, price, category, description: String(row.description || "").trim() };
          }}
          onImport={(rows) => {
            importScannedItems(rows);
            return rows.length;
          }}
          successMessage={(n) => `Success! ${n} menu item${n === 1 ? "" : "s"} imported.`}
          onSuccess={showToast}
        />

        <CsvImportPanel
          icon={Boxes}
          title="Import Inventory"
          description={`${inventory.length} items tracked. Sync your stock counts and vendor costs.`}
          accent="#0EA5E9"
          fields={INVENTORY_FIELDS}
          templateFilename="deepdish_inventory_template.csv"
          templateHeaders={["Item Name", "Quantity", "Unit Type", "Vendor Cost"]}
          templateSampleRow={["Mozzarella Cheese", "25", "lbs", "62.50"]}
          transformRow={(row) => {
            const name = String(row.name || "").trim();
            const quantity = parseFloat(row.quantity);
            if (!name || !Number.isFinite(quantity)) return null;
            return {
              name,
              quantity,
              unitType: String(row.unitType || "units").trim() || "units",
              vendorCost: parseFloat(row.vendorCost) || 0,
            };
          }}
          onImport={(rows) => {
            importInventory(rows);
            return rows.length;
          }}
          successMessage={(n) => `Success! ${n} inventory item${n === 1 ? "" : "s"} imported.`}
          onSuccess={showToast}
        />

        <CsvImportPanel
          icon={Users}
          title="Import Customer List"
          description={`${customers.length} customers in your CRM. Bring in your list from any POS or spreadsheet.`}
          accent="#00A651"
          fields={CUSTOMER_FIELDS}
          templateFilename="deepdish_customers_template.csv"
          templateHeaders={["Name", "Phone Number", "Email", "Total Orders"]}
          templateSampleRow={["Maria Gonzalez", "(555) 201-4471", "maria.g@example.com", "12"]}
          transformRow={(row) => {
            const name = String(row.name || "").trim();
            const phone = sanitizePhone(row.phone);
            if (!name || !phone) return null;
            return {
              name,
              phone,
              email: String(row.email || "").trim(),
              totalOrders: parseInt(row.totalOrders, 10) || 0,
            };
          }}
          onImport={(rows) => {
            importCustomers(rows);
            return rows.length;
          }}
          successMessage={(n) => `Success! ${n.toLocaleString()} customers imported and ready for marketing.`}
          onSuccess={showToast}
        />

        <Card title="Export Payroll & Timesheets" description="Shift hours, cash tips, and driver mileage in one CSV." icon={Download}>
          <div className="space-y-3">
            <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-500 dark:bg-white/5 dark:text-white/40">
              <p className="font-semibold text-gray-700 dark:text-white/70">{shiftReports.length} shift reports · {driverCashouts.length} driver cashouts</p>
              <p className="mt-1">Columns: Employee Name, Date, Hours Worked, Cash Tips, Mileage Owed.</p>
            </div>
            <Button variant="primary" icon={Download} className="w-full" onClick={handleExportPayroll} disabled={shiftReports.length === 0 && driverCashouts.length === 0}>
              Export Payroll & Timesheets
            </Button>
          </div>
        </Card>
      </div>

      {inventory.length > 0 && (
        <Card title="Inventory" description="Imported from your last spreadsheet upload." icon={Boxes}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold uppercase tracking-wide text-gray-400 dark:border-white/10 dark:text-white/30">
                  <th className="pb-3 pr-4">Item</th>
                  <th className="pb-3 pr-4 text-right">Quantity</th>
                  <th className="pb-3 pr-4">Unit</th>
                  <th className="pb-3 text-right">Vendor Cost</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((i) => (
                  <tr key={i.id} className="border-b border-gray-50 last:border-0 dark:border-white/5">
                    <td className="py-3 pr-4 font-semibold text-gray-900 dark:text-white">{i.name}</td>
                    <td className="py-3 pr-4 text-right text-gray-600 dark:text-white/60">{i.quantity}</td>
                    <td className="py-3 pr-4 text-gray-600 dark:text-white/60">{i.unitType}</td>
                    <td className="py-3 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(i.vendorCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
