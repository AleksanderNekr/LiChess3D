'use client'

import { useGLTF } from '@react-three/drei'

// @ts-ignore
export function Pawn(props) {
    const { scene } = useGLTF('/Models/pawn.glb')

    return <primitive object={scene} {...props} />
}
