import React from 'react'
import MenuPage from './MENU/Menupage'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

function App() {
  return (
    
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
         <Route path="/MenuPage" element={<MenuPage/>} />
      </Routes>
    </BrowserRouter>
  );
}
