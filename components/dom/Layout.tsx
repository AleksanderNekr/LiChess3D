'use client';

import { useRef, useState, useEffect } from 'react';
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
  const [sidebarWidth, setSidebarWidth] = useState(250); // Initial sidebar width
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true); // Sidebar visibility state

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newWidth = Math.max(50, Math.min(e.clientX, 500)); // Restrict width between 50px and 500px
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add and remove event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

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
      {isSidebarVisible && (
        <div
          style={{
            width: `${sidebarWidth}px`,
            backgroundColor: '#f4f4f4',
            padding: '20px',
            boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
            zIndex: 10, // Ensure the sidebar stays above the canvas
          }}
        >
          <h2 className="mb-4 text-lg font-semibold">Chess Setup</h2>
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
          <button
            onClick={() => setIsSidebarVisible(false)}
            style={{
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#d9534f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Hide Sidebar
          </button>
        </div>
      )}

      {/* Draggable Divider */}
      {isSidebarVisible && (
        <div
          style={{
            width: '5px',
            cursor: 'col-resize',
            backgroundColor: '#ccc',
            zIndex: 11,
          }}
          onMouseDown={handleMouseDown}
        ></div>
      )}

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
        {!isSidebarVisible && (
          <button
            onClick={() => setIsSidebarVisible(true)}
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              padding: '10px',
              backgroundColor: 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              zIndex: 12,
            }}
          >
            =
          </button>
        )}
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
