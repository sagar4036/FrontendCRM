import React, { useState, useEffect } from 'react';

const NewsComponent = () => {
  const [newsContent, setNewsContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      const proxyUrl = "https://api.allorigins.win/raw?url=";
      const targetUrl = encodeURIComponent("https://www.cicnews.com");
  
      try {
        const response = await fetch(proxyUrl + targetUrl);
        
        if (!response.ok) {
          throw new Error("Failed to fetch the page");
        }
  
        let html = await response.text();
        
        // Modify links to open in a new tab
        html = html.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
  
// Inject CSS to hide scrollbars but allow scrolling
html = html.replace(
  /<head>/,
  `<head><style>
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      overflow: auto;
      scrollbar-width: none; /* Firefox */
    }
    ::-webkit-scrollbar {
      display: none; /* Chrome, Safari */
    }
  </style>`
);
        setNewsContent(html);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading news:", error);
        setError(error.message);
        setIsLoading(false);
      }
    };
  
    fetchNews();
  }, []);
  

  return (
    <section className="news">
      <h1 className='latest-news'>Latest News</h1>
      <div id="news-container">
        {isLoading && <p>Loading news...</p>}
        {error && <p>Error: {error}</p>}
        {!isLoading && !error && (
          <iframe
            title="news-frame"
            srcDoc={newsContent}
            width="100%"
            height="800px"
            style={{ border: "none" }} // optional: to clean up edges
          />
        )}
      </div>
    </section>
  );
};

export default NewsComponent;
