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
    <directionalLight position={[0, 10, -1]} intensity={5} castShadow />
    <pointLight position={[20, 30, 10]} intensity={3} decay={0.2} />
    <pointLight position={[-10, -10, -10]} color='blue' decay={0.2} />
    <PerspectiveCamera makeDefault fov={40} position={[0, 0, 6]} />

    <EffectComposer>
      <BrightnessContrast contrast={0.3} />
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
