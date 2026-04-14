import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import RestaurantPOS from './BILLING/Restaurantpos';
import InventoryManagement from './Inventory/Inventorymanagement ';
import Menupage from './MENU/Menupage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
      
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<InventoryManagement />} />
        <Route path="/billing" element={<RestaurantPOS />} />
        <Route path="/menu" element={<Menupage/>} />
      </Routes>
    </BrowserRouter>
  );
}
