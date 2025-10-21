const API_BASE_URL = "http://localhost:5037/api";

export const getAllOrders = () => {
  return fetch(`${API_BASE_URL}/orders`).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch orders");
    }
    return res.json();
  });
};

export const getOrderById = (id) => {
  return fetch(`${API_BASE_URL}/orders/${id}`).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch order");
    }
    return res.json();
  });
};

export const searchOrders = (searchTerm) => {
  return fetch(
    `${API_BASE_URL}/orders?search=${encodeURIComponent(searchTerm)}`
  ).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to search orders");
    }
    return res.json();
  });
};

export const getOrdersByStatus = (status) => {
  return fetch(
    `${API_BASE_URL}/orders?status=${encodeURIComponent(status)}`
  ).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch orders by status");
    }
    return res.json();
  });
};

export const getOrdersByClientId = (clientId) => {
  return fetch(`${API_BASE_URL}/orders?clientId=${clientId}`).then(
    async (res) => {
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to fetch orders by client");
      }
      return res.json();
    }
  );
};

export const createOrder = (orderData) => {
  return fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to create order");
    }
    return res.json();
  });
};

export const updateOrder = (id, orderData) => {
  return fetch(`${API_BASE_URL}/orders/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to update order");
    }
    return res.status === 204 ? {} : res.json();
  });
};

export const deleteOrder = (id) => {
  return fetch(`${API_BASE_URL}/orders/${id}`, {
    method: "DELETE",
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to delete order");
    }
    return res.status === 204 ? {} : res.json();
  });
};

export const getOrderItems = (orderId) => {
  return fetch(`${API_BASE_URL}/orders/${orderId}/items`).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch order items");
    }
    return res.json();
  });
};

export const createOrderItem = (orderItemData) => {
  return fetch(`${API_BASE_URL}/orderitems`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderItemData),
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to create order item");
    }
    return res.json();
  });
};

export const updateOrderItem = (id, orderItemData) => {
  return fetch(`${API_BASE_URL}/orderitems/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderItemData),
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to update order item");
    }
    return res.status === 204 ? {} : res.json();
  });
};

export const deleteOrderItem = (id) => {
  return fetch(`${API_BASE_URL}/orderitems/${id}`, {
    method: "DELETE",
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to delete order item");
    }
    return res.status === 204 ? {} : res.json();
  });
};
