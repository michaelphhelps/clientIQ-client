import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getClientById, deleteClient } from "../../Services/clientsService";
import { getOrdersByClientId } from "../../Services/ordersService";
import "./ClientsDetails.css";

export const ClientsDetails = () => {
  const [client, setClient] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { clientId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchClientDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const clientData = await getClientById(clientId);
      setClient(clientData);
    } catch (error) {
      console.error("Error fetching client details:", error);
      setError("Failed to load client details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  const fetchClientOrders = useCallback(async () => {
    try {
      const orderData = await getOrdersByClientId(clientId);
      // Filter orders to only include those that actually belong to this client
      // This fixes a backend filtering issue where wrong orders might be returned
      const filteredOrders = Array.isArray(orderData)
        ? orderData.filter((order) => order.clientId === parseInt(clientId))
        : [];
      setOrders(filteredOrders);
    } catch (error) {
      console.error("Error fetching client orders:", error);
      // Don't set error state here as client details might still load
    }
  }, [clientId]);

  useEffect(() => {
    if (clientId) {
      fetchClientDetails();
      fetchClientOrders();
    }
  }, [clientId, fetchClientDetails, fetchClientOrders]);

  const handleEditClient = () => {
    navigate(`/clients/edit/${clientId}`);
  };

  const handleDeleteClient = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${client.companyName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteClient(clientId);
      navigate("/clients");
    } catch (error) {
      console.error("Error deleting client:", error);
      setError("Failed to delete client. Please try again.");
    }
  };

  const handleCreateNewOrder = () => {
    navigate(`/orders/new?clientId=${clientId}`);
  };

  const handleBackToClients = () => {
    navigate("/clients");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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

  const getPaymentClass = (payment) => {
    switch (payment?.toLowerCase()) {
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
      <div className="client-details-container">
        <div className="loading">Loading client details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-details-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="client-details-container">
        <div className="error-message">Client not found.</div>
      </div>
    );
  }

  return (
    <div className="client-details-container">
      {/* Header */}
      <header className="client-details-header">
        <h1 className="header-title">ClientIQ</h1>
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

      {/* Main Content */}
      <div className="client-details-content">
        <div className="back-button-container">
          <button className="back-btn" onClick={handleBackToClients}>
            ← Back to Clients
          </button>
        </div>

        <div className="client-header">
          <h1 className="client-name">{client.companyName}</h1>
          <p className="client-subtitle">Client Details and Order History</p>
        </div>

        {/* Contact Information */}
        <section className="contact-info-section">
          <h2 className="section-title">Contact Information</h2>
          <div className="contact-info-grid">
            <div className="contact-info-left">
              <div className="info-item">
                <span className="info-label">Contact Name:</span>
                <span className="info-value">{client.contactName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{client.email || "-"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone:</span>
                <span className="info-value">{client.phone || "-"}</span>
              </div>
            </div>
            <div className="contact-info-right">
              <div className="info-item">
                <span className="info-label">Address:</span>
                <span className="info-value">{client.address || "-"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Created:</span>
                <span className="info-value">
                  {formatDate(client.createdAt)}
                </span>
              </div>
            </div>
          </div>
          {client.notes && (
            <div className="notes-section">
              <span className="info-label">Notes:</span>
              <p className="notes-text">{client.notes}</p>
            </div>
          )}

          <div className="action-buttons">
            <button className="edit-btn" onClick={handleEditClient}>
              Edit Client
            </button>
            <button className="delete-btn" onClick={handleDeleteClient}>
              Delete Client
            </button>
          </div>
        </section>

        {/* Order History */}
        <section className="order-history-section">
          <div className="section-header">
            <h2 className="section-title">Order History</h2>
            <button className="create-order-btn" onClick={handleCreateNewOrder}>
              + Create New Order
            </button>
          </div>

          <div className="order-info-note">
            <strong>Click Action:</strong> "Create New Order" button navigates
            to Order Form with this client pre-selected
          </div>

          {orders.length === 0 ? (
            <div className="no-orders">
              <p>No orders found for this client.</p>
            </div>
          ) : (
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="order-row"
                      onClick={() => navigate(`/orders/edit/${order.id}`)}
                    >
                      <td>{order.orderNumber || `ORD-${order.id}`}</td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td>{formatDate(order.dueDate)}</td>
                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`payment-badge ${getPaymentClass(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus || "Unpaid"}
                        </span>
                      </td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
