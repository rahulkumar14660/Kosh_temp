import React, { createContext, useState, useMemo } from 'react';
export const SystemContext = createContext();
export const SystemProvider = ({ children }) => {
  const [system, setSystem] = useState('library');
  const value = useMemo(() => ({ system, setSystem }), [system]);
  return (
    <SystemContext.Provider value={value}>
      {children}
    </SystemContext.Provider>
  );
};
