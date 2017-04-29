import {pieces, activatePiece, deactivatePiece} from './pieces';

function setUpPieceSelectionArea(area, selectAllId, deselectAllId) {
    const containerPieceMap = new WeakMap();
    const containers = [];

    pieces.forEach(piece => {
        let view = piece.getView();
        let container = document.createElement('div');
        container.classList.add('pieceContainer');
        container.classList.add('selected');
        container.classList.add('mdl-card');
        container.classList.add('mdl-shadow--8dp');
        container.appendChild(view);
        area.appendChild(container);

        containers.push(container);
        containerPieceMap.set(container, piece);

        container.onclick = () => {
            if(container.classList.contains('selected')) {
                container.classList.remove('selected');
                container.classList.remove('mdl-card');
                container.classList.remove('mdl-shadow--8dp');
                deactivatePiece(piece);
            } else {
                container.classList.add('selected');
                container.classList.add('mdl-card');
                container.classList.add('mdl-shadow--8dp');
                activatePiece(piece);
            }
        }
    });

    document.getElementById(selectAllId).onclick = () => {
        containers.forEach(container => {
           if(!container.classList.contains('selected')) {
               container.classList.add('selected');
               container.classList.add('mdl-card');
               container.classList.add('mdl-shadow--8dp');
               activatePiece(containerPieceMap.get(container));
           }
        });
    };

    document.getElementById(deselectAllId).onclick = () => {
        containers.forEach(container => {
            if(container.classList.contains('selected')) {
                container.classList.remove('selected');
                container.classList.remove('mdl-card');
                container.classList.remove('mdl-shadow--8dp');
                deactivatePiece(containerPieceMap.get(container));
            }
        });
    };
}

export {setUpPieceSelectionArea};

