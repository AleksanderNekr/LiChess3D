import { useEffect, useRef, useState } from 'react';
import { Chess, Square } from 'chess.js';
import { Board } from './canvas/Board';
import { Piece } from './canvas/Piece';
import { squareToPosition } from './utils';
import { usePromotion } from '@/helpers/PromotionContext';
import { useLichess } from '@/helpers/LichessContext';

export function ChessSetup(props: { setOrbitEnabled: (enabled: boolean) => void }) {
  const { setOrbitEnabled } = props;
  const { promotionFigure } = usePromotion();
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);
  const [draggingPiecePosition, setDraggingPiecePosition] = useState<[number, number, number] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [chess] = useState(new Chess());
  const [turn, setTurn] = useState<'w' | 'b'>('w');
  const [stateUpdated, setStateUpdated] = useState<number>(0);
  const [storedLastMoveNumber, setStoredLastMoveNumber] = useState<number>(0);

  const getPiecePositions = () => chess.board()
    .flatMap((row, rowIndex) =>
      row.map((piece, colIndex) => {
        if (!piece) return null;
        const square = String.fromCharCode(97 + colIndex) + (8 - rowIndex);
        return {
          type: piece.type,
          color: piece.color === 'w' ? 'white' : 'black',
          position: squareToPosition(square),
          square,
          capturable: validMoves.includes(square) && piece.color !== turn, // Mark as capturable if it's in validMoves and not the same color as the current turn
          inCheck: piece.type === 'k' && chess.inCheck() && piece.color === turn, // Highlight the king if it's in check
        };
      })
    )
    .filter(Boolean);
  const [piecePositions, setPiecePositions] = useState<any[]>(getPiecePositions());

  const { streamStarted: gameId, streamGameState } = useLichess();

  useEffect(() => {
    setDraggingPiecePosition(null);
  }, [turn]);


  const makeMove = (from: string, to: string) => {
    const move = chess.move({ from: from, to: to, promotion: mapFigureToCode(promotionFigure) });
    if (move) {
      setSelectedSquare(null);
      setValidMoves([]);
      setTurn(turn === 'w' ? 'b' : 'w'); // Switch turns
      setDraggingPiecePosition(null); // Stop dragging
    }
  };

  const handleSquareDown = (square: string) => {
    setIsDragging(true);
    setOrbitEnabled(false);

    if (selectedSquare === square) {
      // Deselect if clicking on the same square
      setSelectedSquare(null);
      setValidMoves([]);
      setDraggingPiecePosition(null);
    } else if (selectedSquare && validMoves.includes(square)) {
      makeMove(selectedSquare, square)
    } else if (chess.get(square as Square)?.color === turn) {
      // Select a piece
      setSelectedSquare(square);
      const moves = chess.moves({ square: square as Square, verbose: true }).map((move) => move.to);
      setValidMoves(moves);
    } else {
      // Deselect if clicking on an invalid square
      setSelectedSquare(null);
      setValidMoves([]);
      setDraggingPiecePosition(null);
    }
  };

  const handleSquareRelease = (square: string) => {
    setIsDragging(false);

    if (selectedSquare && validMoves.includes(square)) {
      makeMove(selectedSquare, square);
    } else if (selectedSquare !== square) {
      // Deselect if clicking on an invalid square
      setSelectedSquare(null);
      setValidMoves([]);
      setDraggingPiecePosition(null);
    }
  }

  const handlePointerMove = (event: any) => {
    if (selectedSquare && isDragging) {
      const point = event.point; // Get the cursor's 3D position
      setDraggingPiecePosition([point.x, point.y + 0.5, point.z]); // Adjust height slightly above the board
    } else {
      setDraggingPiecePosition(null);
    }
  };

  // Use ref so last move number is saved in effect
  const storedLastMoveNumberRef = useRef(storedLastMoveNumber);

  useEffect(() => {
    storedLastMoveNumberRef.current = storedLastMoveNumber;
  }, [storedLastMoveNumber]);

  const updateGameStateCallback = (chessPosition: Chess, lastMove: string, lastMoveAbsNumber: number) => {
    console.log('Game state callback worked');
    console.log('Last move:', lastMove);
    console.log('Last move absolute number:', lastMoveAbsNumber);
    console.log('Stored last move absolute number:', storedLastMoveNumberRef.current);
    if (lastMoveAbsNumber - storedLastMoveNumberRef.current != 1) {
      // Reload full state
      chess.load(chessPosition.fen(), { skipValidation: true });
      console.log('FULL RELOAD');
    } else {
      // Make last move
      chess.move(lastMove);
      setTurn(chess.turn())
      console.log('Made last move');
    }
    setStoredLastMoveNumber(lastMoveAbsNumber);
    setStateUpdated(Date.now());
    setSelectedSquare(null);
    setValidMoves([]);
  };

  useEffect(() => {
    if (!gameId) return;

    console.log('Streaming game state for game ID:', gameId);
    streamGameState(gameId, updateGameStateCallback)
      .catch((error) => {
        console.error('Error streaming game state:', error);
        alert('Failed to stream game state. Please try again.');
      });
  }, [gameId]);

  useEffect(() => {
    setPiecePositions(getPiecePositions());
  }, [stateUpdated]);

  return (
    <>
      <Board
        texturePath="/Models/board_dark_wood.jpg"
        scale={0.2}
        position={[0, 0, 0]}
        onSquareDown={handleSquareDown}
        onSquareRelease={handleSquareRelease}
        selectedSquare={selectedSquare}
        validMoves={validMoves}
        setOrbitEnabled={setOrbitEnabled}
        onPointerMove={handlePointerMove}
      />
      {piecePositions.map((piece, index) => (
        <Piece
          key={index}
          modelPath={`/Models/${piece!.type}.glb`}
          texturePath={`/Models/piece_${piece!.color}.jpg`}
          position={
            piece!.square === selectedSquare && draggingPiecePosition
              ? draggingPiecePosition // Use dragging position if dragging
              : piece!.position
          }
          scale={0.2}
          highlighted={piece!.square === selectedSquare}
          capturable={piece!.capturable} // Pass capturable status
          inCheck={piece!.inCheck} // Pass inCheck status
          rotation={piece?.type === 'n' ? [0, Math.PI / 2, 0] : [0, 0, 0]}
        />
      ))}
    </>
  );
}

function mapFigureToCode(promotionFigure: string): string {
  switch (promotionFigure) {
    case 'queen':
      return 'q';
    case 'rook':
      return 'r';
    case 'bishop':
      return 'b';
    case 'knight':
      return 'n';
    default:
      throw new Error(`Invalid promotion figure: ${promotionFigure}`);
  }
}

