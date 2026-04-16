import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import RestaurantPOS from './BILLING/Restaurantpos';
import Reports from "./Report/Reports";
import ShiftSummary from "./Report/Subreport/ShiftSummary";
import Menupage from './MENU/Menupage';
import TopSellingProducts from "./Report/Subreport/TopSellingProducts";
import Customization from "./Report/Subreport/Customization";
import MonthlyReport from "./Report/Subreport/MonthlyReport";
import InventoryManagement from "./Inventory/Inventorymanagement";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<InventoryManagement/>} />
        <Route path="/billing" element={<RestaurantPOS />} />
        <Route path="/menu" element={<Menupage />} />
        <Route path="/reports" element={<Reports/>} />

        {/*Report Routes */}
        <Route path="/reports/daily-report" element={<ShiftSummary />} /> 
        <Route path="/reports/top-selling-products" element={<TopSellingProducts />} />
        <Route path="/reports/customization" element={<Customization />} />
        <Route path="/reports/monthly-report" element={<MonthlyReport />} /> 
      </Routes>
    </BrowserRouter>
  );
}
