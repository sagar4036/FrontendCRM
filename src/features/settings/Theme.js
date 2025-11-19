import React, { useContext, useState } from "react";
import { FaCheck, FaPalette, FaSun, FaMoon, FaEye, FaLeaf, FaWater } from "react-icons/fa";
import { ThemeContext } from "../admin/ThemeContext";

const Theme = () => {
  const { changeTheme, themes, theme } = useContext(ThemeContext);
  const [hoveredTheme, setHoveredTheme] = useState(null);
  
  const themeMetadata = {
    light: { name: 'Light', description: 'Clean and bright', icon: FaSun },
    dark: { name: 'Dark', description: 'Easy on the eyes', icon: FaMoon },
    blue: { name: 'Blue', description: 'Calm and focused', icon: FaEye },
    red: { name: 'Pink', description: 'Warm and energetic', icon: FaPalette },
    green: { name: 'Green', description: 'Natural and fresh', icon: FaLeaf },
    brown: { name: 'Brown', description: 'Grounded and warm', icon: FaPalette },
    lavender: { name: 'Lavender Twilight', description: 'Elegant and calming', icon: FaWater },
    ocean: { name: 'Ocean Blue Mist', description: 'Fresh and modern coastal vibe', icon: FaWater },
    peach: { name: 'Peach Blossom', description: 'Soothing and flower vibe', icon: FaLeaf }

  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
      padding: '2rem'
    },
    maxWidth: { maxWidth: '1200px', margin: '0 auto' },
    headerContainer: { textAlign: 'center', marginBottom: '3rem' },
    headerIcon: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '64px',
      height: '64px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      borderRadius: '16px',
      marginBottom: '1.5rem',
      boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
    },
    headerTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: '1rem'
    },
    headerDesc: {
      fontSize: '1.125rem',
      color: '#64748b',
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: '1.6',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1rem',
      marginBottom: '2rem',
      maxWidth: '900px',
      margin: '0 auto 2rem auto'
    },
    activeIndicator: {
      position: 'absolute',
      top: '0.75rem',
      right: '0.75rem',
      width: '24px',
      height: '24px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
      color: 'white',
      fontSize: '12px'
    },
    contentCenter: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      position: 'relative',
      zIndex: 10,
      height: '100%',
      justifyContent: 'center'
    },
    shine: {
      position: 'absolute',
      top: '15%',
      left: '15%',
      width: '30%',
      height: '30%',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 70%)',
      borderRadius: '50%'
    },
    previewSection: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      borderRadius: '16px',
      padding: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
    },
    previewHeader: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    previewGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem'
    },
    contentPreview: {
      height: '128px',
      background: '#f8fafc',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    previewLabelDark: {
      color: '#374151',
      fontWeight: '500',
      marginBottom: '0.5rem'
    }
  };

  const getCardStyle = (isActive, isHovered) => ({
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isActive ? 'scale(1.03) translateY(-2px)' : isHovered ? 'scale(1.01) translateY(-1px)' : 'scale(1) translateY(0)',
    zIndex: isActive ? 10 : isHovered ? 5 : 1
  });

  const getCardInnerStyle = (isActive) => ({
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '16px',
    padding: '1.25rem',
    height: '180px',
    background: isActive ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px)',
    border: isActive ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: isActive ? '0 15px 30px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)' : '0 10px 20px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease'
  });

  const getBackgroundPatternStyle = (color) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.08,
    background: `radial-gradient(circle at 30% 20%, ${color}66 0%, transparent 50%), radial-gradient(circle at 70% 80%, ${color}80 0%, transparent 50%)`
  });

  const getThemeCircleStyle = (color, isActive, isHovered, themeKey) => {
    const backgroundColor = themeKey === 'light' ? '#fbbf24' : color;
    return {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      marginBottom: '0.75rem',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      transform: isActive ? 'scale(1.05)' : isHovered ? 'scale(1.02)' : 'scale(1)',
      background: `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}dd 100%)`,
      border: `2px solid ${backgroundColor}aa`,
      boxShadow: isActive ? `0 8px 20px ${backgroundColor}40, 0 0 0 3px ${backgroundColor}20` : `0 4px 15px ${backgroundColor}25`
    };
  };

  const getIconContainerStyle = (themeKey) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '18px'
  });

  const getThemeNameStyle = (isActive) => ({
    fontSize: '1rem',
    fontWeight: isActive ? '700' : '600',
    marginBottom: '0.25rem',
    transition: 'color 0.3s ease',
    color: isActive ? '#007bff' : '#2c3e50',
    textTransform: 'capitalize',
    letterSpacing: '0.3px'
  });

  const getDescriptionStyle = (isActive) => ({
    fontSize: '0.75rem',
    transition: 'color 0.3s ease',
    color: isActive ? '#3b82f6' : '#64748b',
    marginBottom: '0.5rem'
  });

  const getStatusStyle = (isActive) => ({
    marginTop: '0.5rem',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.65rem',
    fontWeight: isActive ? '600' : '400',
    fontStyle: 'italic',
    transition: 'all 0.3s ease',
    background: isActive ? 'rgba(40, 167, 69, 0.1)' : 'transparent',
    color: isActive ? '#28a745' : '#6c757d',
    border: isActive ? '1px solid rgba(40, 167, 69, 0.2)' : 'none'
  });

  const getHoverGlowStyle = (color, isVisible) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '16px',
    opacity: isVisible ? 0.15 : 0,
    filter: 'blur(25px)',
    transition: 'opacity 0.3s ease',
    background: `linear-gradient(135deg, ${color}, ${color}cc)`,
    pointerEvents: 'none'
  });

  const getActiveGlowStyle = (color, isActive) => ({
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    right: '-2px',
    bottom: '-2px',
    borderRadius: '18px',
    zIndex: -1,
    opacity: isActive ? 0.5 : 0,
    background: `linear-gradient(45deg, ${color}66, transparent, ${color}66)`,
    transition: 'opacity 0.3s ease'
  });



  return (
    <div style={styles.container} >
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={styles.headerContainer}>
          <div style={styles.headerIcon}>
            <FaPalette style={{ color: 'white', fontSize: '28px' }} />
          </div>
          <h1 style={styles.headerTitle}>Choose Your Theme</h1>
          <p style={styles.headerDesc}>
            Personalize your experience by selecting from our beautiful collection
            of themes. Your choice will be applied across the entire application.
          </p>
        </div>

        {/* Theme Grid */}
        <div style={styles.grid}>
          {Object.entries(themes).map(([key, color]) => {
            const metadata = themeMetadata[key] || { name: key.replace(/([A-Z])/g, " $1").trim(), description: 'Beautiful theme', icon: FaPalette };
            const Icon = metadata.icon;
            const isActive = theme === key;
            const isHovered = hoveredTheme === key;
            
            return (
              <div
                key={key}
                onClick={() => changeTheme(key)}
                onMouseEnter={() => setHoveredTheme(key)}
                onMouseLeave={() => setHoveredTheme(null)}
                style={getCardStyle(isActive, isHovered)}
              >
                <div style={getCardInnerStyle(isActive)}>
                  <div style={getBackgroundPatternStyle(color)} />
                  
                  {isActive && (
                    <div style={styles.activeIndicator}>
                      <FaCheck />
                    </div>
                  )}
                  
                  <div style={styles.contentCenter}>
                    <div style={getThemeCircleStyle(color, isActive, isHovered, key)}>
                      <div style={styles.shine} />
                      <div style={getIconContainerStyle(key)}>
                        <Icon />
                      </div>
                    </div>
                    
                    <h3 style={getThemeNameStyle(isActive)}>{metadata.name}</h3>
                    <p style={getDescriptionStyle(isActive)}>{metadata.description}</p>
                    <div style={getStatusStyle(isActive)}>
                      {isActive ? '✓ Currently Active' : 'Click to Apply'}
                    </div>
                  </div>
                  
                  <div style={getHoverGlowStyle(color, isHovered || isActive)} />
                </div>
                
                <div style={getActiveGlowStyle(color, isActive)} />
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Theme;