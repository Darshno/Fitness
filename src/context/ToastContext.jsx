import { createContext, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  function toast(text) {
    setMessage(text);
    setVisible(true);
    clearTimeout(window.__fitbuddyToast);
    window.__fitbuddyToast = setTimeout(() => setVisible(false), 2200);
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className={`toast ${visible ? "show" : ""}`}>{message}</div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
