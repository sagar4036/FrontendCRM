import React, { useState, useEffect } from "react";
import { useProcessService } from "../../context/ProcessServiceContext";
import {useApi} from "../../context/ApiContext"
const NOTIF_STORAGE_KEY = "readNotificationIds";

const ProcessNotification = ({setUnreadCount}) => {
  const {
    fetchNotifications,
  } = useProcessService();
  const { markNotificationReadAPI}=useApi();


  const [notificationData, setNotificationData] = useState([]);
  const [markedAsRead, setMarkedAsRead] = useState(() => {
    // Load from localStorage on first render
    const stored = localStorage.getItem(NOTIF_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [currentPage, setCurrentPage] = useState(1);
  const notificationsPerPage = 10;

  const userRole = localStorage.getItem("userType");
  

  useEffect(() => {
    if (!userRole) return;

    const getNotifications = async () => {
      if (userRole === "customer") {
        try {
          const response = await fetchNotifications(userRole);
          console.log(response, "res");
          setNotificationData(response.notifications);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      }
    };

    getNotifications();
  }, [userRole,fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationReadAPI(notificationId);
      const updated = [...markedAsRead, notificationId];
      setMarkedAsRead(updated);
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error(
        `Failed to mark notification ${notificationId} as read`,
        error
      );
    }
  };

  // Pagination logic
  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = notificationData.slice(
    indexOfFirstNotification,
    indexOfLastNotification
  );

  const totalPages = Math.ceil(notificationData.length / notificationsPerPage);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  useEffect(() => {
    const count = notificationData.filter(
      (notif) => !markedAsRead.includes(notif.id)
    ).length;

    if (setUnreadCount) {
      setUnreadCount(count); // ✅ Update parent
    }
  }, [notificationData, markedAsRead,setUnreadCount]);


  return (
    <div>
          <h1 style={{textAlign:"center",marginTop:"20px"}}>Notifications</h1>
    <div className="reminder-container">

  {currentNotifications?.length > 0 ? (
  currentNotifications.map((item) => (
    <div
      key={item.id}
      className={`reminder-card ${
        markedAsRead.includes(item.id) ? "read" : ""
      }`}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 20px", // ✅ padding left and right
        borderBottom: "1px solid #ccc",
        borderRadius: "8px",
        marginBottom: "10px",
        backgroundColor: "#fff",
        opacity: markedAsRead.includes(item.id) ? 0.6 : 1,
      }}
    >
      <div className="reminder-content">
        <h3 className="reminder-title">
          {item.message?.toLowerCase().startsWith("reminder:")
            ? item.message.slice(9).trim()
            : item.message}
        </h3>
        <p className="reminder-time">
          🕒 {new Date(item.createdAt).toLocaleString()}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0px",
        }}
      >
        <input
          type="checkbox"
          className="reminder-checkbox"
          onClick={() => handleMarkAsRead(item.id)}
          disabled={markedAsRead.includes(item.id)}
          style={{
            cursor: markedAsRead.includes(item.id)
              ? "not-allowed"
              : "pointer",
          }}
        />
        <label
          style={{
            marginTop:"10px",
            fontSize: "14px",
            color: markedAsRead.includes(item.id) ? "gray" : "rgb(103 186 157)",
          }}
        >
          Mark as Read
        </label>
      </div>
    </div>
  ))
) : (
  <p>No notifications</p>
)}



      {/* Pagination Controls */}
      {notificationData.length > notificationsPerPage && (
        <div className="pagination-controls" style={{ marginTop: "20px" }}>
          <button onClick={handlePrevPage} disabled={currentPage === 1}>
            ◀ Previous
          </button>
          <span style={{ margin: "0 10px" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next ▶
          </button>
        </div>
      )}
    </div></div>
  );
};

export default ProcessNotification;