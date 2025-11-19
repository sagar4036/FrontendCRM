import { useEffect } from "react";

const useCopyNotification = (createCopyNotification, fetchNotifications) => {
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.id || !user.role) return;

    const userId = user.id;
    const userRole = user.role;
    const username = user.username;

    const handleCopy = () => {
      const copiedText = window.getSelection().toString().trim();
      if (!copiedText) return;

      const message = `${username} Copied: "${copiedText.slice(0, 100)}"`;
      createCopyNotification(userId, userRole, message);
    };

    document.addEventListener("copy", handleCopy);

    return () => {
      document.removeEventListener("copy", handleCopy);
    };
  }, [createCopyNotification, fetchNotifications]);
};

export default useCopyNotification;
