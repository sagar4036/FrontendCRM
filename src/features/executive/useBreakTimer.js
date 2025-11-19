import { useEffect, useRef, useState } from "react";

const useBreakTimer = () => {
  const [breakTimer, setBreakTimer] = useState("00:00:00");
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const accumulatedRef = useRef(0); // This stores the accumulated break time in ms

  // Format time as HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSeconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;  // Use backticks for string interpolation
  };
  

  // Update the break timer (this runs every second)
  const updateTimer = () => {
    if (!startTimeRef.current) return;
    const now = Date.now();
    const elapsed = accumulatedRef.current + (now - startTimeRef.current); // Add previous accumulated time
    setBreakTimer(formatTime(Math.floor(elapsed / 1000)));
  };

  // Start the break timer
  const startBreak = () => {
    // Check if we already have a breakStartTime saved
    let storedStartTime = localStorage.getItem("breakStartTime");

    if (!storedStartTime) {
      // First click — set the current time as start
      const now = new Date();
      storedStartTime = now.toISOString();
      localStorage.setItem("breakStartTime", storedStartTime);
    }

    // Convert stored time to timestamp and store in ref
    startTimeRef.current = new Date(storedStartTime).getTime();

    // Get accumulated break time (in case of resume)
    const savedAccumulated = Number(localStorage.getItem("accumulatedBreakTime")) || 0;
    accumulatedRef.current = savedAccumulated;

    // Clear any previous intervals to avoid duplicates
    clearInterval(intervalRef.current);

    // Start interval to update break timer every second
    intervalRef.current = setInterval(updateTimer, 1000);
    updateTimer(); // Trigger immediate update
  };

  // Stop the break timer
  const stopBreak = () => {
    if (!startTimeRef.current) return 0;

    const now = Date.now();
    const sessionTime = now - startTimeRef.current;

    accumulatedRef.current += sessionTime;
    localStorage.setItem("accumulatedBreakTime", accumulatedRef.current.toString());

    clearInterval(intervalRef.current);

    setBreakTimer(formatTime(Math.floor(accumulatedRef.current / 1000)));

    startTimeRef.current = null;
    localStorage.removeItem("breakStartTime");

    return sessionTime; // return current session time in ms
  };

  // Get accumulated time in seconds
  const getAccumulatedSeconds = () => {
    const totalMs = accumulatedRef.current;
    return Math.floor(totalMs / 1000);
  };

  // Restore the break timer state when the component mounts
  useEffect(() => {
    const storedStartTime = localStorage.getItem("breakStartTime");
    const savedAccumulated = Number(localStorage.getItem("accumulatedBreakTime")) || 0;
    accumulatedRef.current = savedAccumulated; // Initialize accumulated time from localStorage

    if (storedStartTime) {
      startBreak(); // If a break session is ongoing, start the break timer
    } else {
      // If no break is ongoing, show the accumulated time
      setBreakTimer(formatTime(Math.floor(savedAccumulated / 1000)));
    }

    return () => clearInterval(intervalRef.current); // Cleanup interval when component unmounts
  }, []);

  return { breakTimer, startBreak, stopBreak, getAccumulatedSeconds }; // Return timer value and break controls
};

export default useBreakTimer;