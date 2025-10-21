const API_BASE_URL = "http://localhost:5037/api";

export const getAllProducts = () => {
  return fetch(`${API_BASE_URL}/products`).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch products");
    }
    return res.json();
  });
};

export const getProductById = (id) => {
  return fetch(`${API_BASE_URL}/products/${id}`).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch product");
    }
    return res.json();
  });
};

export const getActiveProducts = () => {
  return fetch(`${API_BASE_URL}/products?isActive=true`).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch active products");
    }
    return res.json();
  });
};

export const createProduct = (productData) => {
  return fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to create product");
    }
    return res.json();
  });
};

export const updateProduct = (id, productData) => {
  return fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to update product");
    }
    return res.status === 204 ? {} : res.json();
  });
};

export const deleteProduct = (id) => {
  return fetch(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE",
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to delete product");
    }
    return res.status === 204 ? {} : res.json();
  });
};
