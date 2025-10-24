import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getOrderById } from "../../Services/ordersService";
import { getClientById } from "../../Services/clientsService";
import "./OrdersDetails.css";

export const OrdersDetails = () => {
  const [order, setOrder] = useState(null);
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { orderId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchOrderDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const orderData = await getOrderById(orderId);
      setOrder(orderData);

      // Fetch client information if clientId exists
      if (orderData.clientId) {
        try {
          const clientData = await getClientById(orderData.clientId);
          setClient(clientData);
        } catch (clientError) {
          console.error("Error fetching client details:", clientError);
          // Don't set error state as order details might still be useful
        }
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to load order details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, fetchOrderDetails]);

  const handleBackToOrders = () => {
    navigate("/orders");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "status-completed";
      case "in progress":
        return "status-in-progress";
      case "pending":
        return "status-pending";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  const getPaymentStatusClass = (paymentStatus) => {
    switch (paymentStatus?.toLowerCase()) {
      case "paid":
        return "payment-paid";
      case "partial":
        return "payment-partial";
      case "unpaid":
        return "payment-unpaid";
      default:
        return "payment-default";
    }
  };

  if (isLoading) {
    return (
      <div className="order-details-container">
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-details-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-container">
        <div className="error-message">Order not found.</div>
      </div>
    );
  }

  return (
    <div className="order-details-container">
      {/* Header */}
      <header className="order-details-header">
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
      <div className="order-details-layout">
        {/* Sidebar */}
        <nav className="order-details-sidebar">
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
        <main className="order-details-content">
          <div className="back-button-container">
            <button className="back-btn" onClick={handleBackToOrders}>
              ← Back to Orders
            </button>
          </div>

          <div className="order-header">
            <h1 className="order-title">
              Order #{order.orderNumber || `ORD-${order.id}`}
            </h1>
            <p className="order-subtitle">Order details and line items</p>
          </div>

          {/* Order Information */}
          <section className="order-info-section">
            <h2 className="section-title">Order Information</h2>
            <div className="order-info-grid">
              <div className="order-info-left">
                <div className="info-item">
                  <span className="info-label">Client:</span>
                  <span className="info-value">
                    {client ? client.companyName : "Unknown Client"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Order Date:</span>
                  <span className="info-value">
                    {formatDate(order.orderDate)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Due Date:</span>
                  <span className="info-value">
                    {formatDate(order.dueDate)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status:</span>
                  <span
                    className={`status-badge ${getStatusClass(order.status)}`}
                  >
                    {order.status || "Pending"}
                  </span>
                </div>
              </div>
              <div className="order-info-right">
                <div className="info-item">
                  <span className="info-label">Payment Status:</span>
                  <span
                    className={`payment-badge ${getPaymentStatusClass(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus || "Unpaid"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total Amount:</span>
                  <span className="info-value">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Amount Paid:</span>
                  <span className="info-value">
                    {formatCurrency(order.amountPaid || 0)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Balance Due:</span>
                  <span className="info-value">
                    {formatCurrency(
                      (order.totalAmount || 0) - (order.amountPaid || 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Order Items */}
          <section className="order-items-section">
            <div className="section-header">
              <h2 className="section-title">Order Items</h2>
            </div>

            {!order.orderItems || order.orderItems.length === 0 ? (
              <div className="no-items">
                <p>No items found for this order.</p>
              </div>
            ) : (
              <div className="items-table-container">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderItems.map((item, index) => (
                      <tr key={item.id || index} className="item-row">
                        <td>
                          {item.productName || item.itemName || "Unknown Item"}
                        </td>
                        <td>
                          {item.description || item.productDescription || "-"}
                        </td>
                        <td>{item.quantity || 0}</td>
                        <td>{formatCurrency(item.unitPrice)}</td>
                        <td>
                          {formatCurrency(
                            (item.quantity || 0) * (item.unitPrice || 0)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};
