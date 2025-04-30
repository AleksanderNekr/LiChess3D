'use client'

import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false })

import { ReactNode } from 'react'

const Layout = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [promotionFigure, setPromotionFigure] = useState('queen')
  const [lichessGameId, setLichessGameId] = useState('')

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
        <div>
          <label htmlFor="lichess-game-id" style={{ display: 'block', marginBottom: '5px' }}>
            Insert Lichess Game ID:
          </label>
          <input
            id="lichess-game-id"
            type="text"
            value={lichessGameId}
            onChange={(e) => setLichessGameId(e.target.value)}
            placeholder="Enter game ID"
            style={{ width: '100%', padding: '5px' }}
          />
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
  )
}

export { Layout }
