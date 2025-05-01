import * as THREE from 'three';
import { useGLTF, useTexture } from '@react-three/drei';
import { useMemo, useEffect } from 'react';
import { getSquareFromPointer, squareToPosition } from '../utils';

type BoardProps = {
  texturePath: string;
  position?: [number, number, number];
  scale?: number;
  onSquareRelease: (square: string) => void; // Updated to handle release
  selectedSquare: string | null;
  validMoves: string[];
  setOrbitEnabled: (enabled: boolean) => void;
};

export function Board({
  texturePath,
  position,
  scale,
  onSquareRelease,
  selectedSquare,
  validMoves,
  setOrbitEnabled,
}: BoardProps) {
  const { scene: originalScene } = useGLTF('/Models/board.glb');
  const clonedScene = useMemo(() => originalScene.clone(true), [originalScene]);
  const texture = useTexture(texturePath);
  texture.colorSpace = THREE.SRGBColorSpace;

  // Rotate the texture by 90 degrees
  texture.rotation = Math.PI / 2; // 90 degrees in radians
  texture.center.set(0.5, 0.5); // Set the rotation center to the middle of the texture

  useEffect(() => {
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.map = texture;
        child.material.needsUpdate = true;
        child.material.metalness = 0;
        child.material.roughness = 1;
        child.receiveShadow = true; // Enable shadow receiving
      }
    });
  }, [clonedScene, texture]);

  // Calculate the position of the highlighted square
  const highlightPosition = selectedSquare ? squareToPosition(selectedSquare) : null;

  // Calculate positions for valid moves
  const validMovePositions = validMoves.map((move) => squareToPosition(move));

  return (
    <>
      {/* Highlighted Square */}
      {highlightPosition && (
        <mesh position={highlightPosition} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.1, 2.1]} />
          <meshBasicMaterial color="chartreuse" transparent opacity={0.15} />
        </mesh>
      )}

      {/* Valid Move Highlights */}
      {validMovePositions.map((position, index) => (
        <group key={index} position={position} rotation={[-Math.PI / 2, 0, 0]}>
          {/* Invisible plane for hover detection */}
          <mesh
            onPointerOver={(e) => {
              e.stopPropagation();
              // Highlight the square on hover
              if (e.object instanceof THREE.Mesh && e.object.material instanceof THREE.MeshBasicMaterial) {
                e.object.material.opacity = 0.15; // Make the square semi-transparent
              }
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              // Restore the square to its default state
              if (e.object instanceof THREE.Mesh && e.object.material instanceof THREE.MeshBasicMaterial) {
                e.object.material.opacity = 0; // Make the square invisible again
              }
            }}
          >
            <planeGeometry args={[2.1, 2.1]} />
            <meshBasicMaterial transparent opacity={0} color="chartreuse" />
          </mesh>

          {/* Visible circle for valid moves */}
          <mesh>
            <circleGeometry args={[0.2, 32]} />
            <meshBasicMaterial color="#4E6100" />
          </mesh>
        </group>
      ))}

      {/* Board */}
      <primitive
        object={clonedScene}
        position={position}
        scale={scale}
        onPointerMove={(e: any) => {
          setOrbitEnabled(false);
        }}
        onPointerOut={() => setOrbitEnabled(true)}
        onPointerDown={(e: any) => {
          const square = getSquareFromPointer(e.point);
          if (square) onSquareRelease(square);
        }}
        onPointerUp={(e: any) => {
          const square = getSquareFromPointer(e.point);
          if (square) onSquareRelease(square);
        }}
      />
    </>
  );
}
