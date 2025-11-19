import React, { useEffect, useState } from "react";
import { useApi } from "../../context/ApiContext";

export const SendEmailToClients = ({ clientInfo, onTemplateSelect }) => {
  const {
    executiveInfo,
    fetchAllTemplates,
    fetchTemplateById,
    templateLoading,
  } = useApi();
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

    if (clientInfo?.email) {
      loadTemplates();
    }
  }, [clientInfo?.email, fetchAllTemplates]);

  const handleTemplateChange = async (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);

    if (!templateId) {
      onTemplateSelect(null, clientInfo.email);
      return;
    }

    try {
      const fullTemplate = await fetchTemplateById(templateId);
      if (fullTemplate?.id && clientInfo.email) {
        onTemplateSelect(fullTemplate, clientInfo.email);
      } else {
        console.warn(
          "Template or client email missing:",
          fullTemplate,
          clientInfo.email
        );
      }
    } catch (err) {
      console.error("Failed to load template by ID:", err);
    }
  };

  if (!clientInfo?.email) {
    return <p>Client info not available</p>;
  }

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
        <div>
          <label>
            From:
            <input
              type="email"
              value={executiveInfo.email}
              readOnly
              style={{
                marginLeft: "0.5rem",
                padding: "8px",
                borderRadius: "5px",
              }}
            />
          </label>
        </div>

        <div>
          <label>
            To:
            <input
              type="email"
              value={clientInfo.email}
              readOnly
              style={{
                marginLeft: "0.5rem",
                padding: "8px",
                borderRadius: "5px",
              }}
            />
          </label>
        </div>

        <div>
          <label>
            Template:
            <select
              value={selectedTemplateId}
              onChange={handleTemplateChange}
              required
              style={{ marginLeft: "0.5rem" }}
              disabled={templateLoading}
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
