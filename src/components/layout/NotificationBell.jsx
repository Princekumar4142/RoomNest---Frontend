import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen((o) => !o);
          if (!open) markAllRead();
        }}
        className="relative p-2 rounded-full hover:bg-ink/5"
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-seal px-1 text-[10px] font-bold text-ink">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-ink/10 bg-white shadow-xl z-50">
          {notifications.length === 0 ? (
            <p className="p-5 text-sm text-slate-ink/50 text-center">No notifications yet.</p>
          ) : (
            <ul className="divide-y divide-ink/6">
              {notifications.map((n) => (
                <li key={n.id} className="p-3.5 text-sm text-ink/80 hover:bg-ink/5">
                  {n.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
