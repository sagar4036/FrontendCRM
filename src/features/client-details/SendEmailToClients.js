import React, { useEffect, useState } from "react";
import { useApi } from "../../context/ApiContext";

export const SendEmailToClients = ({ clientInfo = {}, onTemplateSelect }) => {
  const {
    executiveInfo = {},
    fetchAllTemplates,
    fetchTemplateById,
    templateLoading,
  } = useApi();

  // Safe defaults
  const safeClient = {
    name: clientInfo?.name || "",
    email: clientInfo?.email || "",
  };

  const safeExec = {
    email: executiveInfo?.email || "",
  };

  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [emailTemplates, setEmailTemplates] = useState([]);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templates = await fetchAllTemplates();
        if (Array.isArray(templates)) {
          setEmailTemplates(templates);
        }
      } catch (error) {
        console.error("❌ Failed to fetch templates:", error);
      }
    };

    if (safeClient.email) {
      loadTemplates();
    }
  }, [safeClient.email, fetchAllTemplates]);

  const handleTemplateChange = async (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);

    if (!templateId) {
      onTemplateSelect?.(null, safeClient.email);
      return;
    }

    try {
      const fullTemplate = await fetchTemplateById(templateId);

      if (fullTemplate?.id && safeClient.email) {
        onTemplateSelect?.(fullTemplate, safeClient.email);
      }
    } catch (err) {
      console.error("Failed to load template by ID:", err);
    }
  };

  return (
    <div>
      <h4 style={{ marginBottom: "0.5rem" }}>Send Email to Client</h4>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        {/* FROM */}
        <div>
          <label>
            From:
            <input
              type="email"
              value={safeExec.email}
              readOnly
              style={{
                marginLeft: "0.5rem",
                padding: "8px",
                borderRadius: "5px",
              }}
            />
          </label>
        </div>

        {/* TO */}
        <div>
          <label>
            To:
            <input
              type="email"
              value={safeClient.email}
              readOnly
              style={{
                marginLeft: "0.5rem",
                padding: "8px",
                borderRadius: "5px",
              }}
            />
          </label>
        </div>

        {/* TEMPLATE DROPDOWN */}
        <div>
          <label>
            Template:
            <select
              value={selectedTemplateId}
              onChange={handleTemplateChange}
              required
              style={{ marginLeft: "0.5rem" }}
              disabled={!safeClient.email || templateLoading}
            >
              <option value="">Select</option>
              {emailTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SendEmailToClients;
