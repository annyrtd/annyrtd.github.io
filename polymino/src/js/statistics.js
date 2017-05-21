import {Node} from './classes';
import {transformTableToMatrix} from './transformTableToMatrix';
import {piecesLength} from './pieces';

// Counting connected components in a table
function countStatistic(creative) {
    const arr = transformTableToMatrix(creative);
    let sizes = getComponentsSizes(arr);

    //TODO: add proper check if number of empty cells can be divided by pieces
    let messages = sizes.map(size => `<span class="${checkIfProperNumber(size) ? 'good' : 'bad'}">${size}</span>`);
    let html = '';

    switch (messages.length) {
        case 0:
            html = '0';
            break;
        case 1:
            html = messages[0];
            break;
        default:
            html = messages.join(' + ')  + ' = ' + sizes.reduce((a, b) => a + b);
            break;
    }

    creative.find(".statisticSpan").html(html);
}

function getComponentsSizes(arr) {
    let startNode, sizes = [];
    while (!isAllVisited(arr)) {
        startNode = getStartNode(arr);
        sizes[sizes.length] = 1 + countOneComponent(startNode, arr);
    }
    return sizes;
}

function isAllVisited(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            if (arr[i][j] == 0) {
                return false;
            }
        }
    }
    return true;
}

function getStartNode(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            if (arr[i][j] == 0) {
                return new Node(i, j);
            }
        }
    }
}

function countOneComponent(startNode, arr) {
    let size = 0;
    arr[startNode.row][startNode.column] = 1;
    const neighbours = getNeighbours(startNode, arr);

    if (neighbours.length == 0) {
        return 0;
    }

    for (let t = 0; t < neighbours.length; t++) {
        arr[neighbours[t].row][neighbours[t].column] = 1;
        size++;
    }

    for (let i = 0; i < neighbours.length; i++) {
        size += countOneComponent(neighbours[i], arr);
    }

    return size;
}

function getNeighbours(node, arr) {
    const neighbours = [];
    // connect diagonal cells
    //neighbours[neighbours.length] = new Node(node.row - 1, node.column - 1);
    //neighbours[neighbours.length] = new Node(node.row - 1, node.column + 1);
    //neighbours[neighbours.length] = new Node(node.row + 1, node.column - 1);
    //neighbours[neighbours.length] = new Node(node.row + 1, node.column + 1);

    neighbours[neighbours.length] = new Node(node.row - 1, node.column);
    neighbours[neighbours.length] = new Node(node.row, node.column - 1);
    neighbours[neighbours.length] = new Node(node.row, node.column + 1);
    neighbours[neighbours.length] = new Node(node.row + 1, node.column);

    for (let i = 0; i < neighbours.length; i++) {
        if (neighbours[i].row < 0 || neighbours[i].column < 0
            || neighbours[i].row >= arr.length || neighbours[i].column >= arr[0].length
            || arr[neighbours[i].row][neighbours[i].column] == 1) {
            neighbours[i] = undefined;
        }
    }
    let position = neighbours.indexOf(undefined);
    while (position > -1) {
        neighbours.splice(position, 1);
        position = neighbours.indexOf(undefined);
    }

    return neighbours;
}

//TODO: add proper check if number of empty cells can be divided by pieces
/*function checkIfProperNumber(number) {
    for (let i = 0; i < piecesLength.length; i++) {
        if (number % piecesLength[i] == 0) {
            return true;
        }
    }
    return false;
}*/

function checkIfProperNumber(number) {
    if(number < 0) {
        return false;
    } else if(number == 0) {
        return true;
    } else {
        let result = false;
        for (let i = 0; i < piecesLength.length; i++) {
            result = result || checkIfProperNumber(number - piecesLength[i]);
        }

        return result;
    }
}

export {countStatistic};