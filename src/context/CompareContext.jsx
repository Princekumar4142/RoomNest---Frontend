import { createContext, useContext, useState } from "react";
import toast from "react-hot-toast";

const CompareContext = createContext(null);
const MAX_COMPARE = 3;

export function CompareProvider({ children }) {
  const [items, setItems] = useState([]); // array of room objects

  function toggleCompare(room) {
    setItems((prev) => {
      const exists = prev.some((r) => r._id === room._id);
      if (exists) return prev.filter((r) => r._id !== room._id);
      if (prev.length >= MAX_COMPARE) {
        toast.error(`You can compare up to ${MAX_COMPARE} rooms at a time.`);
        return prev;
      }
      return [...prev, room];
    });
  }

  function clearCompare() {
    setItems([]);
  }

  return (
    <CompareContext.Provider value={{ items, toggleCompare, clearCompare, maxCompare: MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
