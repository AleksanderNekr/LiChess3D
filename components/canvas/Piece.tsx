import * as THREE from 'three'
import { useGLTF, useTexture } from '@react-three/drei'
import { useMemo, useEffect } from 'react'

type PieceProps = {
  modelPath: string
  texturePath: string
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}

export function Piece({ modelPath, texturePath, position, rotation, scale }: PieceProps) {
  const { scene: originalScene } = useGLTF(modelPath)
  const clonedScene = useMemo(() => originalScene.clone(true), [originalScene])
  const texture = useTexture(texturePath)
  texture.colorSpace = THREE.SRGBColorSpace

  useEffect(() => {
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = child.material.clone()
        child.material.map = texture
        child.material.needsUpdate = true
        child.material.metalness = 0.2
        child.material.roughness = 0.2
        child.material.emissive = new THREE.Color(0x222222)
        child.material.emissiveIntensity = 0.07
      }
    })
  }, [clonedScene, texture])

  return <primitive object={clonedScene} position={position} rotation={rotation} scale={scale} />
}
