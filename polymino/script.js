'use strict';

/*const oldPieces = [
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
 [0, 0], [1, 0], [1, 1]
 ]),
 new Piece([
 [0, 1], [1, 0], [1, 1]
 ])
 ];*/
const pieces = [
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
        [0, 1], [0, 2], [1, 0], [1, 1]
    ]),


    new Piece([
        [0, 0], [0, 1], [0, 2], [1, 2]
    ]),
    new Piece([
        [0, 0], [1, 0], [1, 1], [2, 1]
    ]),


    new Piece([
        [0, 0], [1, 0], [1, 1], [1, 2]
    ]),
    new Piece([
        [0, 0], [0, 1], [1, 1], [1, 2]
    ]),


    new Piece([
        [0, 1], [1, 1], [2, 0], [2, 1]
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

// algo: https://en.wikipedia.org/wiki/Fisher-Yates_shuffle
function shufflePieces(arrayOfPieces = pieces) {
    let currentIndex = arrayOfPieces.length, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        [arrayOfPieces[currentIndex], arrayOfPieces[randomIndex]] = [arrayOfPieces[randomIndex], arrayOfPieces[currentIndex]];
    }
}

function generatePolyminoTable() {
    saveToLocalStorage();
    initialSetUp();
    const table = computed.find('table.polytable');
    const numberOfPieces = Math.floor(level / repeats) + 3;

    giveUpCost = Math.floor(pieceCost * numberOfPieces * 0.8 / 100) * 100;
    computed.find('span.pieceCost').text(pieceCost);
    computed.find('span.giveUpCost').text(giveUpCost);

    const numberOfBarriers = (level % repeats) * 2;
    const area = (numberOfPieces + numberOfBarriers) * 4;
    let numberOfRows, numberOfColumns;
    let side;
    let index;
    for (
        numberOfRows = index = 4, side = area / index, numberOfColumns = Math.floor(side);
        index < numberOfPieces + numberOfBarriers;
        index++, numberOfRows = index, side = area / index, numberOfColumns = Math.floor(side)
    ) {
        if (side == numberOfColumns && Math.abs(numberOfColumns - numberOfRows) <= 5) {
            break;
        }
    }

    if (numberOfRows > numberOfColumns) {
        [numberOfRows, numberOfColumns] = [numberOfColumns, numberOfRows];
    }

    let tableWidth = tableCellWidth * numberOfColumns + 32 * 2;
    let tableHeight = tableCellWidth * numberOfRows + 32 * 2;
    let windowWidth = document.body.scrollWidth;

    if (tableWidth > windowWidth) {
        if (tableHeight > windowWidth) {
            numberOfColumns = 4;
            numberOfRows = numberOfPieces + numberOfBarriers;
        } else {
            [numberOfRows, numberOfColumns] = [numberOfColumns, numberOfRows];
        }
    }

    table.empty();
    for (let i = 0; i < numberOfRows; i++) {
        const row = $(`<tr class='field-row' id='tr-${i}'></tr>`);
        for (let j = 0; j < numberOfColumns; j++) {
            let td = $(`<td class='cell empty-cell' id='td-${i}-${j}'></td>`);
            row.append(td);
        }
        table.append(row);
    }

    for (let i = 0; i < numberOfBarriers * 4; i++) {
        let allCells = computed.find('td.empty-cell');
        $(allCells[Math.floor(Math.random() * (area - i))])
            .removeClass('empty-cell')
            .addClass('border-cell');
    }

    shufflePieces();
    const arr = transformTableToMatrix(computed);
    const header = createXListForExactCoverProblem(arr);
    startGame(header);
}

function printLevel() {
    computed.find(".levelSpan").html(level);
}

function printScore() {
    computed.find(".scoreSpan").html(score);
}

function transformTableToMatrix(container) {
    const arr = [];
    container.find("table.polytable tr.field-row").each(
        function (row) {
            arr[arr.length] = [];
            //noinspection JSValidateTypes
            $(this).children('td.cell').each(
                function () {
                    let item = 0;
                    if ($(this).hasClass('border-cell')) {
                        item = 1;
                    }
                    arr[row][arr[row].length] = item;
                }
            );
        }
    );
    return arr;
}

// Prepare for DLX
function createXListForExactCoverProblem(arr) {
    const header = createInitialXList(arr);
    for (let p = 0, piece, nodes; p < pieces.length; p++) {
        piece = pieces[p];
        nodes = piece.nodes;
        for (let i = 0; i + piece.maxrow < arr.length; i++) {
            for (let j = 0; j + piece.maxcol < arr[i].length; j++) {
                if (isMatch(arr, nodes, i, j)) {
                    addNewRow(header, nodes, i, j);
                }
            }
        }
    }

    return header;
}

//create initial Xlist with header and empty columns
function createInitialXList(arr) {
    const header = new RootObject({});
    let previousColumn = header;
    let currentColumn, node;
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            if (arr[i][j] == 0) {
                // do I need nodeToString and stringToNode???
                node = new Node(i, j);
                currentColumn = new ColumnObject({left: previousColumn, name: node});
                currentColumn.up = currentColumn;
                currentColumn.down = currentColumn;
                currentColumn.column = currentColumn;
                previousColumn.right = currentColumn;
                previousColumn = currentColumn;
            }
        }
    }
    currentColumn.right = header;
    header.left = currentColumn;
    return header;
}

