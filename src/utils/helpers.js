// utils/helpers.js

// Check if two dates are on the same day
export const isSameDay = (d1, d2) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };
  
  // Convert "hh:mm" string into minutes
  export const convertTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const cleanTime = timeStr.trim();
    if (cleanTime.includes(":")) {
      const [hours, minutes] = cleanTime.split(":").map(Number);
      return hours * 60 + minutes;
    }
    return 0;
  };
  
  // Convert follow-up history into a comparable timestamp
  export const getComparableDateTime = (history) => {
    const date = new Date(history.follow_up_date || history.created_at);
    const timeInMinutes = convertTimeToMinutes(history.follow_up_time);
    return date.getTime() + timeInMinutes * 60 * 1000;
  };
  
  // Format a date to readable interaction schedule string
  export const formatInteractionSchedule = (meeting) => {
    const interactionDate =
      meeting.interactionScheduleDate ||
      meeting.follow_up_date ||
      meeting.startTime;
  
    if (!interactionDate) return "No schedule set";
  
    const date = new Date(interactionDate);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };
  
  // Convert "hh:mm AM/PM" to 24-hour format string "HH:MM:00"
  export const convertTo24HrFormat = (timeStr) => {
    if (!timeStr) return "00:00:00";
    const dateObj = new Date(`1970-01-01 ${timeStr}`);
    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}:00`;
  };
  
  // Capitalize only the first letter of a word
  export const capitalize = (text) => {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };
  