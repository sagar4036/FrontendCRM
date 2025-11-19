import React, { useEffect, useState } from 'react';
import '../../styles/masterdash.css';
import { useCompany } from '../../context/CompanyContext';
import AddCompanyModal from './AddCompanyModal';

const MasterDashboard = () => {
  const {
    companies,
    fetchCompanies,
    loading,
    error,
    pauseCompany,
    resumeCompany,
    updateCompanyExpiry
  } = useCompany();

  const [showModal, setShowModal] = useState(false);
  const [expiryDates, setExpiryDates] = useState({}); // Local expiry input

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // ✅ Toggle ON = resumeCompany | Toggle OFF = pauseCompany
  const handleToggleStatus = async (company, isChecked) => {
    try {
      if (isChecked) {
        await resumeCompany(company.id);  // ✅ Toggled ON
      } else {
        await pauseCompany(company.id);   // ❌ Toggled OFF
      }
      await fetchCompanies();
    } catch (err) {
      alert(err?.error || "Failed to update company status");
    }
  };

  // ⏳ Date input state
  const handleExpiryChange = (companyId, dateStr) => {
    setExpiryDates((prev) => ({ ...prev, [companyId]: dateStr }));
  };

  // 📅 Submit expiry API
  const submitExpiryDate = async (companyId) => {
    const dateStr = expiryDates[companyId];
    if (!dateStr) return alert("Please select a date first.");
    try {
      const iso = new Date(dateStr).toISOString();
      await updateCompanyExpiry(companyId, iso);
      await fetchCompanies();
    } catch (err) {
      alert(err?.error || "Failed to set expiry date");
    }
  };

  return (
    <>
    <div className={`table-section-wrapper`}>
      <div className={`table-section ${showModal ? 'blurred' : ''}`}>
        <div className="table-header">
          <h2>Companies</h2>
          <button className="add-button" onClick={() => setShowModal(true)}>
            + Add New Company
          </button>
        </div>

        {error && companies.length === 0 && (
          <p className="error-text">{error}</p>
        )}

        {!loading && companies.length > 0 ? (
          <table className="company-table">
            <thead>
              <tr>
                <th>Company ID</th>
                <th>Company Name</th>
                <th>DB Name</th>
                <th>Created At</th>
                <th>Expiry Date</th>
                <th>Toggle Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => {
                const status = company.status?.toLowerCase() || "unknown";
                const currentExpiry = company.expiryDate
                  ? new Date(company.expiryDate).toLocaleDateString()
                  : "None";

                return (
                  <tr key={company.id}>
                    <td>{company.id}</td>
                    <td>{company.name}</td>
                    <td>{company.db_name}</td>
                    <td>{new Date(company.createdAt).toLocaleDateString()}</td>
                    <td>{currentExpiry}</td>

                    {/* ✅ Toggle Switch */}
                    <td>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={status === "active"}
                          onChange={(e) =>
                            handleToggleStatus(company, e.target.checked)
                          }
                        />
<span className="slider"></span>
</label>
                    </td>

                    {/* 📅 Expiry Input + Set Button */}
                    <td>
                      <input
                        type="date"
                        value={expiryDates[company.id] || ""}
                        onChange={(e) =>
                          handleExpiryChange(company.id, e.target.value)
                        }
                        className="date-input"
                      />
                      <button
                        className="set-expiry-btn"
                        onClick={() => submitExpiryDate(company.id)}
                      >
                        Set
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          !loading && <p>No companies found.</p>
        )}
      </div>

      {showModal && (
        <AddCompanyModal
          onClose={() => setShowModal(false)}
          onCreated={fetchCompanies}
        />
      )}
      </div>
    </>
  );
};

export default MasterDashboard;
