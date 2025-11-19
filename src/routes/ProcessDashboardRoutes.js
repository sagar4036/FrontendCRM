import React from "react";
import { Routes, Route } from "react-router-dom";
import ProcessNavbar from "../layouts/ProcessNavbar";
import ClientDash from "../features/process-client/ClientDash";
import ClientSetting from "../features/process-client/ClientSetting";
import ClientUpload from "../features/process-client/ClientUpload";
import CreateClient from "../features/process-client/CreateClient";
import AllClient from "../features/process-client/AllClient";
import "../styles/process.css";


const ProcessDashboardRoutes = () => {

  return (
    
    <>
   <ProcessNavbar/>
      <Routes>
       
             <Route path="client/settings" element={<ClientSetting />} />
           <Route path="client/upload/:id" element={<ClientUpload />} />
             <Route path="client/dashboard/:id" element={<ClientDash />} />
            <Route path="client/create-client" element={<CreateClient />} />
            <Route path="client/all-clients" element={<AllClient />} />
          
      </Routes>
    </>
  );
};

export default ProcessDashboardRoutes;