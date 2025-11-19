import React, { useState, useEffect } from 'react';
import { useProcessService } from "../../context/ProcessServiceContext";
import { useProcess } from "../../context/ProcessAuthContext";
import { useParams,useLocation,useNavigate } from "react-router-dom";
import img1 from '../../assets/user.png';
import img2 from '../../assets/user1.png';

const ClientDash = ({ initialStages = 6 }) => {
  const { id } = useParams();
  const { handleGetStages, handleGetCustomerStagesById,createStages,getComments } = useProcessService();
  const { user } = useProcess();
  const navigate =useNavigate();
   const location = useLocation();
  const clientName = location.state?.clientName || "Unknown";
  const [comments, setComments] = useState([]);
  const [activeIcon, setActiveIcon] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [expandedCards, setExpandedCards] = useState({});
  const [stageCount, setStageCount] = useState(initialStages);
  const [hexagons, setHexagons] = useState([]);
  const [roadPaths, setRoadPaths] = useState({ mainPath: "M0 330 ", shadowPath: "M0 335 " });

 

  const generateZebraCrossings = () => {
    const stripes = [];
    const stripeWidth = 15;
    const stripeHeight = 5;
    const stripeGap = 5;

    const allHexagons = [...hexagons];
    allHexagons.forEach(({ left, top, row }) => {
      const centerY = row === "top" ? 180 : 330;
      const stripesCount = 6;

      for (let i = 0; i < stripesCount; i++) {
        const y = centerY - ((stripesCount / 2) * (stripeHeight + stripeGap)) + i * (stripeHeight + stripeGap);
        stripes.push(
          <rect
            key={`zebra-${left}-${i}`}
            x={left - stripeWidth / 2}
            y={y}
            width={stripeWidth}
            height={stripeHeight}
            fill="white"
            opacity="0.85"
            rx={1}
            ry={1}
          />
        );
      }
    });

    return stripes;
  };

 

  const generateRoadMarkings = () => {
    // Use minimum segments to ensure proper road markings
    const minSegments = Math.max(3, Math.ceil(stageCount / 2));
    const segments = minSegments;
    const markings = [];

    for (let i = 0; i < segments; i++) {
      const baseX = 60 + i * 260;
      for (let j = 0; j < 10; j++) {
        const progress = j / 9;
        const x = baseX + (80 * progress);
        const y = 330 - (150 * Math.sin(progress * Math.PI));

        markings.push(
          <rect
            key={`marking-${i}-${j}`}
            x={x - 8}
            y={y - 2}
            width="16"
            height="4"
            fill="transparent"
            opacity="0.9"
            rx="2"
          />
        );
      }
    }

    return markings;
  };

  useEffect(() => {
    const colors = [
    '#264653', '#e76f51', '#2a9d8f', '#a8dadc',
    '#e9c46a', '#457b9d', '#f4a261', '#ff6b6b',
    '#3a86ff', '#8338ec', '#ff006e', '#fb5607'
  ];
    const newHexagons = [];
    const topRowCount = Math.ceil(stageCount / 2);
    const bottomRowCount = Math.floor(stageCount / 2);

    // Generate top row hexagons (odd stages: 1, 3, 5, 7...)
    for (let i = 0; i < topRowCount; i++) {
      const stageNum = i * 2 + 1;
      const left = 140 + i * 260;
      newHexagons.push({
        num: stageNum,
        left,
        top: 160,
        bg: colors[i % colors.length],
        border: "#9c2f6f",
        row: 'top'
      });
    }

    // Generate bottom row hexagons (even stages: 2, 4, 6, 8...)
    for (let i = 0; i < bottomRowCount; i++) {
      const stageNum = (i + 1) * 2;
      const left = 280 + i * 260;
      newHexagons.push({
        num: stageNum,
        left,
        top: 500,
        bg: colors[(i + topRowCount) % colors.length],
        border: "transparent",
        row: 'bottom'
      });
    }
 const calculateRealisticRoadPath = () => {
  const segments = Math.ceil(stageCount / 2);
  let mainPath = "M0 330 ";
  let shadowPath = "M0 335 ";

  for (let i = 0; i < segments; i++) {
    const x1 = 60 + i * 260;
    const x2 = 140 + i * 260;

    // Main curve up
    mainPath += `C${x1} 330, ${x1} 180, ${x2} 180 `;
    shadowPath += `C${x1} 335, ${x1} 185, ${x2} 185 `;

    // Don't draw unnecessary extra segment at the end
    if (i < segments - 1 || stageCount % 2 === 0) {
      const x3 = 220 + i * 260;
      mainPath += `S${x3} 330, ${x3 + 60} 330 `;
      shadowPath += `S${x3} 335, ${x3 + 60} 335 `;
    }
  }

  return { mainPath, shadowPath };
};
    const newRoadPaths = calculateRealisticRoadPath(stageCount);

    setHexagons(newHexagons);
    setRoadPaths(newRoadPaths);

  }, [stageCount]);

  // Calculate SVG viewBox width based on stage count with minimum width
  const getSVGWidth = () => {
    const minWidth = 1000; // Minimum width for proper appearance
    const calculatedWidth = 280 + Math.max(3, Math.ceil(stageCount / 2)) * 260;
    return Math.max(minWidth, calculatedWidth);
  };

 

  useEffect(() => {
     const fetchStages = async () => {
    try {
      const latestStages = await handleGetCustomerStagesById(id);
      const newComments = [];

      for (let i = 0; i < stageCount; i++) {
        
        const text = latestStages[`stage${i + 1}_data`] || "";
        const date = latestStages[`stage${i + 1}_timestamp`]
          ? new Date(latestStages[`stage${i + 1}_timestamp`]).toLocaleString("default", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "";
        newComments.push({ text, date });
      }

      setComments(newComments);
    } catch (err) {
      console.error("Error fetching customer stages:", err.message);
    }
  };
  fetchStages()
  }, [id, stageCount,handleGetCustomerStagesById]);

 

  useEffect(() => {
    if (!user?.type) return;

    if (user?.type === "customer") {
       const fetchAndSetStages = async () => {
    try {
      const latestStages = await handleGetStages();
      const newComments = [];

      for (let i = 0; i < stageCount; i++) {
        const text = Array.isArray(latestStages[`stage${i + 1}_data`]) 
  ? latestStages[`stage${i + 1}_data`] 
  : [];
        // const text = latestStages[`stage${i + 1}_data`] || "";
        const date = latestStages[`stage${i + 1}_timestamp`]
          ? new Date(latestStages[`stage${i + 1}_timestamp`]).toLocaleString("default", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "";
        newComments.push({ text, date });
      }

      setComments(newComments);
    } catch (err) {
      console.error("Error fetching customer stages:", err.message);
    }
  };
   fetchAndSetStages();
    }
   
  }, [stageCount, user,handleGetStages]);

  const toggleCardExpand = (stageNum) => {
    setExpandedCards(prev => ({
      ...prev,
      [stageNum]: !prev[stageNum]
    }));
  };

  const showDescriptionModal = (stageNum) => {
    console.log(stageNum);
  };

  const addStage = () => {
    setStageCount(prev => prev + 1);
  };

  const removeStage = () => {
    if (stageCount > 1) {
      setStageCount(prev => prev - 1);
    }
  };

  const handleIconClick = (index) => {
    if (index < stageCount) {
      setActiveIcon(prev => (prev === index ? null : index));
      setInputValue( "");
    }
  };

const handleSubmit = async (customerId, stageNumber, commentsArray) => {
  if (!customerId || !stageNumber || !commentsArray.length) {
  
    return;
  }

  try {
    for (let newComment of commentsArray) {
      const result = await createStages(
        customerId,
        Number(stageNumber),
        newComment
      );
      console.log("Added comment:", result.message);
    }
    setInputValue("");         // Clear textarea
    setActiveIcon(null);       // Close the popup

    // 🔥 Fetch latest stages after successful submission

    const latestStages = await handleGetCustomerStagesById(id);
      const newComments = [];

      for (let i = 0; i < stageCount; i++) {
        
        const text = latestStages[`stage${i + 1}_data`] || "";
        const date = latestStages[`stage${i + 1}_timestamp`]
          ? new Date(latestStages[`stage${i + 1}_timestamp`]).toLocaleString("default", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "";
        newComments.push({ text, date });
      }

      setComments(newComments);

  } catch (err) {
    console.error("Failed to add comment:", err);
   
  }
};

const [activeStageIndex, setActiveStageIndex] = useState(null);
const [followupHistory, setFollowupHistory] = useState({});
const handleOpenFollowupModal = async (stageIndex) => {
  setActiveStageIndex(stageIndex);

  try {
  
    const result = await getComments(
  user.type === "processperson" ? id : user.id,
  stageIndex + 1
);
    console.log("Fetched followup comments:", result);

    // Transform result to match followupHistory entry format
    const formattedHistory = (result.comments || []).map(c => ({
      date: new Date(c.timestamp).toLocaleDateString(),
      details: c.comment
    }));

    setFollowupHistory(prev => ({
      ...prev,
      [stageIndex]: formattedHistory
    }));
  } catch (err) {
    console.error("❌ Failed to load follow-up history:", err.message);
    setFollowupHistory(prev => ({
      ...prev,
      [stageIndex]: []
    }));
  }
};


// const handleOpenFollowupModal = (stageIndex) => {
//   setActiveStageIndex(stageIndex);
//   // Fetch or assign follow-up history for the stage
//   if (!followupHistory[stageIndex]) {
//     // Example: You can fetch from API or assign dummy data
//     setFollowupHistory(prev => ({
//       ...prev,
//       [stageIndex]: [
//         { date: '2025-06-21', details: 'Follow-up done via email' },
//         { date: '2025-06-22', details: 'Phone call follow-up' }
//       ]
//     }));
//   }
// };

const handleCloseFollowupModal = () => {
  setActiveStageIndex(null);
};
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const totalStages = 15; // We know we have 15 stages

  const totalPages = Math.ceil(totalStages / rowsPerPage);

  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;

  const currentStages = Array.from({ length: totalStages }).slice(startIdx, endIdx);
useEffect(() => {
  const fetchComments = async () => {
    try {
    await getComments(id, activeIcon + 1);
      
    } catch (err) {
      console.error("❌ Failed to load comments", err.message);
    }
  };
fetchComments()
  // if (id) {
  //   // Load comments for all stages
  //   for (let i = 1; i <= stageCount; i++) {
  //     fetchComments(id, i);
  //   }
  // }

}, [id,getComments, activeIcon]);


  return (
    <div>
      {user?.type==="processperson" && (
        <h1 style={{margin:"20px"}}>Client : {clientName}</h1>)}
        
    <div className="road-timeline-container">
    
      <h2 className="descriptions-title">Activity Roadmap</h2>
      <div className="stage-controls">
        <button onClick={addStage} className="control-btn">Add Stage</button>
        <button onClick={removeStage} className="control-btn">Remove Stage</button>
        <span className="stage-count">Total Stages: {stageCount}</span>
      </div>

      <div className="timeline-container">
        <svg
          className="road-svg"
          fill="none"
          viewBox={`0 0 ${getSVGWidth()} 600`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a4a4a" />
              <stop offset="50%" stopColor="#2c2c2c" />
              <stop offset="100%" stopColor="#1a1a1a" />
            </linearGradient>
            <linearGradient id="roadShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.3)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
            </linearGradient>
            <filter id="roadBlur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
            </filter>
          </defs>

          <path
            d={roadPaths.shadowPath}
            className="road-shadow"
            filter="url(#roadBlur)"
          />
          <path
            d={roadPaths.mainPath}
            className="road-border"
          />
          <path
            d={roadPaths.mainPath}
            className="road-surface"
          />
          <path
            d={roadPaths.mainPath}
            className="road-centerline"
          />
          {generateZebraCrossings()}
          {generateRoadMarkings()}
          <image
            href={img2}
            x={-160}
            y={280}
            width={150}
            height={200}
            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
          />
          <image
            href={img1}
            x={getSVGWidth() - 230}
            y={290}
            width={140}
            height={200}
            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
          />
          {hexagons.filter(h => h.row === 'top').map((hex) => (
            <React.Fragment key={`top-connector-${hex.num}`}>
              <line
                x1={hex.left}
                y1={153}
                x2={hex.left}
                y2={hex.top - 100}
                stroke="#808080"
                strokeWidth="2"
                className="connector-line"
                strokeDasharray=""
              />
            </React.Fragment>
          ))}
          {hexagons.filter(h => h.row === 'bottom').map((hex) => (
            <React.Fragment key={`bottom-connector-${hex.num}`}>
              <line
                x1={hex.left}
                y1={358}
                x2={hex.left}
                y2={hex.top - 100}
                stroke="#808080"
                strokeWidth="2"
                className="connector-line"
                strokeDasharray=""
              />
            </React.Fragment>
          ))}
        </svg>

        {hexagons.map((hex, index) => (
          <div
            key={hex.num}
            className="hexagon-container"
            data-row={hex.row}
            style={{
              left: `${hex.left + 55}px`,
              top: `${hex.top}px`,
            }}
          >
            <div
              className={`hexagon hexagon-${hex.num}`}
              style={{
                backgroundColor: hex.bg,
                borderColor: hex.border,
                cursor: user?.type === "processperson" ? "pointer" : "not-allowed"
              }}
              onClick={(e) => {
                e.stopPropagation();
                showDescriptionModal(hex.num);
                if (user?.type === "processperson") {
                  handleIconClick(hex.num - 1);
                }
              }}
            >
              <span>Stage {hex.num}</span>
            </div>

         {Array.isArray(comments[hex.num - 1]?.text) && comments[hex.num - 1].text.length > 0 &&  (
              <div className="stage-description-card">
                <div className="card-c-header">
                  <span className="stage-title">Stage {hex.num}</span>
                  {/* {user?.type === "processperson" && (
                    <button
                      className="edit-btn-fixed"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIconClick(hex.num - 1);
                      }}
                    >
                      Edit
                    </button>
                  )} */}
                </div>

                <div className="card-content">
  <p
    className="card-text"
    style={{
      maxHeight: expandedCards[hex.num - 1] ? 'none' : '20px',
      overflow: 'hidden',
    }}
  >
    {(() => {
      const commentArray = comments[hex.num - 1]?.text || [];
      if (Array.isArray(commentArray) && commentArray.length > 0) {
        const latest = [...commentArray].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
        return (
          <div style={{ marginBottom: '4px' }}>
<div style={{ margin: 0 }}>
 {/* {(latest.comment || "").split(/(\/processperson\/client\/upload\/\w+)/g).map((part, idx) => {
  const isUploadLink = /^\/processperson\/client\/upload\/\w+$/.test(part);
  if (isUploadLink) {
    const customerLink = "/customer/client/upload";
    return user?.type === "processperson" ? (
      <a
        key={idx}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#007bff", textDecoration: "underline" }}
      >
        {part}
      </a>
    ) : (
      <a
        key={idx}
        href={customerLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#007bff", textDecoration: "underline" }}
      >
        {customerLink}
      </a>
    );
  }
  return <span key={idx}>{part}</span>;
})} */}
{/* {latest.comment
  .split(/(\/(?:processperson|customer)\/client\/upload\/\w+)/g)
  .map((part, idx) => {
    const isUploadLink = /^\/(?:processperson|customer)\/client\/upload\/\w+$/.test(part);

    if (isUploadLink) {
      return (
        <span
          key={idx}
          onClick={() => {
            const fullComment = latest.comment || "";
            const commentOnly = fullComment
              .split(/\/(?:processperson|customer)\/client\/upload\/\w+/)[0]
              .trim();

            const isCustomer = user?.type === "customer";
            const uploadPath = isCustomer
              ? part.replace("/processperson/", "/customer/")
              : part.replace("/customer/", "/processperson/");

            navigate(uploadPath, {
              state: {
                label: commentOnly,
                defaultFilename: commentOnly
              }
            });
          }}
          style={{ color: "#007bff", textDecoration: "underline", cursor: "pointer" }}
        >
          {part}
        </span>
      );
    }

    return <span key={idx}>{part}</span>;
  })} */}

{(latest.comment || "")
  .split(/(\/(?:processperson|customer)\/client\/upload\/\w+)/g)
  .map((part, idx) => {
    const isUploadLink = /^\/(?:processperson|customer)\/client\/upload\/\w+$/.test(part);

    if (isUploadLink) {
      return (
        <span
          key={idx}
          onClick={() => {
            const fullComment = latest.comment || "";

            // Get the comment part only (before the link)
            const commentOnly = fullComment
              .split(/\/(?:processperson|customer)\/client\/upload\/\w+/)[0]
              .trim();

            const isCustomer = user?.type === "customer";

            // For processperson, extract id and construct full path
            const idMatch = part.match(/\/(?:processperson|customer)\/client\/upload\/(\w+)/);
            const extractedId = idMatch?.[1];
            const path = isCustomer
              ? "/customer/client/upload"
              : `/processperson/client/upload/${extractedId}`;

            navigate(path, {
              state: {
                label: commentOnly,
                defaultFilename: commentOnly,
              },
            });
          }}
          style={{ color: "#007bff", textDecoration: "underline", cursor: "pointer" }}
        >
          {user?.type === "customer"
            ? "/customer/client/upload"
            : part}
        </span>
      );
    }

    return <span key={idx}>{part}</span>;
  })}





</div>




            <small style={{ color: '#888' }}>
              {new Date(latest.timestamp).toLocaleString()}
            </small>
          </div>
        );
      } else {
        return <p style={{ margin: 0 }}>-</p>;
      }
    })()}
  </p>
  {Array.isArray(comments[hex.num - 1]?.text) && comments[hex.num - 1].text.length > 1 && (
    <button
      className="expand-toggle"
      onClick={(e) => {
        e.stopPropagation();
        toggleCardExpand(hex.num - 1);
      }}
    >
      {expandedCards[hex.num - 1] ? 'See Less' : 'See More'}
    </button>
  )}
</div>

                <h3>{comments[hex.num - 1].date}</h3>
              </div>
            )}
          </div>
        ))
        }

        {user?.type === "processperson" && activeIcon !== null && (
          <div
            className="input-popup"
            style={{
              position: 'fixed',
              top: '30%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#fff',
              padding: '1rem',
              borderRadius: '10px',
              zIndex: 999,
              width: '320px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            }}
          >
            <button
              onClick={() => setActiveIcon(null)}
              style={{
                width: '30px',
                height: '30px',
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                color: '#999',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>
            <textarea
              placeholder="Enter your comment"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                width: '100%',
                height: '100px',
                resize: 'vertical',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                marginBottom: '10px',
              }}
            />
            <button
onClick={() =>
    handleSubmit(
      id,
      activeIcon + 1,
      inputValue
        .split(",")
        .map(c => c.trim())
        .filter(c => c.length > 0)
    )
  }
            // onClick={() => handleSubmit(user.id, activeIcon + 1, inputValue)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Submit
            </button>
          </div>
        )}
      </div>

      <div
        className="stages-table-container"
        style={{
          marginTop: '40px',
          width: '100%',
          overflowX: 'auto',
          padding: '0 20px',
        }}
      >
        <h3>Stage Summary</h3>

 <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'Segoe UI, sans-serif',
          tableLayout: 'fixed',
          minWidth: '1000px'
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#3b82f6', color: 'white' }}>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Stage</th>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Comments</th>
            <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Follow-up History</th>
          </tr>
        </thead>
        <tbody>
        {currentStages.map((_, indexOnPage) => {
  const stageIndex = startIdx + indexOnPage;
  const comment = comments[stageIndex] || {};
  return (
    <tr key={stageIndex}>
      <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
        <div>Stage {stageIndex + 1}</div>
        {comment.date && (
          <div style={{ fontSize: '11px', color: 'red', marginTop: '4px' }}>
            {comment.date}
          </div>
        )}
      </td>
      <td
  style={{
    padding: '10px',
    border: '1px solid #ddd',
    position: 'relative',
    maxWidth: '360px',
    wordWrap: 'break-word',
    wordBreak: 'break-word',
    whiteSpace: 'normal',
  }}
>
  <div
    style={{
      maxHeight: expandedCards[stageIndex] ? 'none' : '40px',
      overflow: 'hidden',
      paddingRight: '60px',
    }}
  >
    {Array.isArray(comment.text) && comment.text.length > 0 ? (
      <>
        {/* 🟣 Show latest comment */}
   <p style={{ margin: 0 }}>
  {(comment.text[comment.text.length - 1]?.comment || "").split(/(\/processperson\/client\/upload\/\w+)/g).map((part, idx) => {
    const isUploadLink = /^\/processperson\/client\/upload\/\w+$/.test(part);
    if (isUploadLink) {
      const customerLink = "/customer/client/upload";
      return user?.type === "processperson" ? (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#007bff", textDecoration: "underline" }}
        >
          {part}
        </a>
      ) : (
        <a
          key={idx}
          href={customerLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#007bff", textDecoration: "underline" }}
        >
          {customerLink}
        </a>
      );
    }
    return <span key={idx}>{part}</span>;
  })}
</p>


        <small style={{ color: '#888' }}>
          {comment.text[comment.text.length - 1]?.timestamp
            ? new Date(comment.text[comment.text.length - 1].timestamp).toLocaleString()
            : ''}
        </small>
      </>
    ) : (
      ' - '
    )}
  </div>

  {Array.isArray(comment.text) && comment.text.length > 1 && (
    <button
      style={{
        position: 'absolute',
        bottom: '8px',
        right: '10px',
        background: 'none',
        border: 'none',
        color: '#3b82f6',
        fontSize: '11px',
        cursor: 'pointer',
        padding: 0,
        fontWeight: '500',
        textDecoration: 'underline'
      }}
      onClick={(e) => {
        e.stopPropagation();
        toggleCardExpand(stageIndex);
      }}
    >
      {expandedCards[stageIndex] }
    </button>
  )}
</td>

   
      <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
        <button
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => handleOpenFollowupModal(stageIndex)}
        >
          View History
        </button>
      </td>
    </tr>
  );
})}

        </tbody>
      </table>


      {/* Pagination Controls */}
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        {Array.from({ length: totalPages }).map((_, pageIndex) => (
          <button
            key={pageIndex}
            onClick={() => setCurrentPage(pageIndex + 1)}
            style={{
              padding: '6px 10px',
              margin: '0 4px',
              backgroundColor: currentPage === (pageIndex + 1) ? '#3b82f6' : '#eee',
              color: currentPage === (pageIndex + 1) ? 'white' : 'black',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {pageIndex + 1}
          </button>
        ))}
      </div>
{activeStageIndex !== null && (
  <div className="followup-modal-overlay">
    <div className="followup-modal-box">
      <div className="followup-modal-header">
        <h4>Follow-up History for Stage {activeStageIndex + 1}</h4>
        <button className="followup-modal-close" onClick={handleCloseFollowupModal}>
          ×
        </button>
      </div>

      <div className="followup-modal-body">
        {followupHistory[activeStageIndex]?.length > 0 ? (
          followupHistory[activeStageIndex].map((entry, i) => (
            <div key={i} className="followup-history-entry">
              <p>
                <strong>Date:</strong> {entry.date}
              </p>
              <p>
                <strong>Details:</strong> {entry.details}
              </p>
            </div>
          ))
        ) : (
          <p>No follow-up history found for this stage.</p>
        )}
      </div>
    </div>
  </div>
)}

      </div>
    </div></div>
  );
};

export default ClientDash;