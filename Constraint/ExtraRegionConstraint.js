class ExtraRegionConstraint extends Constraint {
    constructor(constraintName, board, params) {
        const cells = params.cells.sort((a, b) => a - b);
        const specificName = `${constraintName} at ${cellName(cells[0], board.size)}`;
        super(board, constraintName, specificName);

        this.cells = cells;
        this.cellsSet = new Set(this.cells);
    }

    init(board, isRepeat) {
        if (!isRepeat && this.cells.length > 1) {
            board.addRegion(this.specificName, this.cells, 'extra region constraint', this);
        }

        return ConstraintResult.UNCHANGED;
    }
}

registerConstraint('extraregion', (board, params) => {
    const cells = params.cells
    if (!cells || cells.length < 2) return []

    return new ExtraRegionConstraint(
        'Extra Region',
        board,
        { cells: cells.map(cellName => cellIndexFromName(cellName, board.size)) },
    )
})

registerAggregateConstraint(
    (board, boardData) => {
        if (!boardData.antiking) return []

        return board.cells.flatMap(
            (_, index) => {
                const originRow = Math.floor(index / 9)
                const kingCells = [
                    index + board.size - 1,
                    index + board.size + 1,
                ]
      
                return kingCells.reduce((constraints, cell) => {
                    if (Math.floor(cell / 9) !== originRow + 1) return constraints
                    if (cell < 0 || cell >= board.cells.length) return constraints
        
                    return [
                        ...constraints,
                        new ExtraRegionConstraint(
                            'Anti King',
                            board,
                            { cells: [index, cell] },
                        ),
                    ]
                }, [])
              }
        )
    }
)

registerAggregateConstraint(
    (board, boardData) => {
        if (!boardData.antiknight) return []

        return board.cells.flatMap(
            (_, index) => {
                const originRow = Math.floor(index / 9)

                const knightCells = [
                    ...[
                        index + board.size - 2,
                        index + board.size + 2,
                    ].filter((cell) => Math.floor(cell / 9) === originRow + 1),
                    ...[
                        index + (board.size * 2) - 1,
                        index + (board.size * 2) + 1,
                    ].filter((cell) => Math.floor(cell / 9) === originRow + 2),
                ]

                return knightCells.reduce((cellKnightList, cell) => {
                    if (cell < 0 || cell >= board.cells.length) return cellKnightList

                    return [
                        ...cellKnightList,
                        new ExtraRegionConstraint(
                            'Anti King',
                            board,
                            { cells: [index, cell] },
                        )
                    ]
                }, [])
            }
        )
    }
)

registerAggregateConstraint(
    (board, boardData) => {
        const constraints = []

        if (boardData['diagonal+']) {
            const positiveCells = []
            for (let i = 0; i < board.size; i += 1) {
                positiveCells.push(
                    (board.size * (board.size - 1 - i)) + i,
                )
            }
    
            constraints.push(
                new ExtraRegionConstraint(
                    'Diagonals',
                    board,
                    { cells: positiveCells },
                ),
            );
        }

        if (boardData['diagonal-']) {
            const negativeCells = []
            for (let i = 0; i < board.size; i += 1) {
                negativeCells.push(i + (i * board.size))
            }
    
            constraints.push(
                new ExtraRegionConstraint(
                    'Diagonals',
                    board,
                    { cells: negativeCells },
                ),
            );
        }

        return constraints
    }
)

registerAggregateConstraint(
    (board, boardData) => {
        if (!boardData.disjointgroups) return []

        const groups = []
        const baseRegions = board.regions.filter(({ type }) => type === 'region')
        for (let i = 0; i < board.size; i += 1) {
            groups.push(baseRegions.map(
            (region) => region.cells[i],
            ))
        }

        return groups.map((cells) => new ExtraRegionConstraint(
            'Disjoint Sets',
            board,
            { cells },
        ))
    }
)
