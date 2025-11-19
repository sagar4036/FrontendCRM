import { createContext, useState } from "react";

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activePage, setActivePage] = useState(""); // 👈 very important

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, activePage, setActivePage }}>
      {children}
    </SearchContext.Provider>
  );
};