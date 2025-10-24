import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  getOrderById,
  createOrder,
  updateOrder,
} from "../../Services/ordersService";
import { getAllClients } from "../../Services/clientsService";
import { getAllProducts } from "../../Services/productsService";
import "./OrdersPage.css";

export const CreateOrdersPage = () => {
  const { orderId } = useParams(); // Get orderId from URL for editing
  const [searchParams] = useSearchParams(); // Get query parameters
  const isEditing = !!orderId;

  // Helper function to convert date string to UTC ISO format for PostgreSQL
  const convertDateToUTC = (dateString) => {
    if (!dateString) return null;
    // Create date at midnight UTC to avoid timezone issues
    const date = new Date(dateString + "T00:00:00.000Z");
    return date.toISOString();
  };

  // Helper function to generate unique order number
  const generateOrderNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const time = String(now.getTime()).slice(-6); // Last 6 digits of timestamp
    return `ORD-${year}${month}${day}-${time}`;
  };

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Form state for Create/Edit order
  const [formData, setFormData] = useState({
    clientId: "",
    orderDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    status: "New",
    paymentStatus: "Unpaid",
    notes: "",
    orderNumber: "",
  });

  const [orderItems, setOrderItems] = useState([
    {
      productId: "",
      quantity: 1,
      unitPrice: 0,
      description: "",
    },
  ]);

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (isEditing && orderId) {
      loadOrderForEditing(orderId);
    }
  }, [isEditing, orderId]);

  // Handle pre-selected client from URL parameters
  useEffect(() => {
    if (!isEditing) {
      const clientIdFromUrl = searchParams.get("clientId");
      if (clientIdFromUrl) {
        setFormData((prev) => ({
          ...prev,
          clientId: clientIdFromUrl,
        }));
      }
    }
  }, [isEditing, searchParams]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [clientsData, productsData] = await Promise.all([
        getAllClients(),
        getAllProducts(),
      ]);

      setClients(clientsData);
      setProducts(productsData.filter((p) => p.isActive));
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load required data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrderForEditing = async (orderId) => {
    try {
      console.log("Loading order for editing:", orderId);
      const order = await getOrderById(orderId);
      console.log("Order details:", order);

      setFormData({
        clientId: order.clientId.toString(),
        orderDate: order.orderDate ? order.orderDate.split("T")[0] : "",
        dueDate: order.dueDate ? order.dueDate.split("T")[0] : "",
        status: order.status || "New",
        paymentStatus: order.paymentStatus || "Unpaid",
        notes: order.notes || "",
        orderNumber: order.orderNumber || "",
      });

      // Load order items if they exist in the response
      const orderItems =
        order.items || order.orderItems || order.OrderItems || [];

      if (orderItems && orderItems.length > 0) {
        console.log("Order items found:", orderItems);
        const formattedItems = orderItems.map((item) => ({
          productId: item.productId.toString(),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          description: item.description || "",
        }));
        setOrderItems(formattedItems);
      } else {
        console.log("No order items found, setting default");
        setOrderItems([
          { productId: "", quantity: 1, unitPrice: 0, description: "" },
        ]);
      }
    } catch (error) {
      console.error("Error loading order:", error);
      setError("Failed to load order details. Please try again.");
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.clientId) {
      errors.clientId = "Client is required";
    }

    if (!formData.orderDate) {
      errors.orderDate = "Order date is required";
    }

    if (!formData.dueDate) {
      errors.dueDate = "Due date is required";
    }

    // Validate order items
    const itemErrors = [];
    orderItems.forEach((item, index) => {
      const itemError = {};

      if (!item.productId) {
        itemError.productId = "Product is required";
      }

      if (!item.quantity || item.quantity <= 0) {
        itemError.quantity = "Quantity must be greater than 0";
      }

      if (!item.unitPrice || item.unitPrice <= 0) {
        itemError.unitPrice = "Unit price must be greater than 0";
      }

      if (Object.keys(itemError).length > 0) {
        itemErrors[index] = itemError;
      }
    });

    if (itemErrors.length > 0) {
      errors.orderItems = itemErrors;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      return total + item.quantity * item.unitPrice;
    }, 0);
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
      // Convert dates to UTC format for PostgreSQL
      const orderData = {
        ...formData,
        orderNumber: isEditing ? formData.orderNumber : generateOrderNumber(),
        clientId: parseInt(formData.clientId),
        orderDate: convertDateToUTC(formData.orderDate),
        dueDate: convertDateToUTC(formData.dueDate),
        totalAmount: calculateTotal(),
        createdByUserId: user.id,
        orderItems: orderItems
          .filter((item) => item.productId && item.quantity && item.unitPrice)
          .map((item) => ({
            productId: parseInt(item.productId),
            quantity: parseInt(item.quantity),
            unitPrice: parseFloat(item.unitPrice),
            subtotal: item.quantity * item.unitPrice,
          })),
      };

      if (isEditing) {
        await updateOrder(orderId, orderData);
        setSuccessMessage("Order updated successfully!");
      } else {
        await createOrder(orderData);
        setSuccessMessage("Order created successfully!");
      }

      // Navigate back to orders list after a brief delay
      setTimeout(() => {
        navigate("/orders");
      }, 1500);
    } catch (error) {
      console.error("Error saving order:", error);

      // More specific error messaging
      if (error.message.includes("order item")) {
        setError(
          `Order was ${
            isEditing ? "updated" : "created"
          } but there was an issue with order items: ${error.message}`
        );
      } else {
        setError(
          error.message ||
            `Failed to ${
              isEditing ? "update" : "create"
            } order. Please try again.`
        );
      }
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

  const handleOrderItemChange = (index, field, value) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Auto-update unit price when product is selected
    if (field === "productId" && value) {
      const product = products.find((p) => p.id === parseInt(value));
      if (product) {
        updatedItems[index].unitPrice = product.price;
        updatedItems[index].description = product.description || "";
      }
    }

    setOrderItems(updatedItems);

    // Clear item errors
    if (
      formErrors.orderItems &&
      formErrors.orderItems[index] &&
      formErrors.orderItems[index][field]
    ) {
      const newErrors = { ...formErrors };
      delete newErrors.orderItems[index][field];
      if (Object.keys(newErrors.orderItems[index]).length === 0) {
        delete newErrors.orderItems[index];
      }
      if (Object.keys(newErrors.orderItems).length === 0) {
        delete newErrors.orderItems;
      }
      setFormErrors(newErrors);
    }
  };

  const addOrderItem = () => {
    setOrderItems([
      ...orderItems,
      {
        productId: "",
        quantity: 1,
        unitPrice: 0,
        description: "",
      },
    ]);
  };

  const removeOrderItem = (index) => {
    if (orderItems.length > 1) {
      const updatedItems = orderItems.filter((_, i) => i !== index);
      setOrderItems(updatedItems);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCancel = () => {
    navigate("/orders");
  };

  if (isLoading) {
    return (
      <div className="orders-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

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

        {/* Create/Edit Form */}
        <main className="orders-content">
          <div className="form-header">
            <button className="back-btn" onClick={handleCancel}>
              ← Back to Orders
            </button>
          </div>

          <div className="page-header">
            <h2 className="page-title">
              {isEditing ? "Edit Order" : "Create New Order"}
            </h2>
            <p className="page-subtitle">
              {isEditing
                ? "Update order information"
                : "Add a new order for a client"}
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          <form onSubmit={handleFormSubmit} className="order-form">
            {/* Order Information Section */}
            <div className="form-section">
              <h3 className="section-title">Order Information</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="clientId">Client *</label>
                  <select
                    id="clientId"
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleInputChange}
                    className={formErrors.clientId ? "error" : ""}
                    required
                  >
                    <option value="">Select a client...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.companyName}
                      </option>
                    ))}
                  </select>
                  {formErrors.clientId && (
                    <span className="field-error">{formErrors.clientId}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="orderDate">Order Date *</label>
                  <input
                    type="date"
                    id="orderDate"
                    name="orderDate"
                    value={formData.orderDate}
                    onChange={handleInputChange}
                    className={formErrors.orderDate ? "error" : ""}
                    required
                  />
                  {formErrors.orderDate && (
                    <span className="field-error">{formErrors.orderDate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="dueDate">Due Date *</label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className={formErrors.dueDate ? "error" : ""}
                    required
                  />
                  {formErrors.dueDate && (
                    <span className="field-error">{formErrors.dueDate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="New">New</option>
                    <option value="InProgress">In Progress</option>
                    <option value="ReadyForDelivery">Ready for Delivery</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {formData.notes !== undefined && (
                <div className="form-group">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Optional notes about the order..."
                    rows="3"
                  />
                </div>
              )}
            </div>

            {/* Order Items Section */}
            <div className="form-section">
              <h3 className="section-title">Order Items</h3>

              <div className="order-items">
                {orderItems.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-row">
                      <div className="form-group">
                        <label>Item</label>
                        <select
                          value={item.productId}
                          onChange={(e) =>
                            handleOrderItemChange(
                              index,
                              "productId",
                              e.target.value
                            )
                          }
                          className={
                            formErrors.orderItems?.[index]?.productId
                              ? "error"
                              : ""
                          }
                        >
                          <option value="">Select a product...</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                        {formErrors.orderItems?.[index]?.productId && (
                          <span className="field-error">
                            {formErrors.orderItems[index].productId}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleOrderItemChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Product description"
                        />
                      </div>

                      <div className="form-group">
                        <label>Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleOrderItemChange(
                              index,
                              "quantity",
                              parseInt(e.target.value) || 0
                            )
                          }
                          min="1"
                          className={
                            formErrors.orderItems?.[index]?.quantity
                              ? "error"
                              : ""
                          }
                        />
                        {formErrors.orderItems?.[index]?.quantity && (
                          <span className="field-error">
                            {formErrors.orderItems[index].quantity}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label>Unit Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleOrderItemChange(
                              index,
                              "unitPrice",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          min="0"
                          className={
                            formErrors.orderItems?.[index]?.unitPrice
                              ? "error"
                              : ""
                          }
                        />
                        {formErrors.orderItems?.[index]?.unitPrice && (
                          <span className="field-error">
                            {formErrors.orderItems[index].unitPrice}
                          </span>
                        )}
                      </div>

                      {orderItems.length > 1 && (
                        <button
                          type="button"
                          className="remove-item-btn"
                          onClick={() => removeOrderItem(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="add-item-btn"
                onClick={addOrderItem}
              >
                + Add Another Item
              </button>

              <div className="order-total">
                <strong>Total: {formatCurrency(calculateTotal())}</strong>
              </div>
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
                  ? "Update Order"
                  : "Save Order"}
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
