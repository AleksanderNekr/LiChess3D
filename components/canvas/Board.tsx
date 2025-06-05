import * as THREE from 'three';
import { useGLTF, useTexture } from '@react-three/drei';
import { useMemo, useCallback } from 'react';
import { getSquareFromPointer, squareToPosition } from '../utils';

type BoardProps = {
  texturePath: string;
  position?: [number, number, number];
  scale?: number;
  onSquareDown: (square: string) => void;
  onSquareRelease: (square: string) => void;
  selectedSquare: string | null;
  validMoves: string[];
  setOrbitEnabled: (enabled: boolean) => void;
  onPointerMove?: (event: THREE.Event) => void;
};

export function Board({
  texturePath,
  position,
  scale,
  onSquareDown,
  onSquareRelease,
  selectedSquare,
  validMoves,
  setOrbitEnabled,
  onPointerMove,
}: BoardProps) {
  // Memoize texture and only update when texturePath changes
  const texture = useTexture(texturePath);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.rotation = Math.PI / 2;
  texture.center.set(0.5, 0.5);

  // Memoize the loaded and processed scene
  const { scene: originalScene } = useGLTF('/Models/board.glb');
  const processedScene = useMemo(() => {
    const cloned = originalScene.clone(true);
    cloned.traverse((child: any) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.map = texture;
        child.material.needsUpdate = true;
        child.material.metalness = 0;
        child.material.roughness = 1;
        child.receiveShadow = true;
      }
    });
    return cloned;
    // Only re-run if originalScene or texture changes
  }, [originalScene, texture]);

  // Calculate the position of the highlighted square
  const highlightPosition = useMemo(() => (selectedSquare ? squareToPosition(selectedSquare) : null), [selectedSquare]);
  const validMovePositions = useMemo(() => validMoves.map((move) => squareToPosition(move)), [validMoves]);

  // Memoize event handlers
  const handlePointerMove = useCallback(
    (e: any) => {
      setOrbitEnabled(false);
      onPointerMove && onPointerMove(e);
    },
    [setOrbitEnabled, onPointerMove]
  );

  const handlePointerOut = useCallback(() => setOrbitEnabled(true), [setOrbitEnabled]);
  const handlePointerDown = useCallback(
    (e: any) => {
      const square = getSquareFromPointer(e.point);
      if (square) onSquareDown(square);
    },
    [onSquareDown]
  );
  const handlePointerUp = useCallback(
    (e: any) => {
      const square = getSquareFromPointer(e.point);
      if (square) onSquareRelease(square);
    },
    [onSquareRelease]
  );

  return (
    <>
      {/* Highlighted Square */}
      {highlightPosition && (
        <mesh position={highlightPosition} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.1, 2.1]} />
          <meshBasicMaterial color="chartreuse" transparent opacity={0.15} />
        </mesh>
      )}

      {/* Valid Move Highlights (batch as much as possible) */}
      {validMovePositions.map((position, index) => (
        <group key={index} position={position} rotation={[-Math.PI / 2, 0, 0]}>
          {/* Only render visible circle for valid moves, skip invisible hover plane for perf */}
          <mesh>
            <circleGeometry args={[0.2, 32]} />
            <meshBasicMaterial color="#4E6100" />
          </mesh>
        </group>
      ))}

      {/* Board */}
      <primitive
        object={processedScene}
        position={position}
        scale={scale}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      />
    </>
  );
}
