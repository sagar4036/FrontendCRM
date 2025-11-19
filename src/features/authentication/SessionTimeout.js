import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext"; // ✅ Import your auth context

const SessionTimeout = ({ timeout = 45 * 60 * 1000 }) => {
  const logoutTimerRef = useRef(null);
  const { logout } = useAuth(); // ✅ Use context logout

  const resetSession = useCallback(() => {
    clearTimeout(logoutTimerRef.current);
    logoutTimerRef.current = setTimeout(() => {
      console.warn("⏱ Logged out due to inactivity");
      logout();
    }, timeout);
  }, [timeout, logout]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const events = ["mousemove", "mousedown", "click", "scroll", "keypress"];
    const handleActivity = () => resetSession();

    events.forEach((event) => window.addEventListener(event, handleActivity));
    resetSession(); // Start timer on mount

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
      clearTimeout(logoutTimerRef.current);
    };
  }, [resetSession]);

  return null;
};

export default SessionTimeout;