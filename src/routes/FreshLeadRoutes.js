import React from 'react'
import FreshLeads from '../features/freshLeads/FreshLead';
import "../styles/freshlead.css";

const FreshLeadRoutes=()=> {
  return (
    <div className="lead-assign-container">
      <div className='lead-content'>
       <FreshLeads/> 
      </div>
    </div>
  )
}

export default FreshLeadRoutes;