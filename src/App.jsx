import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import RestaurantPOS from "./BILLING/Restaurantpos";
import Reports from "./Report/Reports";
import DailyUpdate from "./Report/Subreport/DailyUpdate";
import Menupage from "./MENU/Menupage"
import InventoryManagement from "./Inventory/Inventorymanagement";
import Customization from "./Report/Subreport/Customization";
import MonthlyReport from "./Report/Subreport/MonthlyReport";
import TopProductsDashboard from "./Report/Subreport/TopSellingProducts";
import SettingsPage from "./components/Setting";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<InventoryManagement />} />
        <Route path="/billing" element={<RestaurantPOS />} />
        <Route path="/menu" element={<Menupage />} />
        <Route path="/settings" element={<SettingsPage />} />
    

        {/* REPORTS */}
        <Route path="/reports" element={<Reports />}>

          <Route index element={<DailyUpdate />} />

          <Route path="daily-report" element={<DailyUpdate />} />
          <Route path="top-selling-products" element={<TopProductsDashboard />} />
          <Route path="customization" element={<Customization />} />
          <Route path="monthly-report" element={<MonthlyReport />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}