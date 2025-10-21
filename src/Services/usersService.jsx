const API_BASE_URL = "http://localhost:5037/api";

export const getUsersByName = (name) => {
  return fetch(`${API_BASE_URL}/users?name=${name}`).then((res) => res.json());
};

export const getAllUsers = () => {
  return fetch(`${API_BASE_URL}/users`).then((res) => res.json());
};

export const getUserById = (id) => {
  return fetch(`${API_BASE_URL}/users/${id}`).then((res) => res.json());
};

export const loginUser = (loginData) => {
  return fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Invalid email or password");
    }
    return res.json();
  });
};

export const createUser = (userData) => {
  return fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to create user");
    }
    return res.json();
  });
};

export const updateUser = (id, userData) => {
  return fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to update user");
    }
    return res.status === 204 ? {} : res.json();
  });
};

export const deleteUser = (id) => {
  return fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
  }).then(async (res) => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to delete user");
    }
    return res.status === 204 ? {} : res.json();
  });
};
