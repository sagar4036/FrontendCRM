const BlurOverlay = ({ isLoading, children }) => {
    return (
      <div style={{ 
        position: "relative",
        // Ensure the container has some height and width
        minHeight: "100px",
        width: "100%"
      }}>
        {children}
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.8)", // Increased opacity
              backdropFilter: "blur(5px)",
              WebkitBackdropFilter: "blur(5px)", // Safari support
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000, // Higher z-index
              borderRadius: "12px",
              // Add a fallback for browsers that don't support backdrop-filter
              background: "transparent",
            }}
          >
            <div style={{
              padding: "20px",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              marginBottom: 80,
              marginRight:140
            }}>
              <p
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  fontFamily: "Cambria",
                  color: "#374151",
                  margin: 0,
                  textAlign: "center"
                }}
              >
                Contact to Administrater
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };
  
export default BlurOverlay;  