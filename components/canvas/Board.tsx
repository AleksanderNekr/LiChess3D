import * as THREE from 'three'
import { useGLTF, useTexture } from '@react-three/drei'
import { useMemo, useEffect } from 'react'
import { getSquareFromPointer, squareToPosition } from '../utils'

type BoardProps = {
  texturePath: string
  position?: [number, number, number]
  scale?: number
  onSquareClick: (square: string) => void
  selectedSquare: string | null
  validMoves: string[]
  setOrbitEnabled: (enabled: boolean) => void
}

export function Board({
  texturePath,
  position,
  scale,
  onSquareClick,
  selectedSquare,
  validMoves,
  setOrbitEnabled,
}: BoardProps) {
  const { scene: originalScene } = useGLTF('/Models/board.glb')
  const clonedScene = useMemo(() => originalScene.clone(true), [originalScene])
  const texture = useTexture(texturePath)
  texture.colorSpace = THREE.SRGBColorSpace

  // Rotate the texture by 90 degrees
  texture.rotation = Math.PI / 2 // 90 degrees in radians
  texture.center.set(0.5, 0.5) // Set the rotation center to the middle of the texture

  useEffect(() => {
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = child.material.clone()
        child.material.map = texture
        child.material.needsUpdate = true
        child.material.metalness = 0
        child.material.roughness = 1
      }
    })
  }, [clonedScene, texture])

  // Calculate the position of the highlighted square
  const highlightPosition = selectedSquare ? squareToPosition(selectedSquare) : null;

  return (
    <>
      {/* Highlighted Square */}
      {highlightPosition && (
        <mesh position={highlightPosition} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.1, 2.1]} />
          <meshBasicMaterial color="chartreuse" transparent opacity={0.15} />
        </mesh>
      )}

      {/* Board */}
      <primitive
        object={clonedScene}
        position={position}
        scale={scale}
        onPointerMove={(e: any) => {
          setOrbitEnabled(false)
        }}
        onPointerOut={() => setOrbitEnabled(true)}
        onClick={(e: any) => {
          const square = getSquareFromPointer(e.point)
          if (square) onSquareClick(square)
        }}
      >
      </primitive>
    </>
  )
}
