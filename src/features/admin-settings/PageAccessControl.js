import React, { useEffect, useState } from "react";
import { usePermissionContext } from "../../context/PermissionContext";
import RequirePermission from "./RequirePermission";

const PageAccessControl = () => {
  const {
    fetchUsers,
    createPermission,
    fetchAllRolePermissions,
    fetchSinglePermission,
    togglePermission,
  } = usePermissionContext();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(""); // Stores "id-role" (e.g., "4-Manager")
  const [selectedRole, setSelectedRole] = useState("");
  const [createStatus, setCreateStatus] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [selectedPermission, setSelectedPermission] = useState(null);

  const [pageAccess, setPageAccess] = useState({});
  const [emailPreferences, setEmailPreferences] = useState({});
  const [notificationSettings, setNotificationSettings] = useState({});

  const ToggleSwitch = ({ checked, onChange }) => (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="slider">
        <span className="toggle-label">{checked ? "On" : "Off"}</span>
      </span>
    </label>
  );

  // Fetch users
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const data = await fetchUsers();
        const parsedUsers = Array.isArray(data) ? data : data.users || [];
        setUsers(parsedUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchAllUsers();
  }, [fetchUsers]);

  // Create permission
  const handleCreatePermission = async () => {
    if (!selectedUser || !selectedRole) {
      setCreateStatus("Please select both user and role.");
      return;
    }

    // Parse selectedUser (e.g., "4-Manager")
    const [id, role] = selectedUser.split("-");
    if (!id || !role) {
      setCreateStatus("Invalid selection.");
      return;
    }

    const selectedUserObj = users.find(
      (u) => String(u.id) === String(id) && u.label.includes(role)
    );
    if (!selectedUserObj) {
      setCreateStatus("Invalid user selected.");
      return;
    }

    const roleLower = selectedRole.toLowerCase();
    const payload = {
      manager_id: roleLower === "manager" ? Number(id) : null,
      hr_id: roleLower === "hr" ? Number(id) : null,
      user_id:
        roleLower === "tl" || roleLower === "executive" ? Number(id) : null,
      role: selectedRole,
    };

    try {
      await createPermission(payload);
      setCreateStatus("Permission created successfully!");
      setSelectedUser("");
      setSelectedRole("");
    } catch (err) {
      console.error("Failed to create permission:", err);
      setCreateStatus("Failed to create permission.");
    }
  };

  // Fetch all permissions for dropdown
  useEffect(() => {
    const fetchAllPermissions = async () => {
      try {
        const data = await fetchAllRolePermissions();
        setPermissions(data);
      } catch (err) {
        console.error("Error fetching role permissions:", err);
      }
    };

    fetchAllPermissions();
  }, [fetchAllRolePermissions,createStatus]);

  // Fetch selected permission details
  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedPermission?.id) return;

      try {
        const data = await fetchSinglePermission(selectedPermission.id);
        const permission = data.permission;

        const newPageAccess = {};
        const newEmailPreferences = {};
        const newNotificationSettings = {};

        const pageKeys = [
          "overview",
          "assign_task",
          "task_management",
          "monitoring",
          "executive_details",
          "invoice",
          "dashboard",
          "user_management",
          "reporting",
          "settings",
          "billing",
          "page_access",
          "create_user",
        ];
        const emailKeys = [
          "weekly_summary",
          "account_updates",
          "marketing_emails",
        ];
        const notificationKeys = [
          "push_notifications",
          "sms_notifications",
          "email_notifications",
        ];

        Object.entries(permission).forEach(([key, value]) => {
          if (pageKeys.includes(key)) newPageAccess[key] = value;
          else if (emailKeys.includes(key)) newEmailPreferences[key] = value;
          else if (notificationKeys.includes(key))
            newNotificationSettings[key] = value;
        });

        setPageAccess(newPageAccess);
        setEmailPreferences(newEmailPreferences);
        setNotificationSettings(newNotificationSettings);
      } catch (err) {
        console.error("Error loading permission details:", err);
      }
    };

    fetchDetails();
  }, [selectedPermission,fetchSinglePermission]);

  // Handle toggle update
  const handleToggle = async (funcKey, role) => {
    if (!selectedPermission?.id) {
      alert("Please select a permission first");
      return;
    }

    const permissionKey = funcKey.toLowerCase().replace(" ", "_");
    const allKeys = {
      page: [
        "dashboard",
        "task_management",
        "user_management",
        "assign_task",
        "monitoring",
        "executive_details",
        "reporting",
        "settings",
        "billing",
        "invoice",
        "page_access",
        "create_user",
      ],
      email: ["weekly_summary", "account_updates", "marketing_emails"],
      notification: [
        "push_notifications",
        "sms_notifications",
        "email_notifications",
      ],
    };

    let setState, currentState;
    if (allKeys.page.includes(permissionKey)) {
      setState = setPageAccess;
      currentState = pageAccess[permissionKey] || false;
    } else if (allKeys.email.includes(permissionKey)) {
      setState = setEmailPreferences;
      currentState = emailPreferences[permissionKey] || false;
    } else if (allKeys.notification.includes(permissionKey)) {
      setState = setNotificationSettings;
      currentState = notificationSettings[permissionKey] || false;
    } else {
      console.error("Invalid permission key:", permissionKey);
      return;
    }

    try {
      await togglePermission(selectedPermission.id, permissionKey);
      setState((prev) => ({ ...prev, [permissionKey]: !currentState }));
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const roleSuffix = selectedPermission?.role?.toLowerCase() || "";

  return (
  <RequirePermission requiredKey="page_access">
    <div className="section-block">
      <div className="create-permission-section" style={{ marginTop: "20px" }}>
        <h3>Create New Permission</h3>
        <div className="form-row">
        <select
  value={selectedUser}
  onChange={(e) => {
    const selectedValue = e.target.value;
    if (!selectedValue) {
      setSelectedUser("");
      setSelectedRole("");
      return;
    }
    const [, role] = selectedValue.split("-");
    setSelectedUser(selectedValue);
    setSelectedRole(role);
  }}
>
  <option value="">Select User</option>

  {["Executive", "Manager", "TL", "HR", "Process"].map((roleGroup) => {
  const roleUsers = users.filter((u) => {
    const match = u.label?.match(/id\s*-\s*(\d+)\s*-\s*(\w+)/i);
    const role = match ? match[2].trim() : "";
    return role.toLowerCase() === roleGroup.toLowerCase();
  });

  if (roleUsers.length === 0) return null;

  return (
    <optgroup key={roleGroup} label={roleGroup}>
      {roleUsers.map((user) => {
        const match = user.label?.match(/id\s*-\s*(\d+)\s*-\s*(\w+)\s*-\s*(.*)/i);
        const role = match ? match[2].trim() : "";
        const name = match ? match[3].trim() : "Unnamed";

        return (
          <option key={user.id} value={`${user.id}-${role}`}>
            {`[${role.padEnd(9)}] ID: ${String(user.id).padEnd(3)}  ${name}`}
          </option>
        );
      })}
    </optgroup>
  );
})}

</select>



          <button className="primary-btn" onClick={handleCreatePermission}>
            Grant Access
          </button>
        </div>

        {createStatus && (
          <p
            style={{
              marginTop: "10px",
              color: createStatus.includes("success") ? "green" : "red",
            }}
          >
            {createStatus}
          </p>
        )}
      </div>

      <div className="create-permission-section" style={{ marginTop: "20px" }}>
        <h3>Select From Existing Permissions</h3>
        <select
  value={selectedPermission?.id || ""}
  onChange={(e) => {
    const selected = permissions.find((p) => p.id === e.target.value);
    setSelectedPermission(selected);
  }}
  style={{ fontFamily: "monospace", whiteSpace: "pre" }}
>
  <option value="">Select Permissions for users</option>

  {(() => {
    // Group permissions by role
    const grouped = permissions.reduce((acc, perm) => {
      const match = perm.label?.match(/Role:\s*(\w+)\s*\|\s*(.+?)\s*\(ID:\s*(\d+)\)/i);
      const role = match ? match[1].trim() : "Unknown";
      const name = match ? match[2].trim() : "Unnamed";
      const id = match ? match[3].trim() : "??";

      if (!acc[role]) acc[role] = [];
      acc[role].push({
        id: perm.id,
        display: `[${role.padEnd(9)}] ID: ${String(id).padEnd(3)}  ${name}`,
      });

      return acc;
    }, {});

    // Render grouped <optgroup>s
    return Object.entries(grouped).map(([role, options]) => (
      <optgroup key={role} label={role}>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.display}
          </option>
        ))}
      </optgroup>
    ));
  })()}