function isMatch(arr, nodes, i, j) {
    for (let k = 0; k < nodes.length; k++) {
        if (arr[i + nodes[k].row][j + nodes[k].column] == 1) {
            return false;
        }
    }
    return true;
}

//TODO nodes should be sorted in a right order
function addNewRow(header, nodes, row, column) {
    let node = nodes[0];
    let currentNode = new Node(node.row + row, node.column + column);

    let data, startRowData = addNewDataObject(header, currentNode);
    let previousData = startRowData;

    for (let n = 1; n < nodes.length; n++) {
        node = nodes[n];
        currentNode = new Node(node.row + row, node.column + column);
        data = addNewDataObject(header, currentNode, previousData);
        previousData.right = data;
        previousData = data;
    }

    startRowData.left = data;
    data.right = startRowData;
}

function addNewDataObject(header, currentNode, previousData) {
    const current = findColumnForNode(header, currentNode);
    if (current === undefined) {
        return;
    }

    const data = new DataObject({column: current, down: current, up: current.up, left: previousData});

    data.up.down = data;
    data.down.up = data;
    current.size++;

    return data;
}

function findColumnForNode(header, node) {
    let current = header.right;
    while (current != header) {
        if (current.name.equalsTo(node)) {
            return current;
        }
        current = current.right;
    }
    return undefined;
}

function initialSetUp() {
    resetField();
    printLevel();
    printScore();
}

function resetField() {
    computed.find('td.cell')
        .removeClass('set')
        .css('backgroundColor', '')
        .removeAttr('data-piece');
    computed.find('.piece').remove();
}

