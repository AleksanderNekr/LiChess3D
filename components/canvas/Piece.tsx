import * as THREE from 'three';
import { useGLTF, useTexture } from '@react-three/drei';
import { useMemo, useEffect } from 'react';

type PieceProps = {
  modelPath: string;
  texturePath: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  highlighted?: boolean;
  capturable?: boolean; // New prop to indicate if the piece is capturable
};

export function Piece({ modelPath, texturePath, position, rotation, scale, highlighted, capturable }: PieceProps) {
  const { scene: originalScene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => originalScene.clone(true), [originalScene]);
  const texture = useTexture(texturePath);
  texture.colorSpace = THREE.SRGBColorSpace;

  useEffect(() => {
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.map = texture;
        child.material.needsUpdate = true;
        child.material.metalness = 0.2;
        child.material.roughness = 0.3;
        child.material.emissive = new THREE.Color(capturable ? 0xff4b2d : 0x222222); // Red for capturable pieces
        child.material.emissiveIntensity = highlighted ? 0.5 : capturable ? 0.3 : 0.07;
        child.castShadow = true;
      }
    });
  }, [clonedScene, texture, highlighted, capturable]);

  return <primitive object={clonedScene} position={position} rotation={rotation} scale={scale} />;
}
