import {pieces, activatePiece, deactivatePiece} from './pieces';
import {countStatistic} from './statistics';
const INFINITY = 'Infinity';

function setUpPieceSelectionArea(area, selectAllId, deselectAllId, creative) {
    const containerPieceMap = new WeakMap();
    const containers = [];
/*
    let datalist = document.createElement('datalist');
    let id = 'datalistNumberOfUsages';
    datalist.id = id;
    datalist.innerHTML = `<option value="1"><option value="2"><option value="3"><option value="${INFINITY}">`;
    area.appendChild(datalist);*/

    pieces.forEach(piece => {
        let view = piece.getView();
        let input = createInput(piece/*, id*/);
        let container = document.createElement('div');
        container.classList.add('pieceContainer');
        container.classList.add('selected');
        container.classList.add('mdl-card');
        container.classList.add('mdl-shadow--8dp');
        container.appendChild(input);
        container.appendChild(view);
        area.appendChild(container);

        containers.push(container);
        containerPieceMap.set(container, piece);

        container.onclick = (e) => {
            if(e.target.nodeName  === 'INPUT') {
                return;
            }
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
            countStatistic(creative);
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

        countStatistic(creative);
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

        countStatistic(creative);
    };
}

function createInput(piece, id) {
    let input = document.createElement('input');
    input.value = INFINITY;
    input.setAttribute('list', id);

    let wrapper = document.createElement('div');
    wrapper.classList.add('numberOfUsages');

    wrapper.appendChild(input);

    input.onblur = function() {
        const regExp = /^[1-9][0-9]*$/;
        //const regExp = new RegExp('^([1-9][0-9]*|' + INFINITY + ')$');
        const value = input.value;
        if(!regExp.test(value)) {
            input.value = INFINITY;
            piece.numberOfUsages = Infinity;
            return;
        }

        piece.numberOfUsages = parseInt(value);
    };

    return wrapper;
}

export {setUpPieceSelectionArea};