$(document).ready(
    function() {
        computed =  $('.computed');
        creative =  $('.creative');
        restoreFromLocalStorage();
        generatePolyminoTable();
        let solutionArea = computed.find('div.solutionArea');

        computed.find('#add-piece').click(
            function() {
                if (score - pieceCost < 0) {
                    alertWithInterval("You haven't got enough money!");
                    return;
                }
                score = score - pieceCost;
                saveToLocalStorage();
                printScore();

                let allPieces = computed.find('.piece');
                let removedPiece = $(allPieces[Math.floor(Math.random()*allPieces.length)]);

                if (removedPiece.hasClass('pieceSet')) {
                    let left = parseInt(removedPiece.css('left'));
                    let top = parseInt(removedPiece.css('top'));
                    let row = Math.round(top / tableCellWidth);
                    let column = Math.round((left + 8) / tableCellWidth);
                    let currentCoordinatesAttribute = removedPiece.attr('data-nodes');
                    let currentPieceTdCoordinates = currentCoordinatesAttribute.split('-').map(item => Node.fromString(item));

                    currentPieceTdCoordinates.every(item => {
                        let tdRow = parseInt(item.row) + row;
                        let tdCol = parseInt(item.column) + column;
                        let td = computed.find(`#td-${tdRow}-${tdCol}`);
                        td.removeClass('set');
                        td.removeAttr('data-piece');
                        return true;
                    });

                    removedPiece.css({
                        position: '',
                        left: '',
                        top: '',
                        display: ''
                    });
                    removedPiece.removeClass('pieceSet');

                    piecesSet--;
                }

                let index = parseInt(removedPiece.attr('id').replace('piece', ''));
                let solutionPiece = solutionPieces[index];

                solutionPiece.nodes.every(function(node) {
                    const solutionRow = node.row;
                    const solutionColumn = node.column;
                    const td = computed.find(`#td-${solutionRow}-${solutionColumn}`);
                    let pieceId = td.attr('data-piece');
                    if (!pieceId) {
                        return true;
                    }
                    piecesSet--;
                    console.log(piecesSet);
                    let coveringPiece = computed.find(`#${pieceId}`);
                    let left = parseInt(coveringPiece.css('left'));
                    let top = parseInt(coveringPiece.css('top'));
                    let row = Math.round(top / tableCellWidth);
                    let column = Math.round((left + 8) / tableCellWidth);
                    let currentCoordinatesAttribute = coveringPiece.attr('data-nodes');
                    let currentPieceTdCoordinates = currentCoordinatesAttribute.split('-').map(item => Node.fromString(item));

                    currentPieceTdCoordinates.every(item => {
                        let tdRow = parseInt(item.row) + row;
                        let tdCol = parseInt(item.column) + column;
                        let td = computed.find(`#td-${tdRow}-${tdCol}`);
                        td.removeClass('set');
                        td.removeAttr('data-piece');
                        return true;
                    });

                    coveringPiece.css({
                        position: '',
                        left: '',
                        top: '',
                        display: ''
                    });
                    coveringPiece.removeClass('pieceSet');

                    return true;
                });

                stepOfInterval = 0;
                setTimeoutForCoveringPiece(solutionPiece, removedPiece).then(() => {
                    piecesSet++;
                    console.log(piecesSet);
                    if (piecesSet == solutionLength) {
                        alertWithInterval('Congratulations!', 50);
                        computed.find('.piece').each(placePieceNoInterval);
                        level++;
                        score = parseInt(score) + parseInt(scoreForLevel);
                        saveToLocalStorage();
                        computed.find('#give-up, #add-piece').prop('disabled', true);
                        computed.find('#next').prop('disabled', false);
                    }
                });
            }
        );

        computed.find('#give-up').click(
            function() {
                if (score - giveUpCost < 0) {
                    alertWithInterval("You haven't got enough money!");
                    return;
                }
                score = score - giveUpCost;
                saveToLocalStorage();
                printScore();

                stepOfInterval = 0;
                computed.find('.piece[style]').each(placePiece);
                computed.find('.piece').each(placePiece);

                level++;
                score = parseInt(score) + parseInt(scoreForLevel);
                saveToLocalStorage();
                computed.find('#give-up, #add-piece').prop('disabled', true);
                computed.find('#next').prop('disabled', false);
            }
        );

        computed.find('#next').click(
            function() {
                computed.find('#give-up, #add-piece').prop('disabled', false);
                $(this).prop('disabled', true);
                generatePolyminoTable();
            }
        );


        $('#computed').change(
            function() {
                if($(this).prop( "checked" )) {
                    //setup computed mode
                    $('main.mdl-layout__content.computed').show();
                    $('main.mdl-layout__content.creative').hide();
                }
            }
        );

        $('#creative').change(
            function() {
                if($(this).prop( "checked" )) {
                    //setup creative mode
                    $('main.mdl-layout__content.computed').hide();
                    $('main.mdl-layout__content.creative').show();
                }
            }
        );
    }
);