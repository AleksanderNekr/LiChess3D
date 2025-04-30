import * as THREE from 'three'
import { useGLTF, useTexture } from '@react-three/drei'
import { useMemo, useEffect } from 'react'

type BoardProps = {
  texturePath: string
  position?: [number, number, number]
  scale?: number
  onHoverChange?: (flag: boolean) => void
}

export function Board({ texturePath, position, scale, onHoverChange }: BoardProps) {
  const { scene: originalScene } = useGLTF('/Models/board.glb')
  const clonedScene = useMemo(() => originalScene.clone(true), [originalScene])
  const texture = useTexture(texturePath)
  texture.colorSpace = THREE.SRGBColorSpace

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

  return (
    <primitive
      object={clonedScene}
      position={position}
      scale={scale}
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
