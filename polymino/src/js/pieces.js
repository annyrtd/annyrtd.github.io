import {Piece} from './classes';

const piecesDatabase = [
    // Size 3
    new Piece([
        [0, 0], [0, 1], [0, 2]
    ]),
    new Piece([
        [0, 0], [1, 0], [2, 0]
    ]),


    new Piece([
        [0, 0], [0, 1], [1, 0]
    ]),
    new Piece([
        [0, 0], [0, 1], [1, 1]
    ]),
    new Piece([
        [0, 1], [1, 0], [1, 1]
    ]),
    new Piece([
        [0, 0], [1, 0], [1, 1]
    ]),

    // Size 4
    new Piece([
        [0, 0], [1, 0], [1, 1], [2, 0]
    ]),
    new Piece([
        [0, 0], [0, 1], [0, 2], [1, 1]
    ]),
    new Piece([
        [0, 1], [1, 0], [1, 1], [1, 2]
    ]),
    new Piece([
        [0, 1], [1, 0], [1, 1], [2, 1]
    ]),


    new Piece([
        [0, 0], [0, 1], [1, 0], [2, 0]
    ]),
    new Piece([
        [0, 0], [0, 1], [0, 2], [1, 2]
    ]),
    new Piece([
        [0, 1], [1, 1], [2, 0], [2, 1]
    ]),
    new Piece([
        [0, 0], [1, 0], [1, 1], [1, 2]
    ]),


    new Piece([
        [0, 1], [0, 2], [1, 0], [1, 1]
    ]),
    new Piece([
        [0, 0], [1, 0], [1, 1], [2, 1]
    ]),
    new Piece([
        [0, 0], [0, 1], [1, 1], [1, 2]
    ]),
    new Piece([
        [0, 1], [1, 0], [1, 1], [2, 0]
    ]),


    new Piece([
        [0, 0], [0, 1], [0, 2], [0, 3]
    ]),
    new Piece([
        [0, 0], [1, 0], [2, 0], [3, 0]
    ]),
];
const pieces = [];
const piecesLength = [3, 4];

setInitialActivePieces();

function setInitialActivePieces() {
    while(piecesDatabase.length > 0) {
        pieces.push(piecesDatabase.shift());
    }
}

function activatePiece(piece) {
    const index = piecesDatabase.findIndex(item => item === piece);
    piecesDatabase.splice(index, 1);
    pieces.push(piece);
}

function deactivatePiece(piece) {
    const index = pieces.findIndex(item => item === piece);
    pieces.splice(index, 1);
    piecesDatabase.push(piece);
}

export {pieces, activatePiece, deactivatePiece, piecesLength};