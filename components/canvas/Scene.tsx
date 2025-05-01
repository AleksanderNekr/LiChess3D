'use client';

import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { r3f } from '@/helpers/global';
import * as THREE from 'three';

export default function Scene({ ...props }) {
  return (
    <Canvas
      shadows // Enable shadows
      {...props}
      onCreated={(state) => {
        state.gl.shadowMap.enabled = true; // Enable shadow maps
        state.gl.shadowMap.type = THREE.PCFSoftShadowMap; // Use soft shadows
        state.gl.toneMapping = THREE.ACESFilmicToneMapping;
      }}
    >
      <r3f.Out />
      <Preload all />
    </Canvas>
  );
}
