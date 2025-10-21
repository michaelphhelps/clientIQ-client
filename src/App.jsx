import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import { LogIn } from "./Components/LogInPage/LogIn";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import "./App.css";
import { ClientsPage } from "./Components/ClientsPage/ClientsPage.jsx";
import { AddClientsPage } from "./Components/ClientsPage/AddClientsPage.jsx";
import { ClientsDetails } from "./Components/ClientsDetails/ClientsDetails.jsx";
import { OrdersPage } from "./Components/OrdersPage/OrdersPage.jsx";
import { CreateOrdersPage } from "./Components/OrdersPage/CreateOrdersPage.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LogIn />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients"
              element={
                <ProtectedRoute>
                  <ClientsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients/new"
              element={
                <ProtectedRoute>
                  <AddClientsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients/edit/:clientId"
              element={
                <ProtectedRoute>
                  <AddClientsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clients/:clientId"
              element={
                <ProtectedRoute>
                  <ClientsDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/new"
              element={
                <ProtectedRoute>
                  <CreateOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/edit/:orderId"
              element={
                <ProtectedRoute>
                  <CreateOrdersPage />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
