import {Piece} from './classes';
Array.prototype.remove = function() {
    let what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

const piecesDatabase = [
    // Size 3
    /*new Piece([
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
    ]),*/

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


    // Size 5

    //  OO
    // OO
    //  O
    new Piece([
        [0, 1], [0, 2], [1, 0], [1, 1], [2, 1]
    ]),
    //  O
    // OOO
    //   O
    new Piece([
        [0, 1], [1, 0], [1, 1], [1, 2], [2, 2]
    ]),
    //  O
    //  OO
    // OO
    new Piece([
        [0, 1], [1, 1], [1, 2], [2, 0], [2, 1]
    ]),
    // O
    // OOO
    //  O
    new Piece([
        [0, 0], [1, 0], [1, 1], [1, 2], [2, 1]
    ]),


    // O
    // O
    // O
    // O
    // O
    new Piece([
        [0, 0], [1, 0], [2, 0], [3, 0], [4, 0]
    ]),
    // 00000
    new Piece([
        [0, 0], [0, 1], [0, 2], [0, 3], [0, 4]
    ]),


    // O
    // O
    // O
    // OO
    new Piece([
        [0, 0], [1, 0], [2, 0], [3, 0], [3, 1]
    ]),
    //  O
    //  O
    // OO
    // O
    new Piece([
        [0, 1], [1, 1], [2, 0], [2, 1], [3, 0]
    ]),


    // OO
    // OO
    // O
    new Piece([
        [0, 0], [0, 1], [1, 0], [1, 1], [2, 0]
    ]),
    // OOO
    //  O
    //  O
    new Piece([
        [0, 0], [0, 1], [0, 2], [1, 1], [2, 1]
    ]),


    // O O
    // OOO
    new Piece([
        [0, 0], [0, 2], [1, 0], [1, 1], [1, 2]
    ]),
    // O
    // O
    // OOO
    new Piece([
        [0, 0], [1, 0], [2, 0], [2, 1], [2, 2]
    ]),



    // O
    // OO
    //  OO
    new Piece([
        [0, 0], [1, 0], [1, 1], [2, 1], [2, 2]
    ]),
    //  O
    // OOO
    //  O
    new Piece([
        [0, 1], [1, 0], [1, 1], [1, 2], [2, 1]
    ]),



    // O
    // O
    // OO
    // O
    new Piece([
        [0, 0], [1, 0], [2, 0], [2, 1], [3, 0]
    ]),
    // OO
    //  O
    //  OO
    new Piece([
        [0, 0], [0, 1], [1, 1], [2, 1], [2, 2]
    ]),
];
const pieces = [];
const piecesLength = [];

setInitialActivePieces();

function setInitialActivePieces() {
    while(piecesDatabase.length > 0) {
        const piece = piecesDatabase.shift();
        pieces.push(piece);
        addPieceLength(piece.nodes.length);
    }
}

function addPieceLength(length) {
    if (piecesLength.indexOf(length) < 0) {
        piecesLength.push(length);
    }
}

function activatePiece(piece) {
    const index = piecesDatabase.findIndex(item => item === piece);
    piecesDatabase.splice(index, 1);
    pieces.push(piece);
    addPieceLength(piece.nodes.length);
}

function deactivatePiece(piece) {
    const index = pieces.findIndex(item => item === piece);
    pieces.splice(index, 1);
    piecesDatabase.push(piece);
    removePieceLength(piece.nodes.length);
}

function removePieceLength(length) {
    if(!pieces.find(pieceInner => length == pieceInner.nodes.length)) {
        piecesLength.remove(length);
    }
}

export {pieces, activatePiece, deactivatePiece, piecesLength};