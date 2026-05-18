import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import RestaurantPOS from "./BILLING/Restaurantpos";
import Reports from "./Report/Reports";
import DailyUpdate from "./Report/Subreport/DailyUpdate";
import Menupage from "./MENU/Menupage";
import InventoryManagement from "./Inventory/Inventorymanagement";
import Customization from "./Report/Subreport/Customization";
import MonthlyReport from "./Report/Subreport/MonthlyReport";
import TopProductsDashboard from "./Report/Subreport/TopSellingProducts";
import SettingsPage from "./components/Setting";
import AdminPanel from "./SuperAdmin/AdminPanel";
import SubscriptionWarning from "./components/SubscriptionWarning";
import SubscriptionExpired from "./pages/SubscriptionExpired";
import SuperAdminLogin from "./pages/SuperAdminLogin"

export default function App() {
  return (
    <BrowserRouter>
      <SubscriptionWarning />

      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/expired" element={<SubscriptionExpired />} />

        <Route path="/super-admin/login" element={<SuperAdminLogin />} />

        <Route path="/super-admin" element={
         <ProtectedRoute>
          <Dashboard/>
         </ProtectedRoute>
        } />

        <Route path="/admin" element={
         <ProtectedRoute>
          <AdminPanel />
         </ProtectedRoute>
        } />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <InventoryManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <RestaurantPOS />
            </ProtectedRoute>
          }
        />

        <Route
          path="/menu"
          element={
            <ProtectedRoute>
              <Menupage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* REPORTS */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <ProtectedRoute>
                <DailyUpdate />
              </ProtectedRoute>
            }
          />

          <Route
            path="daily-report"
            element={
              <ProtectedRoute>
                <DailyUpdate />
              </ProtectedRoute>
            }
          />

          <Route
            path="top-selling-products"
            element={
              <ProtectedRoute>
                <TopProductsDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="customization"
            element={
              <ProtectedRoute>
                <Customization />
              </ProtectedRoute>
            }
          />

          <Route
            path="monthly-report"
            element={
              <ProtectedRoute>
                <MonthlyReport />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
