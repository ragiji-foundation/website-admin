'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

// Define the structure of the data
interface TheNeedData {
  id?: string;
  mainText: string;
  statistics: string;
  impact: string;
  imageUrl: string;
  statsImageUrl: string;
  isPublished: boolean;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Define the context type
interface TheNeedContextType {
  data: TheNeedData | null;
  setData: React.Dispatch<React.SetStateAction<TheNeedData | null>>;
}

// Create the context with a default value
const TheNeedContext = createContext<TheNeedContextType>({
  data: null,
  setData: () => { },
});

// Create a provider component
export function TheNeedProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<TheNeedData | null>(null);

  return (
    <TheNeedContext.Provider value={{ data, setData }}>
      {children}
    </TheNeedContext.Provider>
  );
}

// Create a hook to use this context
export function useTheNeed() {
  const context = useContext(TheNeedContext);
  if (context === undefined) {
    throw new Error('useTheNeed must be used within a TheNeedProvider');
  }
  return context;
}
