'use client'

import * as THREE from 'three'
import { useGLTF, useTexture } from '@react-three/drei'
import { useMemo, useEffect } from 'react'

type Props = { scale?: number; position?: [number, number, number]; rotation?: [number, number, number] }

export function Pawn(props: Props) {
  const { scene: originalScene } = useGLTF('/Models/pawn.glb')
  const clonedScene = useMemo(() => originalScene.clone(true), [originalScene])
  return <primitive object={clonedScene} {...props} />
}

export function Bishop(props: Props) {
  const { scene: originalScene } = useGLTF('/Models/bishop.glb')
  const clonedScene = useMemo(() => originalScene.clone(true), [originalScene])
  return <primitive object={clonedScene} {...props} />
}

export function Knight(props: Props) {
  const { scene: originalScene } = useGLTF('/Models/knight.glb')
  const clonedScene = useMemo(() => originalScene.clone(true), [originalScene])
  return <primitive object={clonedScene} {...props} />
}

export function Rook(props: Props) {
  const { scene: originalScene } = useGLTF('/Models/rook.glb')
  const clonedScene = useMemo(() => originalScene.clone(true), [originalScene])
  return <primitive object={clonedScene} {...props} />
}

export function Queen(props: Props) {
  const { scene: originalScene } = useGLTF('/Models/queen.glb')
  const clonedScene = useMemo(() => originalScene.clone(true), [originalScene])
  return <primitive object={clonedScene} {...props} />
}

export function King(props: Props) {
  const { scene: originalScene } = useGLTF('/Models/king.glb')
  const clonedScene = useMemo(() => originalScene.clone(true), [originalScene])
  return <primitive object={clonedScene} {...props} />
}

export function Board(props: Props) {
  const { scene: originalScene } = useGLTF('/Models/board.glb')
  const clonedScene = useMemo(() => originalScene.clone(true), [originalScene])

  const texture = useTexture('/Models/board_dark_wood.jpg')
  texture.colorSpace = THREE.SRGBColorSpace 

  useEffect(() => {
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.material.map = texture
        child.material.needsUpdate = true
      }
    })
  }, [clonedScene, texture])

  return <primitive object={clonedScene} {...props} />
}
