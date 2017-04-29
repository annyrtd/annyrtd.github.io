import {pieces, activatePiece, deactivatePiece} from './pieces';

function setUpPieceSelectionArea(area) {
    pieces.forEach(piece => {
        let view = piece.getView();
        let container = document.createElement('div');
        container.classList.add('pieceContainer');
        container.classList.add('selected');
        container.appendChild(view);
        area.appendChild(container);

        container.onclick = () => {
            if(container.classList.contains('selected')) {
                container.classList.remove('selected');
                deactivatePiece(piece);
            } else {
                container.classList.add('selected');
                activatePiece(piece);
            }
        }
    });
}

export {setUpPieceSelectionArea};

