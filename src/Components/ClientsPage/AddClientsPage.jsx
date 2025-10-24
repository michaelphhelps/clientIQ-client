import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import {
  getClientById,
  createClient,
  updateClient,
} from "../../Services/clientsService";
import "./ClientsPage.css";

export const AddClientsPage = () => {
  const { clientId } = useParams(); // Get clientId from URL for editing
  const isEditing = !!clientId;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Form state for Add/Edit client
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing && clientId) {
      loadClientForEditing(clientId);
    }
  }, [isEditing, clientId]);

  const loadClientForEditing = async (clientId) => {
    try {
      setIsLoading(true);
      console.log("Loading client for editing:", clientId);
      const client = await getClientById(clientId);
      console.log("Client details:", client);

      setFormData({
        companyName: client.companyName || "",
        contactName: client.contactName || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        notes: client.notes || "",
      });
    } catch (error) {
      console.error("Error loading client:", error);
      setError("Failed to load client details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.companyName.trim()) {
      errors.companyName = "Company name is required";
    }

    if (!formData.contactName.trim()) {
      errors.contactName = "Contact name is required";
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isEditing) {
        await updateClient(clientId, formData);
        setSuccessMessage("Client updated successfully!");
      } else {
        await createClient(formData);
        setSuccessMessage("Client created successfully!");
      }

      // Navigate back to clients list after a brief delay
      setTimeout(() => {
        navigate("/clients");
      }, 1500);
    } catch (error) {
      console.error("Error saving client:", error);
      setError(
        error.message ||
          `Failed to ${
            isEditing ? "update" : "create"
          } client. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCancel = () => {
    navigate("/clients");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="clients-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="clients-container">
      {/* Header */}
      <header className="clients-header">
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
      <div className="clients-layout">
        {/* Sidebar */}
        <nav className="clients-sidebar">
          <div className="nav-item" onClick={() => navigate("/dashboard")}>
            <span className="nav-icon">📊</span>
            Dashboard
          </div>
          <div className="nav-item active">
            <span className="nav-icon">👥</span>
            My Clients
          </div>
          <div className="nav-item" onClick={() => navigate("/orders")}>
            <span className="nav-icon">📋</span>
            My Orders
          </div>
        </nav>

        {/* Add/Edit Form */}
        <main className="clients-content">
          <div className="form-header">
            <button className="cancel-btn" onClick={handleCancel}>
              ← Back to Clients
            </button>
          </div>

          <div className="page-header">
            <h2 className="page-title">
              {isEditing ? "Edit Client" : "Add New Client"}
            </h2>
            <p className="page-subtitle">
              {isEditing
                ? "Update client information"
                : "Create a new client record"}
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          <form onSubmit={handleFormSubmit} className="client-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="companyName">Company Name *</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                  className={formErrors.companyName ? "error" : ""}
                  required
                />
                {formErrors.companyName && (
                  <span className="field-error">{formErrors.companyName}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contactName">Contact Name *</label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  placeholder="Enter contact name"
                  className={formErrors.contactName ? "error" : ""}
                  required
                />
                {formErrors.contactName && (
                  <span className="field-error">{formErrors.contactName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contact@company.com"
                  className={formErrors.email ? "error" : ""}
                />
                {formErrors.email && (
                  <span className="field-error">{formErrors.email}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Add any relevant notes about this client..."
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="save-btn"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                  ? "Update Client"
                  : "Save Client"}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};
