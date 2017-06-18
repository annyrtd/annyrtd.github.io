import {pieces} from './pieces';
import {Piece} from "./Piece";

function getNextBruijnHole(arr) {
    for (let column = 0; column < arr[0].length; column++) {
        for (let row = 0; row < arr.length; row++) {
            if (arr[row][column] == 0)
                return {row, column};
        }
    }
}

function searchBruijn(arr, solution) {
    let next = getNextBruijnHole(arr);
    if (next) {
        for (let index = 0; index < pieces.length; index++) {
            let piece = pieces[index];
            let nodes = piece.nodes;
            let root = piece.root;
            let offsetX = next.row - root.row;
            let offsetY = next.column - root.column;
            if(isPossibleToPlace(arr, nodes, offsetX, offsetY)) {
                // TODO: add offset
                solution.push(placePiece(arr, nodes, next.row - root.row, next.column - root.column));
                if(searchBruijn(arr, solution)) {
                    removePiece(arr, nodes, next.row - root.row, next.column - root.column);
                    return true;
                }
                removePiece(arr, nodes, next.row - root.row, next.column - root.column);
                solution.pop();
            }
        }
    } else {
        return true;
    }
}

function isPossibleToPlace(arr, nodes, i, j) {
    for (let k = 0; k < nodes.length; k++) {
        if (arr[i + nodes[k].row] === undefined ||
            arr[i + nodes[k].row][j + nodes[k].column] === undefined ||
            arr[i + nodes[k].row][j + nodes[k].column] === 1) {
            return false;
        }
    }
    return true;
}

function placePiece(arr, nodes, i, j) {
    const newNodes = [];

    for (let k = 0; k < nodes.length; k++) {
        let row = i + nodes[k].row;
        let col = j + nodes[k].column;
        newNodes.push([row, col]);
        arr[row][col] = 1;
    }

    return new Piece(newNodes);
}

function removePiece(arr, nodes, i, j) {
    for (let k = 0; k < nodes.length; k++) {
        arr[i + nodes[k].row][j + nodes[k].column] = 0;
    }
}

function countBruijnSolutions(arr) {
    let next = getNextBruijnHole(arr);
    if (next) {
        let numberOfSolutions = 0;
        for (let index = 0; index < pieces.length; index++) {
            let piece = pieces[index];
            if(piece.numberOfUsages > 0) {
                let nodes = piece.nodes;
                let root = piece.root;
                let offsetX = next.row - root.row;
                let offsetY = next.column - root.column;
                if (isPossibleToPlace(arr, nodes, offsetX, offsetY)) {
                    placePiece(arr, nodes, next.row - root.row, next.column - root.column);
                    piece.numberOfUsages--;
                    numberOfSolutions += countBruijnSolutions(arr);
                    removePiece(arr, nodes, next.row - root.row, next.column - root.column);
                    piece.numberOfUsages++;
                }
            }
        }
        return numberOfSolutions;
    } else {
        return 1;
    }
}

function searchBruijnWithPiece(arr, solution) {
    let next = getNextBruijnHole(arr);
    if (next) {
        for (let index = 0; index < pieces.length; index++) {
            let piece = pieces[index];
            if(piece.numberOfUsages > 0) {
                let nodes = piece.nodes;
                let root = piece.root;
                let offsetX = next.row - root.row;
                let offsetY = next.column - root.column;
                if (isPossibleToPlace(arr, nodes, offsetX, offsetY)) {
                    solution.push(placePiece(arr, nodes, next.row - root.row, next.column - root.column));
                    piece.numberOfUsages--;
                    if (searchBruijnWithPiece(arr, solution)) {
                        removePiece(arr, nodes, next.row - root.row, next.column - root.column);
                        piece.numberOfUsages++;
                        return true;
                    }
                    removePiece(arr, nodes, next.row - root.row, next.column - root.column);
                    piece.numberOfUsages++;
                    solution.pop();
                }
            }
        }
    } else {
        return true;
    }
}

export {searchBruijn, countBruijnSolutions, searchBruijnWithPiece};