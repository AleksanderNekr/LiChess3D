'use client';

import { EffectComposer, BrightnessContrast } from '@react-three/postprocessing';
import { Suspense, forwardRef, useRef } from 'react';
import { OrbitControls, PerspectiveCamera, View as ViewImpl } from '@react-three/drei';
import { Three } from '@/helpers/components/Three';

interface CommonProps {
  color?: string;
}

export const Common = ({ color }: CommonProps) => (
  <Suspense fallback={null}>
    {color && <color attach="background" args={[color]} />}
    <ambientLight intensity={0.4} />
    <directionalLight
      position={[10, 50, -10]}
      intensity={1.8}
      castShadow // Enable shadow casting
      shadow-mapSize-width={2048} // Increase shadow map resolution for sharper shadows
      shadow-mapSize-height={2048}
      shadow-camera-far={150} // Extend the shadow camera's far plane
      shadow-camera-left={-15} // Reduce shadow projection area
      shadow-camera-right={15}
      shadow-camera-top={15}
      shadow-camera-bottom={-15}
    />
    <PerspectiveCamera makeDefault fov={40} position={[0, 20, 15]} />

    {/* Horizontal light */}
    <directionalLight position={[0, 10, 20]} intensity={0.1} color='white' castShadow />

    <EffectComposer>
      <BrightnessContrast contrast={0.2} />
    </EffectComposer>
  </Suspense>
);

interface ViewProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  orbit?: boolean;
  orbitEnabled?: boolean;
}

const View = forwardRef<HTMLDivElement, ViewProps>(({ children, orbit, orbitEnabled, ...props }) => {
  const localRef = useRef<HTMLDivElement | null>(null);

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
  );
});
View.displayName = 'View';

export { View };
