'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface PromotionContextType {
  promotionFigure: string;
  setPromotionFigure: (figure: string) => void;
}

const PromotionContext = createContext<PromotionContextType | undefined>(undefined);

export const PromotionProvider = ({ children }: { children: ReactNode }) => {
  const [promotionFigure, setPromotionFigure] = useState('queen');

  return (
    <PromotionContext.Provider value={{ promotionFigure, setPromotionFigure }}>
      {children}
    </PromotionContext.Provider>
  );
};

export const usePromotion = () => {
  const context = useContext(PromotionContext);
  if (!context) {
    throw new Error('usePromotion must be used within a PromotionProvider');
  }
  return context;
};
