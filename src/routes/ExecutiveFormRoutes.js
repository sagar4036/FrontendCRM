import ExecutiveCredentialsForm from '../features/admin/ExecutiveCredentialsForm';
import "../styles/createexecutive.css";

const ExecutiveFormRoutes=()=> {
  return (
    <div className="create-executive-container">
      {/* <div className='create-executive-sidebar'>
        <AdminSidebar/>
      </div>   */}
      <div className='create-executive-content'>
       <ExecutiveCredentialsForm/> 
      </div>
    </div>
  )
}

export default ExecutiveFormRoutes;