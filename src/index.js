import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ApiProvider } from './context/ApiContext';
import { ExecutiveActivityProvider } from './context/ExecutiveActivityContext';
import {BreakTimerProvider } from './context/breakTimerContext'; // ✅ import your new context
import { MasterProvider } from './context/MasterContext';
import { CompanyProvider } from './context/CompanyContext';
import { ThemeProvider } from './features/admin/ThemeContext';
import { ProcessProvider } from './context/ProcessAuthContext';
import { ProcessServiceProvider } from './context/ProcessServiceContext';
import { BeepSettingsProvider } from './context/BeepSettingsContext';
import { SearchProvider } from './context/SearchContext';
import { PermissionProvider } from './context/PermissionContext';
import { LoadingProvider } from './context/LoadingContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
  <ThemeProvider>
    <BeepSettingsProvider>
  <AuthProvider>
    <ApiProvider>
      <ExecutiveActivityProvider>
     
        <MasterProvider>
          <CompanyProvider>
          
              <ProcessServiceProvider>
                  <ProcessProvider>
                   <BreakTimerProvider>
                <SearchProvider>
                  <PermissionProvider>
                  <LoadingProvider>
                <App />
                </LoadingProvider>
            </PermissionProvider>
            </SearchProvider>
            </BreakTimerProvider>
               </ProcessProvider>
            </ProcessServiceProvider>
            </CompanyProvider>
            </MasterProvider>
     
      </ExecutiveActivityProvider>
    </ApiProvider>
  </AuthProvider>
  </BeepSettingsProvider>
  </ThemeProvider>
</BrowserRouter>
);