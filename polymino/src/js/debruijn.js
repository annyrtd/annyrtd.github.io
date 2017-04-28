import {pieces} from './pieces';
import {Piece} from "./classes";

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
                solution.push({index, offsetX, offsetY});
                placePiece(arr, nodes, next.row - root.row, next.column - root.column);
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
    for (let k = 0; k < nodes.length; k++) {
        arr[i + nodes[k].row][j + nodes[k].column] = 1;
    }
}

function removePiece(arr, nodes, i, j) {
    for (let k = 0; k < nodes.length; k++) {
        arr[i + nodes[k].row][j + nodes[k].column] = 0;
    }
}

// TODO: add forming array of Pieces
function printBruijn(solution) {
    const newPieces = [];

    /*for(let i = 0; i < solution.length; i++) {
        let config = solution[i];
        let index = config.index;
        let offsetX = config.offsetX;
        let offsetY = config.offsetY;
        let nodes = pieces[index].nodes;
        const coordinates = [];

        for(let j = 0; j < nodes.length; j++) {
            let node = nodes[j];
            coordinates.push([node.row + offsetX, node.column + offsetY]);
        }

        newPieces.push(new Piece(coordinates));
    }*/

    solution.forEach(config => {
        let index = config.index;
        let offsetX = config.offsetX;
        let offsetY = config.offsetY;
        let nodes = pieces[index].nodes;
        const coordinates = [];

        nodes.forEach(node => coordinates.push([node.row + offsetX, node.column + offsetY]));

        newPieces.push(new Piece(coordinates));
    });

    return newPieces;
}

export {searchBruijn, printBruijn};