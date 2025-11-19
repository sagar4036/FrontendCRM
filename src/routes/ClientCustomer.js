import React,{useState,useEffect,useCallback} from "react";
import { Routes, Route } from "react-router-dom";
import ProcessNavbar from "../layouts/ProcessNavbar";

import ClientDash from "../features/process-client/ClientDash";
import ClientSetting from "../features/process-client/ClientSetting";
import ClientUpload from "../features/process-client/ClientUpload";
import { useProcessService } from "../context/ProcessServiceContext";
import "../styles/process.css";
import ProcessNotification from "../features/process-client/ProcessNotification";
const NOTIF_STORAGE_KEY = "readNotificationIds";

const ClientCustomerRoutes = () => {
   // ✅ Now it's correctly used inside the component
    const { fetchNotifications } = useProcessService();
 const [unreadCount, setUnreadCount] = useState(0);


const loadUnreadCount = useCallback(async () => {
  const userType = localStorage.getItem("userType");

  if (userType === "customer") {
    try {
      const response = await fetchNotifications(userType);
      const allNotifications = response.notifications || [];

      const markedAsRead = JSON.parse(localStorage.getItem(NOTIF_STORAGE_KEY)) || [];

      const unread = allNotifications.filter(
        (notif) => !markedAsRead.includes(notif.id)
      ).length;

      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }
}, [fetchNotifications]);

useEffect(() => {
  loadUnreadCount();
}, [loadUnreadCount]);



  return (
    
    <>
   <ProcessNavbar count={unreadCount}/>
      <Routes>
       
       <Route path="client/dashboard" element={<ClientDash />} />
        <Route path="client/settings" element={<ClientSetting />} />
        <Route path="client/upload" element={<ClientUpload />} />
          <Route path="client/notifications" element={<ProcessNotification setUnreadCount={setUnreadCount}/>} />
      </Routes>
    </>
  );
};

export default ClientCustomerRoutes;