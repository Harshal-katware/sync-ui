// import React from 'react'
// import InventoryManagement from './Inventory/Inventorymanagement '

// function App() {
//   return (
//     <div>
//        <InventoryManagement/>
//     </div>
//   )
// }

// export default App
// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
