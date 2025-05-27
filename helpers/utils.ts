export function mapFigureToCode(promotionFigure: string): string {
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

export function calculateDraggingPosition(event: any): [number, number, number] {
    const point = event.point; // Get the cursor's 3D position

    return [point.x, point.y + 0.5, point.z];
}
