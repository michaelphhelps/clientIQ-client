const API_BASE_URL = "http://localhost:5037/api";

export const getAllClients = () => {
  return fetch(`${API_BASE_URL}/clients`).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch clients");
    }
    return res.json();
  });
};

export const getClientById = (id) => {
  return fetch(`${API_BASE_URL}/clients/${id}`).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch client");
    }
    return res.json();
  });
};

export const searchClients = (searchTerm) => {
  return fetch(
    `${API_BASE_URL}/clients?search=${encodeURIComponent(searchTerm)}`
  ).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to search clients");
    }
    return res.json();
  });
};

export const createClient = (clientData) => {
  return fetch(`${API_BASE_URL}/clients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(clientData),
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to create client");
    }
    return res.json();
  });
};

export const updateClient = (id, clientData) => {
  return fetch(`${API_BASE_URL}/clients/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(clientData),
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to update client");
    }
    return res.status === 204 ? {} : res.json();
  });
};

export const deleteClient = (id) => {
  return fetch(`${API_BASE_URL}/clients/${id}`, {
    method: "DELETE",
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to delete client");
    }
    return res.status === 204 ? {} : res.json();
  });
};

export const getClientOrders = (clientId) => {
  return fetch(`${API_BASE_URL}/clients/${clientId}/orders`).then(
    async (res) => {
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to fetch client orders");
      }
      return res.json();
    }
  );
};
