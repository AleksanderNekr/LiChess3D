'use client'

import * as THREE from 'three'
import { useGLTF, useTexture } from '@react-three/drei'
import { useMemo, useEffect } from 'react'


type PieceColor = 'white' | 'black'
type Props = {
  color: PieceColor
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}

// Add this interface so Board accepts onHoverChange
interface BoardProps extends Props {
  onHoverChange?: (flag: boolean) => void
}

function applyPieceTexture(color: string, clonedScene: THREE.Group<THREE.Object3DEventMap>) {
  const texturePath = color === 'white' ? '/Models/piece_white.jpg' : '/Models/piece_black.jpg'
  applyTextureToScene(clonedScene, texturePath)
}

function applyTextureToScene(clonedScene: THREE.Group<THREE.Object3DEventMap>, texturePath: string, is_board = false) {
  const texture = useTexture(texturePath)
  texture.colorSpace = THREE.SRGBColorSpace

  useEffect(() => {
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = child.material.clone() // Clone the material to avoid sharing between objects
        child.material.map = texture
        child.material.needsUpdate = true
        if (!is_board) {
          child.material.metalness = 0.2
          child.material.roughness = 0.2 // Adjust roughness for better light reflection
          child.material.emissive = new THREE.Color(0x222222) // Add a subtle emissive glow
          child.material.emissiveIntensity = 0.07 // Control the intensity of the emissive glow
        }
        else {
          child.material.metalness = 0
          child.material.roughness = 1
        }
      }
    })
  }, [clonedScene])
}

export function Board({ onHoverChange, ...props }: BoardProps) {
  const { scene: originalScene } = useGLTF('/Models/board.glb')
  const clonedScene = useMemo(() => originalScene.clone(true), [originalScene])

  applyTextureToScene(clonedScene, '/Models/board_dark_wood.jpg', true)

  return (
    <primitive
      object={clonedScene}
      {...props}
      onPointerOver={(e: { stopPropagation: () => void }) => {
        e.stopPropagation()
        onHoverChange?.(false)
      }}
      onPointerOut={(e: { stopPropagation: () => void }) => {
        e.stopPropagation()
        onHoverChange?.(true)
      }}
    />
  )
}

export function Pawn(props: Props) {
  const { scene: originalScene } = useGLTF('/Models/pawn.glb')
  const clonedScene = useMemo(() => originalScene.clone(true), [originalScene])

  applyPieceTexture(props.color, clonedScene)

  return <primitive object={clonedScene} {...props} />
}

export function Bishop(props: Props) {
  const { scene: originalScene } = useGLTF('/Models/bishop.glb')
  const clonedScene = useMemo(() => originalScene.clone(true), [originalScene])

  applyPieceTexture(props.color, clonedScene)

  return <primitive object={clonedScene} {...props} />
}

export function Knight(props: Props) {
  const { scene: originalScene } = useGLTF('/Models/knight.glb')
  const clonedScene = useMemo(() => originalScene.clone(true), [originalScene])

  applyPieceTexture(props.color, clonedScene)

  return <primitive object={clonedScene} {...props} />
}

export function Rook(props: Props) {
  const { scene: originalScene } = useGLTF('/Models/rook.glb')
  const clonedScene = useMemo(() => originalScene.clone(true), [originalScene])

  applyPieceTexture(props.color, clonedScene)

  return <primitive object={clonedScene} {...props} />
}

export function Queen(props: Props) {
  const { scene: originalScene } = useGLTF('/Models/queen.glb')
  const clonedScene = useMemo(() => originalScene.clone(true), [originalScene])

  applyPieceTexture(props.color, clonedScene)

  return <primitive object={clonedScene} {...props} />
}

export function King(props: Props) {
  const { scene: originalScene } = useGLTF('/Models/king.glb')
  const clonedScene = useMemo(() => originalScene.clone(true), [originalScene])

  applyPieceTexture(props.color, clonedScene)

  return <primitive object={clonedScene} {...props} />
}
