import client from "./client";

export const authApi = {
  register: (data) => client.post("/auth/register", data),
  login: (data) => client.post("/auth/login", data),
  me: () => client.get("/auth/me"),
  requestOtp: (phone) => client.post("/auth/otp/request", { phone }),
  verifyOtp: (data) => client.post("/auth/otp/verify", data),
  verifyEmailOtp: (data) => client.post("/auth/email/verify", data),
  resendEmailOtp: (userId) => client.post("/auth/email/resend", { userId }),
  forgotPassword: (email) => client.post("/auth/password/forgot", { email }),
  resetPassword: (data) => client.post("/auth/password/reset", data),
  logout: () => client.post("/auth/logout"),
  submitKyc: (data) => client.post("/auth/kyc", data),
};

export const uploadApi = {
  images: (files) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));
    return client.post("/uploads/images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
export const messageApi = {
  conversations: () => client.get("/messages"),
  get: (otherUserId, roomId) => client.get(`/messages/${otherUserId}`, { params: { roomId } }),
  send: (data) => client.post("/messages", data),
};
export const roommateApi = {
  list: (params) => client.get("/roommates", { params }),
  create: (data) => client.post("/roommates", data),
  mine: () => client.get("/roommates/mine"),
  remove: (id) => client.delete(`/roommates/${id}`),
};

export const roomApi = {
  list: (params) => client.get("/rooms", { params }),
  get: (id) => client.get(`/rooms/${id}`),
  create: (data) => client.post("/rooms", data),
  update: (id, data) => client.put(`/rooms/${id}`, data),
  remove: (id) => client.delete(`/rooms/${id}`),
  mine: () => client.get("/rooms/owner/mine"),
  nearbyPlaces: (id) => client.get(`/rooms/${id}/nearby-places`),
  rentInsight: (id) => client.get(`/rooms/${id}/rent-insight`),
};

export const favoriteApi = {
  list: () => client.get("/favorites"),
  add: (roomId) => client.post(`/favorites/${roomId}`),
  remove: (roomId) => client.delete(`/favorites/${roomId}`),
};

export const bookingApi = {
  create: (data) => client.post("/bookings", data),
  mine: () => client.get("/bookings/mine"),
  owner: () => client.get("/bookings/owner"),
  updateStatus: (id, status) => client.patch(`/bookings/${id}/status`, { status }),
};

export const reviewApi = {
  forRoom: (roomId) => client.get(`/reviews/room/${roomId}`),
  create: (data) => client.post("/reviews", data),
};

export const paymentApi = {
  status: () => client.get("/payments/status"),
  createOrder: (bookingId) => client.post("/payments/create-order", { bookingId }),
  verify: (data) => client.post("/payments/verify", data),
};
export const adminApi = {
  stats: () => client.get("/admin/stats"),
  pendingRooms: () => client.get("/admin/rooms/pending"),
  approveRoom: (id) => client.patch(`/admin/rooms/${id}/approve`),
  rejectRoom: (id) => client.patch(`/admin/rooms/${id}/reject`),
  pendingOwners: () => client.get("/admin/owners/pending"),
  verifyOwner: (id, approve) => client.patch(`/admin/owners/${id}/verify`, { approve }),
};
