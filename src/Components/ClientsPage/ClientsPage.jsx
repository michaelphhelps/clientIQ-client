import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getAllClients, deleteClient } from "../../Services/clientsService";
import { getOrdersByClientId } from "../../Services/ordersService";
import "./ClientsPage.css";

export const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientOrders, setClientOrders] = useState({});

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    // Apply search filter whenever clients or searchTerm changes
    if (searchTerm === "") {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(
        (client) =>
          client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client.email &&
            client.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredClients(filtered);
    }
  }, [clients, searchTerm]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllClients();
      setClients(data);

      // Fetch order counts for each client
      const orderCounts = {};
      for (const client of data) {
        try {
          const orders = await getOrdersByClientId(client.id);
          console.log(
            `Client ${client.companyName} (ID: ${client.id}) has orders:`,
            orders
          );

          // Ensure orders is an array and filter by clientId to fix backend filtering issue
          if (Array.isArray(orders)) {
            // Filter orders to only include those that actually belong to this client
            const clientOrders = orders.filter(
              (order) => order.clientId === client.id
            );
            orderCounts[client.id] = clientOrders.length;
            console.log(
              `After filtering, client ${client.id} has ${clientOrders.length} orders`
            );
          } else {
            console.warn(
              `Orders for client ${client.id} is not an array:`,
              orders
            );
            orderCounts[client.id] = 0;
          }
        } catch (error) {
          console.error(
            `Error fetching orders for client ${client.id}:`,
            error
          );
          orderCounts[client.id] = 0;
        }
      }
      console.log("Final order counts:", orderCounts);
      setClientOrders(orderCounts);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setError("Failed to load clients. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term === "") {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(
        (client) =>
          client.companyName.toLowerCase().includes(term) ||
          client.contactName.toLowerCase().includes(term) ||
          client.email.toLowerCase().includes(term)
      );
      setFilteredClients(filtered);
    }
  };

  const handleDelete = async (client) => {
    if (
      !window.confirm(`Are you sure you want to delete ${client.companyName}?`)
    ) {
      return;
    }

    try {
      setError(null);
      await deleteClient(client.id);
      await fetchClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      setError(error.message || "Failed to delete client. Please try again.");
    }
  };

  const handleAddNewClient = () => {
    navigate("/clients/new");
  };

  const handleEdit = (client) => {
    navigate(`/clients/edit/${client.id}`);
  };

  const handleRowClick = (client) => {
    navigate(`/clients/${client.id}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="clients-container">
      {/* Header */}
      <header className="clients-header">
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

        {/* Main Content */}
        <main className="clients-content">
          <div className="page-header">
            <h2 className="page-title">My Clients</h2>
            <p className="page-subtitle">Manage your client relationships</p>
          </div>

          <div className="clients-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            </div>
            <button className="add-client-btn" onClick={handleAddNewClient}>
              + Add New Client
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {isLoading ? (
            <div className="loading">Loading clients...</div>
          ) : (
            <div className="clients-table-container">
              <table className="clients-table">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Contact Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Total Orders</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="client-row">
                      <td onClick={() => handleRowClick(client)}>
                        {client.companyName}
                      </td>
                      <td onClick={() => handleRowClick(client)}>
                        {client.contactName}
                      </td>
                      <td onClick={() => handleRowClick(client)}>
                        {client.email || "-"}
                      </td>
                      <td onClick={() => handleRowClick(client)}>
                        {client.phone || "-"}
                      </td>
                      <td onClick={() => handleRowClick(client)}>
                        {clientOrders[client.id] || 0}
                      </td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(client);
                          }}
                          title="Edit client"
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(client);
                          }}
                          title="Delete client"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredClients.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan="6" className="no-data">
                        {searchTerm
                          ? "No clients found matching your search."
                          : "No clients found."}
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
