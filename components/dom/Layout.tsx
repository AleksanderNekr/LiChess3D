'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { usePromotion } from '@/helpers/PromotionContext';

const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false });

import { ReactNode } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { promotionFigure, setPromotionFigure } = usePromotion();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: '100%',
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: '250px',
          backgroundColor: '#f4f4f4',
          padding: '20px',
          boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
          zIndex: 10, // Ensure the sidebar stays above the canvas
        }}
      >
        <h2>Configuration</h2>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="promotion-figure" style={{ display: 'block', marginBottom: '5px' }}>
            Choose Promotion Figure:
          </label>
          <select
            id="promotion-figure"
            value={promotionFigure}
            onChange={(e) => setPromotionFigure(e.target.value)}
            style={{ width: '100%', padding: '5px' }}
          >
            <option value="queen">Queen</option>
            <option value="rook">Rook</option>
            <option value="bishop">Bishop</option>
            <option value="knight">Knight</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div
        ref={ref}
        style={{
          position: 'relative',
          flex: 1, // Take up the remaining space
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {children}
        <Scene
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
          eventSource={ref}
          eventPrefix="client"
        />
      </div>
    </div>
  );
};

export { Layout };
