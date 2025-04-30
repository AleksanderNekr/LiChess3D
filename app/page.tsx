'use client';

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";

const Board = dynamic(() => import('@/components/canvas/Chess').then((mod) => mod.Board), { ssr: false })
const Pawn = dynamic(() => import('@/components/canvas/Chess').then((mod) => mod.Pawn), { ssr: false })
const King = dynamic(() => import('@/components/canvas/Chess').then((mod) => mod.King), { ssr: false })
const Queen = dynamic(() => import('@/components/canvas/Chess').then((mod) => mod.Queen), { ssr: false })
const Rook = dynamic(() => import('@/components/canvas/Chess').then((mod) => mod.Rook), { ssr: false })
const Knight = dynamic(() => import('@/components/canvas/Chess').then((mod) => mod.Knight), { ssr: false })
const Bishop = dynamic(() => import('@/components/canvas/Chess').then((mod) => mod.Bishop), { ssr: false })

const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
      <svg className='-ml-1 mr-3 h-5 w-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
    </div>
  ),
})
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })

export default function Home() {
  const [orbitEnabled, setOrbitEnabled] = useState(true)

  return (
    <div className="fixed inset-0 m-0 p-0 w-full h-full">
      <View orbit orbitEnabled={orbitEnabled} className="w-full h-full">
        <Suspense fallback={null}>
          <Board onHoverChange={setOrbitEnabled} scale={0.2} position={[0, 0, 0]} color={"white"} />

          <Pawn scale={0.2} position={[-7, 0, 5]} color="white" />
          <Pawn scale={0.2} position={[-5, 0, 5]} color="white" />
          <Pawn scale={0.2} position={[-3, 0, 5]} color="white" />
          <Pawn scale={0.2} position={[-1, 0, 5]} color="white" />
          <Pawn scale={0.2} position={[1, 0, 5]} color="white" />
          <Pawn scale={0.2} position={[3, 0, 5]} color="white" />
          <Pawn scale={0.2} position={[5, 0, 5]} color="white" />
          <Pawn scale={0.2} position={[7, 0, 5]} color="white" />

          <Rook scale={0.2} position={[-7, 0, 7]} color="white" />
          <Knight scale={0.2} position={[-5, 0, 7]} color="white" />
          <Bishop scale={0.2} position={[-3, 0, 7]} color="white" />
          <Queen scale={0.2} position={[-1, 0, 7]} color="white" />
          <King scale={0.2} position={[1, 0, 7]} color="white" />
          <Bishop scale={0.2} position={[3, 0, 7]} color="white" />
          <Knight scale={0.2} position={[5, 0, 7]} color="white" />
          <Rook scale={0.2} position={[7, 0, 7]} color="white" />

          <Pawn scale={0.2} position={[-7, 0, -5]} color="black" />
          <Pawn scale={0.2} position={[-5, 0, -5]} color="black" />
          <Pawn scale={0.2} position={[-3, 0, -5]} color="black" />
          <Pawn scale={0.2} position={[-1, 0, -5]} color="black" />
          <Pawn scale={0.2} position={[1, 0, -5]} color="black" />
          <Pawn scale={0.2} position={[3, 0, -5]} color="black" />
          <Pawn scale={0.2} position={[5, 0, -5]} color="black" />
          <Pawn scale={0.2} position={[7, 0, -5]} color="black" />

          <Rook scale={0.2} position={[-7, 0, -7]} color='black' />
          <Knight scale={0.2} position={[-5, 0, -7]} color='black' />
          <Bishop scale={0.2} position={[-3, 0, -7]} color='black' />
          <Queen scale={0.2} position={[-1, 0, -7]} color='black' />
          <King scale={0.2} position={[1, 0, -7]} color='black' />
          <Bishop scale={0.2} position={[3, 0, -7]} color='black' />
          <Knight scale={0.2} position={[5, 0, -7]} color='black' />
          <Rook scale={0.2} position={[7, 0, -7]} color='black' />

          <Common color={'white'} />
        </Suspense>
      </View>
    </div>
  );
}
