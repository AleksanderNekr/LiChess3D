import { Board } from './canvas/Board'
import { Piece } from './canvas/Piece'

export function ChessSetup(props: { setOrbitEnabled: (enabled: boolean) => void }) {
    const { setOrbitEnabled } = props
    const piecePositions: { type: string; color: string; position: [number, number, number] }[] = [
        { type: 'pawn', color: 'white', position: [-7, 0, 5] },
        { type: 'pawn', color: 'white', position: [-5, 0, 5] },
        { type: 'pawn', color: 'white', position: [-3, 0, 5] },
        { type: 'pawn', color: 'white', position: [-1, 0, 5] },
        { type: 'pawn', color: 'white', position: [1, 0, 5] },
        { type: 'pawn', color: 'white', position: [3, 0, 5] },
        { type: 'pawn', color: 'white', position: [5, 0, 5] },
        { type: 'pawn', color: 'white', position: [7, 0, 5] },
        { type: 'rook', color: 'white', position: [-7, 0, 7] },
        { type: 'knight', color: 'white', position: [-5, 0, 7] },
        { type: 'bishop', color: 'white', position: [-3, 0, 7] },
        { type: 'queen', color: 'white', position: [-1, 0, 7] },
        { type: 'king', color: 'white', position: [1, 0, 7] },
        { type: 'bishop', color: 'white', position: [3, 0, 7] },
        { type: 'knight', color: 'white', position: [5, 0, 7] },
        { type: 'rook', color: 'white', position: [7, 0, 7] },

        { type: 'pawn', color: 'black', position: [-7, 0, -5] },
        { type: 'pawn', color: 'black', position: [-5, 0, -5] },
        { type: 'pawn', color: 'black', position: [-3, 0, -5] },
        { type: 'pawn', color: 'black', position: [-1, 0, -5] },
        { type: 'pawn', color: 'black', position: [1, 0, -5] },
        { type: 'pawn', color: 'black', position: [3, 0, -5] },
        { type: 'pawn', color: 'black', position: [5, 0, -5] },
        { type: 'pawn', color: 'black', position: [7, 0, -5] },
        { type: 'rook', color: 'black', position: [-7, 0, -7] },
        { type: 'knight', color: 'black', position: [-5, 0, -7] },
        { type: 'bishop', color: 'black', position: [-3, 0, -7] },
        { type: 'queen', color: 'black', position: [-1, 0, -7] },
        { type: 'king', color: 'black', position: [1, 0, -7] },
        { type: 'bishop', color: 'black', position: [3, 0, -7] },
        { type: 'knight', color: 'black', position: [5, 0, -7] },
        { type: 'rook', color: 'black', position: [7, 0, -7] },
    ]

    return (
        <>
            <Board texturePath="/Models/board_dark_wood.jpg" scale={0.2} position={[0, 0, 0]} onHoverChange={setOrbitEnabled} />
            {piecePositions.map((piece, index) => (
                <Piece
                    key={index}
                    modelPath={`/Models/${piece.type}.glb`}
                    texturePath={`/Models/piece_${piece.color}.jpg`}
                    position={piece.position}
                    scale={0.2}
                />
            ))}
        </>
    )
}