</select>

      </div>

      {selectedPermission && (
        <div className="access-control-table" style={{ marginTop: "20px" }}>
          <div className="table-header">
            <div className="header-cell">Functionalities</div>
            <div className="header-cell">{selectedPermission.role}</div>
          </div>

          {[
            {
              title: "Page Access",
              keys: [
                "Dashboard",
                "Task Management",
                "User Management",
                "Assign Task",
                "Monitoring",
                "Executive Details",
                "Reporting",
                "Settings",
                "Billing",
                "Invoice",
                "Create_user",
                "Page Access"
              ],
              state: pageAccess,
            },
            {
              title: "Email Preferences",
              keys: ["Weekly Summary", "Account Updates", "Marketing Emails"],
              state: emailPreferences,
            },
            {
              title: "Notification Settings",
              keys: [
                "Push Notifications",
                "SMS Notifications",
                "Email Notifications",
              ],
              state: notificationSettings,
            },
          ].map(({ title, keys, state }) => (
            <div className="functionality-group" key={title}>
              <div className="group-title">{title}</div>
              {keys.map((func) => (
                <div className="table-row" key={`${title}-${func}`}>
                <div className="row-cell functionality">{func}</div>
                  <div className="row-cell">
                    <ToggleSwitch
                      checked={
                        state[func.toLowerCase().replace(" ", "_")] || false
                      }
                      onChange={() => handleToggle(func, roleSuffix)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
    </RequirePermission>
  );
};

export default PageAccessControl;