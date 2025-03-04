import React, { createContext, useContext, useState } from 'react';

interface TheNeedData {
  id?: string;
  mainText: string | null;
  statistics: string | null;
  impact: string | null;
  imageUrl: string;
  statsImageUrl: string;
  isPublished: boolean;
}

interface TheNeedContextProps {
  data: TheNeedData | null;
  setData: React.Dispatch<React.SetStateAction<TheNeedData | null>>;
}

const TheNeedContext = createContext<TheNeedContextProps | undefined>(undefined);

export const TheNeedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<TheNeedData | null>(null);

  return (
    <TheNeedContext.Provider value={{ data, setData }}>
      {children}
    </TheNeedContext.Provider>
  );
};

export const useTheNeed = () => {
  const context = useContext(TheNeedContext);
  if (!context) {
    throw new Error('useTheNeed must be used within a TheNeedProvider');
  }
  return context;
};
