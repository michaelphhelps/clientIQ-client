import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalClients: 0,
    activeOrders: 0,
    ordersThisMonth: 0,
    revenueThisMonth: 0,
    orders: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Base API URL
  const API_BASE = "http://localhost:5037/api";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all required data
      const [clientsResponse, ordersResponse] = await Promise.all([
        fetch(`${API_BASE}/clients`),
        fetch(`${API_BASE}/orders`),
      ]);

      if (!clientsResponse.ok || !ordersResponse.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const clients = await clientsResponse.json();
      const orders = await ordersResponse.json();

      // Calculate statistics
      const totalClients = clients.length;
      const activeOrders = orders.filter(
        (order) => order.status === "New" || order.status === "InProgress"
      ).length;

      // Orders this month (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const ordersThisMonth = orders.filter((order) => {
        const orderDate = new Date(order.orderDate);
        return (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear
        );
      }).length;

      // Revenue this month
      const revenueThisMonth = orders
        .filter((order) => {
          const orderDate = new Date(order.orderDate);
          return (
            orderDate.getMonth() === currentMonth &&
            orderDate.getFullYear() === currentYear
          );
        })
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      // Get recent orders with client information
      const ordersWithClients = await Promise.all(
        orders.slice(0, 10).map(async (order) => {
          const clientResponse = await fetch(
            `${API_BASE}/clients/${order.clientId}`
          );
          const client = clientResponse.ok
            ? await clientResponse.json()
            : { companyName: "Unknown" };

          return {
            ...order,
            clientName: client.companyName,
          };
        })
      );

      setDashboardData({
        totalClients,
        activeOrders,
        ordersThisMonth,
        revenueThisMonth,
        orders: ordersWithClients,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US");
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "status-new";
      case "inprogress":
        return "status-in-progress";
      case "readyfordelivery":
        return "status-ready";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-new";
    }
  };

  const getPaymentBadgeClass = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case "unpaid":
        return "payment-unpaid";
      case "partial":
        return "payment-partial";
      case "paid":
        return "payment-paid";
      default:
        return "payment-unpaid";
    }
  };

  const handleOrderClick = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1 className="dashboard-title">ClientIQ</h1>
        <div className="user-info">
          <span className="user-name">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="user-role">Client Manager</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="dashboard-layout">
        {/* Sidebar */}
        <nav className="dashboard-sidebar">
          <div className="nav-item active">
            <span className="nav-icon">📊</span>
            Dashboard
          </div>
          <div className="nav-item" onClick={() => navigate("/clients")}>
            <span className="nav-icon">👥</span>
            My Clients
          </div>
          <div className="nav-item" onClick={() => navigate("/orders")}>
            <span className="nav-icon">📋</span>
            My Orders
          </div>
        </nav>

        {/* Main Content */}
        <main className="dashboard-content">
          {/* Page Header */}
          <div className="page-header">
            <h2 className="page-title">Dashboard</h2>
            <p className="page-subtitle">Overview of your clients and orders</p>
          </div>

          {/* Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Clients</div>
              <div className="stat-value">{dashboardData.totalClients}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active Orders</div>
              <div className="stat-value">{dashboardData.activeOrders}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Orders This Month</div>
              <div className="stat-value">{dashboardData.ordersThisMonth}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Revenue This Month</div>
              <div className="stat-value revenue">
                {formatCurrency(dashboardData.revenueThisMonth)}
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="orders-section">
            <div className="section-header">
              <h3 className="section-title">Orders by Status</h3>
            </div>

            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Client</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.orders.map((order) => (
                    <tr
                      key={order.id}
                      className="order-row"
                      onClick={() => handleOrderClick(order.id)}
                    >
                      <td>{order.orderNumber}</td>
                      <td>{order.clientName}</td>
                      <td>{order.dueDate ? formatDate(order.dueDate) : "-"}</td>
                      <td>
                        <span
                          className={`status-badge ${getStatusBadgeClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getPaymentBadgeClass(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
