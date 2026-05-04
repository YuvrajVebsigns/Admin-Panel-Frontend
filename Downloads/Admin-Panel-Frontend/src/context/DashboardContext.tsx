'use client';

import React, { createContext, useContext, useState } from 'react';

export type DashboardSection =
  | 'dashboard'
  | 'totalUsers'
  | 'totalWebsites'
  | 'totalBlogs'
  | 'totalEvents'
  | 'totalSponsors'
  | 'registrations'
  | 'totalNominators'
  | 'totalNominees';

interface DashboardContextType {
  activeSection: DashboardSection;
  setActiveSection: (section: DashboardSection) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<DashboardSection>('dashboard');

  return (
    <DashboardContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};
