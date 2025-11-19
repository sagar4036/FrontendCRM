import { useEffect, useState } from "react";

const useWorkTimer = () => {
  const [timer, setTimer] = useState("00:00:00");

  useEffect(() => {
    const loginStartTime = localStorage.getItem("workStartTime");

    if (!loginStartTime) return;

    const parsedStartTime = new Date(loginStartTime).getTime();
    if (isNaN(parsedStartTime)) return;

    const updateTimer = () => {
      const now = Date.now();
      const diffInSeconds = Math.floor((now - parsedStartTime) / 1000);

      const hrs = String(Math.floor(diffInSeconds / 3600)).padStart(2, "0");
      const mins = String(Math.floor((diffInSeconds % 3600) / 60)).padStart(2, "0");
      const secs = String(diffInSeconds % 60).padStart(2, "0");

      setTimer(`${hrs}:${mins}:${secs}`); // Use backticks for template literal
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []); // This runs once on mount

  return timer;
};

export default useWorkTimer;