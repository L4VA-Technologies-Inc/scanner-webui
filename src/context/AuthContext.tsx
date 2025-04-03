import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Attempt to load API key from localStorage on initial load
  const [apiKey, setApiKeyInternal] = useState<string | null>(() => localStorage.getItem('scannerApiKey'));

  const setApiKey = (key: string | null) => {
    setApiKeyInternal(key);
    if (key) {
      localStorage.setItem('scannerApiKey', key);
    } else {
      localStorage.removeItem('scannerApiKey');
    }
  };

  return (
    <AuthContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
