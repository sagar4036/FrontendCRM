import React, { useState, useEffect } from "react";
import { useApi } from "../../context/ApiContext"; // ✅ Import context hook
import "../../styles/createTemplate.css";

const ProcessCreateTemplate = () => {
  const [form, setForm] = useState({
    name: "",
    subject: "",
    body: "",
  });

  const {
    handleCreateTemplate,
    templateLoading,
    templateSuccess,
    templateError,
  } = useApi(); // ✅ Destructure from context

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleCreateTemplate(form); // ✅ Call context method
  };

  // ✅ Effect to reset form or show alert on success/error
  useEffect(() => {
    if (templateSuccess) {
      alert("Template created successfully");
      setForm({ name: "", subject: "", body: "" });
    }
    if (templateError) {
      alert("Failed to create template");
    }
  }, [templateSuccess, templateError]);

  return (
    <div className="template-container">
      <h2 className="template-title">Create New Email Template</h2>
      <form onSubmit={handleSubmit} className="template-form">
        <input
          type="text"
          name="name"
          placeholder="Template Name"
          value={form.name}
          onChange={handleChange}
          className="template-input"
          required
        />
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={form.subject}
          onChange={handleChange}
          className="template-input"
          required
        />
        <textarea
          name="body"
          placeholder="Write your email here..."
          value={form.body}
          onChange={handleChange}
          className="template-textarea"
          rows="10"
          required
        />
        <button type="submit" className="template-button" disabled={templateLoading}>
          {templateLoading ? "Creating..." : "Create Template"}
        </button>
      </form>
    </div>
  );
};

export default ProcessCreateTemplate;