import React, { createContext, useContext, useState,useCallback } from "react";

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Processing request...");
  const [variant, setVariant] = useState("executive"); // executive | admin


  const showLoader = useCallback((text = "Processing request...", variantType = "executive") => {
  setLoadingText(text);
  setVariant(variantType);
  setIsLoading(true);
}, []);

const hideLoader = useCallback(() => {
  setIsLoading(false);
  setLoadingText("Processing request...");
  setVariant("executive");
}, []);

  return (
    <LoadingContext.Provider
      value={{ isLoading, loadingText, variant, showLoader, hideLoader }}
    >
      {children}
    </LoadingContext.Provider>
  );
};
