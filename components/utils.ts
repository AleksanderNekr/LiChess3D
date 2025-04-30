import * as THREE from 'three'

// Map logical chessboard square to 3D world coordinates
export const squareToPosition = (square: string): [number, number, number] => {
    const file = square.charCodeAt(0) - 97 // 'a' -> 0, 'b' -> 1, ..., 'h' -> 7
    const rank = parseInt(square[1], 10) - 1 // '1' -> 0, '2' -> 1, ..., '8' -> 7
    const position: [number, number, number] = [(file - 3.5) * 2, 0, (3.5 - rank) * 2]
    // console.log(`squareToPosition(${square}):`, position) // Debug log
    return position
}

// Map 3D world coordinates back to logical chessboard square
export const positionToSquare = (position: [number, number, number]): string | null => {
    const file = Math.round(position[0] / 2 + 3.5)
    const rank = Math.round(3.5 - position[2] / 2)
    if (file < 0 || file > 7 || rank < 0 || rank > 7) return null
    return String.fromCharCode(97 + file) + (rank + 1)
}


export function getSquareFromPointer(point: THREE.Vector3): string | null {
    const col = Math.floor((point.x + 8) / 2) // Adjust for board offset and scale
    const row = Math.floor((8 - point.z) / 2) // Adjust for board offset and scale
    if (col < 0 || col > 7 || row < 0 || row > 7) return null
    return String.fromCharCode(97 + col) + (row + 1)
  }
