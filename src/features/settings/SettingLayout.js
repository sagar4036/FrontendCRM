import React, { useContext } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ThemeContext } from "../admin/ThemeContext";
import RequirePermission from "../admin-settings/RequirePermission";
import { useLoading } from "../../context/LoadingContext"; // ✅ Import spinner context
import LoadingSpinner from "../../features/spinner/LoadingSpinner"; // ✅ Spinner component
const SettingsLayout = () => {
  const { theme } = useContext(ThemeContext);
  const { isLoading, loadingText } = useLoading(); // ✅ Use loading context
  const location = useLocation();

  const settingsMenuItems = [
    { path: "profile", label: "My Profile", icon: "👤" },
    { path: "theme", label: "Theme", icon: "🎨" },
    { path: "change-password", label: "Change Password", icon: "🔒" },
    { path: "change-beep", label: "Change in Beep", icon: "🔔" },
    { path: "create-template", label: "Add Email Template", icon: "📩" },
    { path: "leave", label: "Ask for Leave", icon: "📝" },

  ];

  const isActivePath = (path) => {
    return location.pathname.includes(path);
  };

  return (
    <>
 <RequirePermission requiredKey="settings">
      <style>
        {`
          .settings-layout {
            display: grid;
            grid-template-columns: 245px 1fr;
            min-height: 100vh;
            max-width: 2000px;
            margin: 0 auto;
          }
          
          .settings-sidebar {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            position: sticky;
          }
          
          .sidebar-title {
            font-size: 18px;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 18px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          .menu-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .menu-item {
            margin-bottom: 6px;
          }
          
          .menu-link {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            text-decoration: none;
            color: #4a5568;
            border-radius: 12px;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            font-size: 15px !important;
            font-weight: 500;
            border: 1px solid transparent;
            position: relative;
            overflow: hidden;
          }
          
          .menu-link::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            transition: left 0.6s ease;
          }
          
          .menu-link:hover::before {
            left: 100%;
          }
          
          .menu-link:hover {
            background: rgba(102, 126, 234, 0.1);
            color: #667eea;
            border: 1px solid rgba(102, 126, 234, 0.2);
            transform: translateX(6px) scale(1.02);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
          }
          
          .menu-link.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
            transform: translateY(-2px) scale(1.02);
          }
          
          .menu-icon {
            margin-right: 10px;
            font-size: 20px;
            position: relative;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.3));
          }
          
          /* Individual icon animations */
          .menu-link:hover .menu-icon {
            transform: scale(1.3) rotate(10deg);
            filter: drop-shadow(0 0 15px rgba(102, 126, 234, 0.8)) 
                    drop-shadow(0 0 25px rgba(102, 126, 234, 0.6))
                    drop-shadow(0 0 35px rgba(102, 126, 234, 0.4));
          }
          
          .menu-link.active .menu-icon {
            transform: scale(1.2) rotate(-5deg);
            filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.8))
                    drop-shadow(0 0 20px rgba(255, 255, 255, 0.6))
                    drop-shadow(0 0 30px rgba(255, 255, 255, 0.4));
            animation: activeIconPulse 2s ease-in-out infinite;
          }
          
          /* Profile icon specific animation */
          .menu-link:hover .menu-icon:nth-of-type(1) {
            animation: profileBounce 0.6s ease-in-out;
          }
          
          /* Theme icon specific animation */
          .menu-link:nth-child(2):hover .menu-icon {
            animation: themeSpin 0.8s ease-in-out;
          }
          
          /* Password icon specific animation */
          .menu-link:nth-child(3):hover .menu-icon {
            animation: passwordShake 0.6s ease-in-out;
          }
          
          /* Beep icon specific animation */
          .menu-link:nth-child(4):hover .menu-icon {
            animation: beepRing 0.8s ease-in-out;
          }
          
          @keyframes activeIconPulse {
            0%, 100% { 
              transform: scale(1.2) rotate(-5deg);
              filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.8))
                      drop-shadow(0 0 20px rgba(255, 255, 255, 0.6));
            }
            50% { 
              transform: scale(1.35) rotate(-5deg);
              filter: drop-shadow(0 0 20px rgba(255, 255, 255, 1))
                      drop-shadow(0 0 30px rgba(255, 255, 255, 0.8))
                      drop-shadow(0 0 40px rgba(255, 255, 255, 0.6));
            }
          }
          
          @keyframes profileBounce {
            0%, 100% { transform: scale(1.3) rotate(10deg) translateY(0); }
            25% { transform: scale(1.4) rotate(15deg) translateY(-8px); }
            50% { transform: scale(1.35) rotate(12deg) translateY(-4px); }
            75% { transform: scale(1.32) rotate(11deg) translateY(-2px); }
          }
          
          @keyframes themeSpin {
            0% { transform: scale(1.3) rotate(10deg); }
            25% { transform: scale(1.4) rotate(100deg); }
            50% { transform: scale(1.35) rotate(200deg); }
            75% { transform: scale(1.32) rotate(300deg); }
            100% { transform: scale(1.3) rotate(370deg); }
          }
          
          @keyframes passwordShake {
            0%, 100% { transform: scale(1.3) rotate(10deg) translateX(0); }
            10% { transform: scale(1.35) rotate(15deg) translateX(-4px); }
            20% { transform: scale(1.32) rotate(12deg) translateX(4px); }
            30% { transform: scale(1.34) rotate(14deg) translateX(-3px); }
            40% { transform: scale(1.31) rotate(11deg) translateX(3px); }
            50% { transform: scale(1.33) rotate(13deg) translateX(-2px); }
            60% { transform: scale(1.32) rotate(12deg) translateX(2px); }
            70% { transform: scale(1.31) rotate(11deg) translateX(-1px); }
            80% { transform: scale(1.3) rotate(10deg) translateX(1px); }
            90% { transform: scale(1.3) rotate(10deg) translateX(0); }
          }
          
          @keyframes beepRing {
            0% { transform: scale(1.3) rotate(10deg); }
            10% { transform: scale(1.4) rotate(20deg); }
            20% { transform: scale(1.35) rotate(-15deg); }
            30% { transform: scale(1.4) rotate(25deg); }
            40% { transform: scale(1.32) rotate(-10deg); }
            50% { transform: scale(1.38) rotate(18deg); }
            60% { transform: scale(1.31) rotate(-8deg); }
            70% { transform: scale(1.35) rotate(12deg); }
            80% { transform: scale(1.3) rotate(-5deg); }
            90% { transform: scale(1.32) rotate(8deg); }
            100% { transform: scale(1.3) rotate(10deg); }
          }
          
          /* Glowing border effect for active items */
          .menu-link.active::after {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #667eea, #764ba2, #667eea, #764ba2);
            background-size: 400% 400%;
            border-radius: 14px;
            z-index: -1;
            animation: glowingBorder 3s ease-in-out infinite;
            opacity: 0.7;
          }
          
          @keyframes glowingBorder {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          .settings-content {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            min-height: 400px;
            overflow-x: hidden;
          }
          
          @media (max-width: 1024px) {
            .settings-layout {
              grid-template-columns: 200px 1fr;
              gap: 20px;
            }
            
            .settings-sidebar {
              padding: 16px;
            }
            
            .settings-content {
              padding: 24px;
            }
            
            .menu-link {
              padding: 10px 14px;
              font-size: 14px !important;
            }
            
            .menu-icon {
              font-size: 18px;
              margin-right: 8px;
            }
          }
          
          @media (max-width: 768px) {
            .settings-layout {
              grid-template-columns: 1fr;
              gap: 16px;
              padding: 0 16px;
            }
            
            .settings-sidebar {
              position: static;
              margin-bottom: 20px;
              padding: 14px;
            }
            
            .menu-link {
              padding: 8px 12px;
              font-size: 13px !important;
            }
            
            .menu-icon {
              font-size: 16px;
              margin-right: 6px;
            }
            
            .settings-content {
              padding: 20px;
            }
          }
          
          @media (max-width: 480px) {
            .settings-layout {
              padding: 0 12px;
            }
            
            .settings-sidebar {
              padding: 12px;
            }
            
            .settings-content {
              padding: 16px;
            }
            
            .menu-link {
              padding: 8px 10px;
              font-size: 12px !important;
            }
            
            .menu-icon {
              font-size: 14px;
              margin-right: 6px;
            }
          }
        `}
      </style>
      <div className="settings-layout" data-theme={theme}> 
        <aside className="settings-sidebar">
          <h3 className="sidebar-title">Settings</h3>
          <ul className="menu-list">
            {settingsMenuItems.map((item) => (
              <li key={item.path} className="menu-item">
                <Link 
                  to={item.path} 
                  className={`menu-link ${isActivePath(item.path) ? 'active' : ''}`}
                >
                  <span className="menu-icon">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <main className="settings-content">
        {isLoading && <LoadingSpinner text={loadingText || "Loading Settings..."} />}
          <Outlet />
        </main>
      </div>
      </RequirePermission>
    </>
  );
};

export default SettingsLayout;