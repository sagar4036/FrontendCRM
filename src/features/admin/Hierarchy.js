import "../../styles/AnimatedHierarchyUI.css";
import React, { useState, useEffect, useContext } from "react";
import {
  ChevronDown,
  ChevronUp,
  Users,
  User,
  UserCheck,
  Crown,
  Briefcase,
} from "lucide-react";
import { useApi } from "../../context/ApiContext"; // Import the useApi hook
import AdminSpinner from "../spinner/AdminSpinner";
import SidebarToggle from "./SidebarToggle";
import { useLoading } from "../../context/LoadingContext";
import { ThemeContext } from "./ThemeContext";

const Hierarchy = () => {
  const isSidebarExpanded =
    localStorage.getItem("adminSidebarExpanded") === "true";
  const { isLoading, variant } = useLoading();
  const { theme } = useContext(ThemeContext);
  const {
    fetchOrganizationHierarchyAPI,
    hierarchyLoading,
    organizationHierarchy,
  } = useApi(); // Access API function and state
  const [expandedNodes, setExpandedNodes] = useState(new Set([25])); // Default to root node expanded
  const [selectedNode, setSelectedNode] = useState(null);

  // Fetch hierarchy data on component mount
  useEffect(() => {
    fetchOrganizationHierarchyAPI();
  }, [fetchOrganizationHierarchyAPI]);

  // Use organizationHierarchy from API, fallback to empty array if not loaded
  const orgData = { hierarchy: organizationHierarchy || [] };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Admin":
        return <Crown className="oc-icon" />;
      case "Manager":
        return <Users className="oc-icon" />;
      case "Executive":
        return <UserCheck className="oc-icon" />;
      case "TL":
        return <Briefcase className="oc-icon" />;
      case "HR":
        return <User className="oc-icon" />;
      case "ProcessPerson":
        return <User className="oc-icon" />;
      default:
        return <User className="oc-icon" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "oc-gradient-admin";
      case "Manager":
        return "oc-gradient-manager";
      case "Executive":
        return "oc-gradient-executive";
      case "TL":
        return "oc-gradient-tl";
      case "HR":
        return "oc-gradient-hr";
      case "ProcessPerson":
        return "oc-gradient-process";
      default:
        return "oc-gradient-default";
    }
  };

  const getRoleLevel = (role) => {
    switch (role) {
      case "Admin":
        return 1;
      case "Manager":
        return 2;
      case "HR":
        return 2; // Changed from 3 to 2 to match Manager level
      case "TL":
        return 3;
      case "Executive":
        return 4;
      case "ProcessPerson":
        return 4;
      default:
        return 0;
    }
  };

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const selectNode = (node) => {
    setSelectedNode(node);
  };

  const NodeBox = ({ node, isSelected, onClick }) => (
    <div
      className={`oc-node-box ${isSelected ? "oc-selected" : ""}`}
      onClick={() => onClick(node)}
    >
      <div className={`oc-node ${getRoleColor(node.role)}`}>
        <div className="oc-node-content">
          <div className="oc-icon-wrapper">{getRoleIcon(node.role)}</div>
          <div className="oc-name">{node.name}</div>
          <div className="oc-role">{node.role}</div>
          <div className="oc-level">Level {getRoleLevel(node.role)}</div>
          {node.team && <div className="oc-team">{node.team}</div>}
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="oc-toggle-button">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleNode(node.id);
            }}
            className="oc-toggle-inner"
          >
            {expandedNodes.has(node.id) ? (
              <ChevronUp className="oc-chevron" />
            ) : (
              <ChevronDown className="oc-chevron" />
            )}
          </button>
        </div>
      )}
    </div>
  );

  const renderChildren = (children, parentId) => {
    if (!children || children.length === 0) return null;
    const hasMultipleChildren = children.length > 1;

    return (
      <div className="oc-children-wrapper">
        <div className="oc-line-vertical"></div>
        {hasMultipleChildren && <div className="oc-line-horizontal"></div>}
        <div className="oc-children">
          {children.map((child, index) => (
            <div
              key={`${child.id}-${child.role}-${index}`}
              className="oc-child"
            >
              <div className="oc-line-vertical-small"></div>
              <NodeBox
                node={child}
                isSelected={
                  selectedNode &&
                  selectedNode.id === child.id &&
                  selectedNode.role === child.role
                }
                onClick={selectNode}
              />
              {expandedNodes.has(child.id) &&
                renderChildren(child.children, child.id)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const groupChildrenByRole = (children) => {
    const groups = {};
    children.forEach((child) => {
      if (!groups[child.role]) groups[child.role] = [];
      groups[child.role].push(child);
    });
    return groups;
  };

  const renderGroupedChildren = (children, parentId) => {
    if (!children || children.length === 0) return null;
    const groups = groupChildrenByRole(children);

    // Combine Manager and HR into the same group for display
    const combinedManagerHR = [
      ...(groups["Manager"] || []),
      ...(groups["HR"] || []),
    ];
    const roleOrder = ["Manager", "TL", "Executive", "ProcessPerson"];

    return (
      <div className="oc-grouped-wrapper">
        <div className="oc-line-vertical"></div>

        {/* Display combined Manager and HR in same row */}
        {combinedManagerHR.length > 0 && (
          <div key="ManagerHR" className="oc-role-group">
            <div className="oc-role-title">
              Managers & HR ({combinedManagerHR.length}) - Level 2
            </div>
            {combinedManagerHR.length > 1 && (
              <div className="oc-line-horizontal"></div>
            )}
            <div className="oc-role-children">
              {combinedManagerHR.map((child, index) => (
                <div
                  key={`${child.id}-${child.role}-${index}`}
                  className="oc-child"
                >
                  <div className="oc-line-vertical-small"></div>
                  <NodeBox
                    node={child}
                    isSelected={
                      selectedNode &&
                      selectedNode.id === child.id &&
                      selectedNode.role === child.role
                    }
                    onClick={selectNode}
                  />
                  {expandedNodes.has(child.id) &&
                    renderChildren(child.children, child.id)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Display other roles separately */}
        {roleOrder.map((role) => {
          if (!groups[role] || role === "Manager") return null; // Skip Manager as it's already handled above
          const hasMultipleChildren = groups[role].length > 1;

          return (
            <div key={role} className="oc-role-group">
              <div className="oc-role-title">
                {role}s ({groups[role].length}) - Level {getRoleLevel(role)}
              </div>
              {hasMultipleChildren && (
                <div className="oc-line-horizontal"></div>
              )}
              <div className="oc-role-children">
                {groups[role].map((child, index) => (
                  <div
                    key={`${child.id}-${child.role}-${index}`}
                    className="oc-child"
                  >
                    <div className="oc-line-vertical-small"></div>
                    <NodeBox
                      node={child}
                      isSelected={
                        selectedNode &&
                        selectedNode.id === child.id &&
                        selectedNode.role === child.role
                      }
                      onClick={selectNode}
                    />
                    {expandedNodes.has(child.id) &&
                      renderChildren(child.children, child.id)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={` ${
        isSidebarExpanded ? "sidebar-expanded" : "sidebar-collapsed"
      }`}
      data-theme={theme}
    >
      {isLoading && variant === "admin" && (
        <AdminSpinner text="Loading assign task..." />
      )}
      <SidebarToggle />
      <div className="oc-wrapper">
        {hierarchyLoading ? (
          <div className="oc-loading">Loading organization hierarchy...</div>
        ) : (
          <div className="oc-container">
            <div className="oc-header">
              <h1 className="oc-title">ORGANIZATIONAL HIERARCHY CHART</h1>
              <div className="oc-subheader">
                <div>
                  <strong>COMPANY:</strong> Your Company
                </div>
                <div>
                  <strong>COMPILED BY:</strong> System Admin
                </div>
                <div>
                  <strong>DATE COMPILED:</strong>{" "}
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="oc-main-content">
              <div className="oc-chart-container">
                <div className="oc-chart">
                  {orgData.hierarchy.map((rootNode) => (
                    <div key={rootNode.id} className="oc-root-node">
                      <NodeBox
                        node={rootNode}
                        isSelected={
                          selectedNode && selectedNode.id === rootNode.id
                        }
                        onClick={selectNode}
                      />
                      {expandedNodes.has(rootNode.id) &&
                        renderGroupedChildren(rootNode.children, rootNode.id)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="oc-sidebar">
                <div className="oc-legend">
                  <h3 className="oc-legend-title">Legend</h3>
                  <div className="oc-legend-items">
                    {[
                      "Admin",
                      "Manager",
                      "HR",
                      "TL",
                      "Executive",
                      "ProcessPerson",
                    ].map((role) => (
                      <div key={role} className="oc-legend-item">
                        <div
                          className={`oc-legend-color ${getRoleColor(role)}`}
                        ></div>
                        <span>
                          {role} (Level {getRoleLevel(role)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedNode && (
                  <div className="oc-details">
                    <h3 className="oc-details-title">
                      Selected Employee Details
                    </h3>
                    <div className="oc-details-grid">
                      <div>
                        <label>Name</label>
                        <p>{selectedNode.name}</p>
                      </div>
                      <div>
                        <label>Role</label>
                        <p>{selectedNode.role}</p>
                      </div>
                      <div>
                        <label>Level</label>
                        <p>{getRoleLevel(selectedNode.role)}</p>
                      </div>
                      <div>
                        <label>Employee ID</label>
                        <p>{selectedNode.id}</p>
                      </div>
                      {selectedNode.team && (
                        <div>
                          <label>Team</label>
                          <p>{selectedNode.team}</p>
                        </div>
                      )}
                      {selectedNode.children && (
                        <div>
                          <label>Direct Reports</label>
                          <p>{selectedNode.children.length}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hierarchy;
