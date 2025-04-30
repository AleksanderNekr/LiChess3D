'use client'

import { EffectComposer, BrightnessContrast } from '@react-three/postprocessing'
import { Suspense, forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { OrbitControls, PerspectiveCamera, View as ViewImpl } from '@react-three/drei'
import { Three } from '@/helpers/components/Three'

interface CommonProps {
  color?: string;
}

export const Common = ({ color }: CommonProps) => (
  <Suspense fallback={null}>
    {color && <color attach='background' args={[color]} />}
    <ambientLight intensity={0.4} />
    <directionalLight position={[0, 10, 0]} intensity={1.8} castShadow />
    <PerspectiveCamera makeDefault fov={40} position={[0, 20, 15]} />

    {/* Horizontal light */}
    <directionalLight position={[0, 0, 1]} intensity={1} color='white' castShadow />

    <EffectComposer>
      <BrightnessContrast contrast={0.2} />
    </EffectComposer>
  </Suspense>
)

interface ViewProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  orbit?: boolean;
  orbitEnabled?: boolean;
}

const View = forwardRef<HTMLDivElement, ViewProps>(({ children, orbit, orbitEnabled, ...props }, ref) => {
  const localRef = useRef<HTMLDivElement | null>(null)

  return (
    <>
      <div ref={localRef} {...props} />
      <Three>
        <ViewImpl track={localRef as React.RefObject<HTMLElement>}>
          {children}
          {orbit && <OrbitControls enabled={orbitEnabled} />}
        </ViewImpl>
      </Three>
    </>
  )
})
View.displayName = 'View'

export { View }
