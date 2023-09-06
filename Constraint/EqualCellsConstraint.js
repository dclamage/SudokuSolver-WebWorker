class EqualCellsConstraint extends Constraint {
    constructor(constraintName, specificName, board, params) {
            super(board, constraintName, specificName);

            this.cells = params.cells.map(
                cellName => cellIndexFromName(cellName, board.size),
            ).sort((a, b) => a - b);
            this.cellsSet = new Set(this.cells);
    }

    init(board, isRepeat) {
        if (isRepeat) return ConstraintResult.UNCHANGED;
        if (this.cells.length < 2) return ConstraintResult.UNCHANGED;

        for (let [cell1, cell2] of combinations(this.cells, 2)) {
            if (board.seenCells(cell1).includes(cell2)) return ConstraintResult.INVALID;
            board.addCloneWeakLinks(cell1, cell2);
        }

        return ConstraintResult.UNCHANGED;
    }

    enforce(board, cellIndex, value) {
        if (!this.cellsSet.has(cellIndex)) return true;

        const givenVals = this.getGivenVals(board);
        if (givenVals.length > 1) return false;
        if (givenVals.length === 1) {
            if (this.cells.some((cell) => !hasValue(board.cells[cell], givenVals[0]))) return false;
            return true;
        }

        const possibleMask = this.cells.reduce((mask, cell) => mask & board.cells[cell], board.allValues);
        if (possibleMask === 0) return false;

        return true;
    }

    logicStep(board, logicalStepDesc) {
        const newMask = this.cells.reduce(
            (mask, cell) => mask & board.cells[cell], board.allValues,
        );

        if (newMask === 0) {
            if (logicalStepDesc) {
                logicalStepDesc.push(`${this.specificName} has no possible values`);
            }
            return ConstraintResult.INVALID;
        }

        const results = [];
        for (let cell of this.cells) {
            const cellMask = board.cells[cell] & ~board.givenBit;
            if (cellMask === (newMask & ~board.givenBit)) continue;

            if (logicalStepDesc) {
                const removedValues = cellMask & ~newMask;
                if (removedValues !== 0) {
                    logicalStepDesc.push(`${this.specificName} eliminates ${board.compactName([cell], removedValues)}`);
                }
            }

            results.push(board.keepCellMask(cell, newMask));
        }

        return Math.max(...results);
    }

    getGivenVals(board) {
        return this.cells.reduce((vals, cell) => {
            if (!board.isGiven(cell)) return vals;
            const val = board.getValue(cell);
            if (vals.includes(val)) return vals;
            return [...vals, val];
        }, []);
    }
}

registerConstraint(
    'palindrome',
    (board, params) => {
        return params.lines.flatMap(
            (line) => {
                const constraints = [];
                const specificName = `Palindrome at ${list[0]}`;
                for (let i = 0; i < Math.floor(line.length / 2); i += 1) {
                    const cells = [line[i], line[line.length - i - 1]];
                    constraints.push(
                        new EqualCellsConstraint(
                            'Palindrome',
                            specificName,
                            board,
                            { cells },
                        ),
                    );
                }
                return constraints;
            }
        );
    }
);

registerConstraint(
    'clone',
    (board, params) => {
        const cellGroups = [params.cells, params.cloneCells];
        if (cellGroups.some(group => group.length !== cellGroups[0].length)) return [];

        const constraints = [];
        for (let i = 0; i < cellGroups[0].length; i += 1) {
            const cells = cellGroups.map(group => group[i]);
            const specificName = `Clone Cells ${cells.join(',')}`;
            constraints.push(new EqualCellsConstraint(
                'Clone',
                specificName,
                board,
                { cells },
            ));
        }
        return constraints;
    }
);