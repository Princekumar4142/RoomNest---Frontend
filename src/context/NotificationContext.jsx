import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { getSocket } from "../utils/socket";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    socket.emit("joinUser", user._id);

    function handleNotification(payload) {
      setNotifications((prev) => [{ ...payload, id: Date.now(), read: false }, ...prev].slice(0, 30));
      setUnreadCount((c) => c + 1);
      toast(payload.message, { icon: "🔔" });
    }

    socket.on("notification", handleNotification);
    return () => socket.off("notification", handleNotification);
  }, [user]);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
