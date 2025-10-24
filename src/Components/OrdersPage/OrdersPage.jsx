import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getAllOrders, deleteOrder } from "../../Services/ordersService";
import { getAllClients } from "../../Services/clientsService";
import "./OrdersPage.css";

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const statusOptions = [
    "All Statuses",
    "New",
    "InProgress",
    "ReadyForDelivery",
    "Completed",
    "Cancelled",
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Filter orders based on search term and status
    let filtered = orders;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "All Statuses") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [ordersData, clientsData] = await Promise.all([
        getAllOrders(),
        getAllClients(),
      ]);

      // Enrich orders with client names
      const ordersWithClients = ordersData.map((order) => {
        const client = clientsData.find((c) => c.id === order.clientId);
        return {
          ...order,
          clientName: client ? client.companyName : "Unknown Client",
        };
      });

      setOrders(ordersWithClients);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleEdit = (order) => {
    navigate(`/orders/edit/${order.id}`);
  };

  const handleDelete = async (order) => {
    if (
      !window.confirm(
        `Are you sure you want to delete order ${order.orderNumber}?`
      )
    ) {
      return;
    }

    try {
      setError(null);
      await deleteOrder(order.id);
      await fetchInitialData();
      setSuccessMessage("Order deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error deleting order:", error);
      setError(error.message || "Failed to delete order. Please try again.");
    }
  };

  const handleCreateNewOrder = () => {
    navigate("/orders/new");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const calculateOrderTotal = (order) => {
    // Check for items in different possible property names
    const orderItems =
      order.items || order.orderItems || order.OrderItems || [];

    // If order has items, calculate from items
    if (orderItems && orderItems.length > 0) {
      return orderItems.reduce((total, item) => {
        return total + item.quantity * item.unitPrice;
      }, 0);
    }
    // Otherwise use the stored totalAmount
    return order.totalAmount || 0;
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

  const handleRowClick = (order) => {
    navigate(`/orders/${order.id}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="orders-container">
      {/* Header */}
      <header className="orders-header">
        <h1 className="header-title">CRM System</h1>
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
      <div className="orders-layout">
        {/* Sidebar */}
        <nav className="orders-sidebar">
          <div className="nav-item" onClick={() => navigate("/dashboard")}>
            <span className="nav-icon">📊</span>
            Dashboard
          </div>
          <div className="nav-item" onClick={() => navigate("/clients")}>
            <span className="nav-icon">👥</span>
            My Clients
          </div>
          <div className="nav-item active">
            <span className="nav-icon">📋</span>
            My Orders
          </div>
        </nav>

        {/* Main Content */}
        <main className="orders-content">
          <div className="page-header">
            <h2 className="page-title">My Orders</h2>
            <p className="page-subtitle">View and manage all your orders</p>
          </div>

          <div className="orders-actions">
            <div className="filters-container">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
              <select
                value={statusFilter}
                onChange={handleStatusFilter}
                className="status-filter"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <button className="create-order-btn" onClick={handleCreateNewOrder}>
              + Create New Order
            </button>
          </div>

          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}
          {error && <div className="error-message">{error}</div>}

          {isLoading ? (
            <div className="loading">Loading orders...</div>
          ) : (
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Client</th>
                    <th>Order Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="order-row">
                      <td onClick={() => handleRowClick(order)}>
                        {order.orderNumber}
                      </td>
                      <td onClick={() => handleRowClick(order)}>
                        {order.clientName}
                      </td>
                      <td onClick={() => handleRowClick(order)}>
                        {order.orderDate ? formatDate(order.orderDate) : "-"}
                      </td>
                      <td onClick={() => handleRowClick(order)}>
                        {order.dueDate ? formatDate(order.dueDate) : "-"}
                      </td>
                      <td onClick={() => handleRowClick(order)}>
                        <span
                          className={`status-badge ${getStatusBadgeClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td onClick={() => handleRowClick(order)}>
                        <span
                          className={`status-badge ${getPaymentBadgeClass(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td onClick={() => handleRowClick(order)}>
                        {formatCurrency(calculateOrderTotal(order))}
                      </td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(order);
                          }}
                          title="Edit order"
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(order);
                          }}
                          title="Delete order"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan="8" className="no-data">
                        {searchTerm || statusFilter !== "All Statuses"
                          ? "No orders found matching your criteria."
                          : "No orders found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
