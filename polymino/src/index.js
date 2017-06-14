'use strict';

import $ from "jquery";
import {Node, Piece} from './js/classes';
import {createXListForExactCoverProblem, searchDLX, printDLX, countDLXsolutions} from './js/dlx';
import {searchBruijn, countBruijnSolutions} from './js/debruijn';
import {pieces} from './js/pieces';
import {setUpPieceSelectionArea} from './js/pieceSelection';
import {transformTableToMatrix} from './js/transformTableToMatrix';
import {shufflePieces} from './js/shufflePieces';
import {countStatistic} from './js/statistics';
import {getCoordinates} from './js/getCoordinates';

const interval = 200;
let stepOfInterval = 0;
let piecesSet = 0;
let solutionLength;
let solutionPieces;
//let timeStart;
const scoreForLevel = 500;

let stepOfIntervalCreative = 0;
let piecesSetCreative = 0;
let solutionPiecesCreative;

const repeats = 2;
let level = 0;
let score = 0;
let pieceCost = 400;
let giveUpCost;
const tableCellWidth = 35;

let computed;
let creative;

let numberOfRowsCreative, numberOfColumnsCreative;

function saveToLocalStorage() {
    if (localStorage) {
        localStorage['level'] = parseInt(level);
        localStorage['score'] = parseInt(score);
    }
}

function restoreFromLocalStorage() {
    if (localStorage) {
        if(parseInt(localStorage.getItem('level'))) {
            level = parseInt(localStorage['level']);
        } else {
            localStorage['level'] = level = 0;
        }

        if(parseInt(localStorage.getItem('score'))) {
            score = parseInt(localStorage['score']);
        } else {
            localStorage['score'] = score = 0;
        }
    }
}

function findSolution(arr)  {
    let freeCells = 0, barriers = 0;

    for(let i = 0; i < arr.length; i++) {
        for(let j = 0; j < arr[i].length; j++) {
            if(arr[i][j] == 0) {
                freeCells++
            } else {
                barriers++;
            }
        }
    }

    if(barriers <= 8 ||
        (barriers > 8 && barriers <= 12 && (freeCells + barriers) < 96)) {
        console.log('debruijn');
        const solution = [];
        if(!searchBruijn(arr, solution)) {
            return;
        }
        return solution;
    } else {
        console.log('dlx');
        const header = createXListForExactCoverProblem(arr);
        const solution = [];
        if (!searchDLX(header, solution, 0)) {
            return;
        }
        return printDLX(solution);
    }
}

function countSolutions(arr) {
    let freeCells = 0, barriers = 0;

    for(let i = 0; i < arr.length; i++) {
        for(let j = 0; j < arr[i].length; j++) {
            if(arr[i][j] == 0) {
                freeCells++
            } else {
                barriers++;
            }
        }
    }

    let numberOfSolutions;

    if(barriers <= 8 ||
        (barriers > 8 && barriers <= 12 && (freeCells + barriers) < 96)) {
        numberOfSolutions = countBruijnSolutions(arr);
        console.log(`debruijn: ${numberOfSolutions} solutions`);
    } else {
        const header = createXListForExactCoverProblem(arr);
        numberOfSolutions = countDLXsolutions(header, 0);
        console.log(`dlx: ${numberOfSolutions} solutions`);
    }


}

/***** SCRIPT.JS *****/
function generatePolyminoTable() {
    saveToLocalStorage();
    initialSetUp();
    const table = computed.find('table.polytable');
    let {numberOfRows, numberOfColumns, numberOfBarriers, area} = countNumbersForTable();

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

    shufflePieces(pieces);
    const arr = transformTableToMatrix(computed);
    startGame(arr);
}

function countNumbersForTable() {
    const numberOfPieces = Math.floor(level / repeats) + 3;
    giveUpCost = Math.floor(pieceCost * numberOfPieces * 0.8 / 100) * 100;
    computed.find('span.pieceCost').text(pieceCost);
    computed.find('span.giveUpCost').text(giveUpCost);

    const numberOfBarriers = (level % repeats) * 2;
    const area = (numberOfPieces + numberOfBarriers) * 4;
    let numberOfRows, numberOfColumns;
    let side, index;
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

    return {numberOfRows, numberOfColumns, numberOfBarriers, area};
}

function startGame(arr) {
    stepOfInterval = 0;
    //timeStart = performance && performance.now? performance.now() : 0;
    piecesSet = 0;
    const solutionArea = computed.find('div.solutionArea');

    solutionPieces = findSolution(arr);
    if (!solutionPieces) {
        console.log('no solution');
        generatePolyminoTable();
        return;
    }

    solutionLength = solutionPieces.length;

    let numberOfRows = solutionPieces[0].maxrow - solutionPieces[0].minrow;
    let numberOfCols = solutionPieces[0].maxcol - solutionPieces[0].mincol;
    if (solutionPieces.every(piece =>
            (piece.maxcol - piece.mincol) == numberOfCols && (piece.maxrow - piece.minrow) == numberOfRows
        )) {
        console.log('all pieces are the same');
        generatePolyminoTable();
        return;
    }

    shufflePieces(solutionPieces);

    solutionPieces.forEach((piece, index) => {
        let view = piece.getView();
        solutionArea.append(view);
        view.setAttribute('id', `piece${index}`);

        $(view).find('td.pieceCell').each(function() {
            let cell = this;

            cell.ontouchcancel = function (e) {
                e.stopPropagation();
                e.preventDefault();
            };

            cell.ontouchstart = cell.onmousedown = function(e) {
                e.stopPropagation();
                e.preventDefault();
                view.style.display = '';
                const coords = getCoordinates(view);
                const shiftX = e.pageX - coords.left;
                const shiftY = e.pageY - coords.top;

                let isPieceSet = true;
                let currentCoordinatesAttribute = view.getAttribute('data-nodes');
                let currentPieceTdCoordinates = currentCoordinatesAttribute.split('-').map(item => Node.fromString(item));

                let row, column;
                ({row, column} = getRowAndCol(e));
                let isPieceRemoved = false;
                currentPieceTdCoordinates.forEach(item => {
                    let tdRow = parseInt(item.row) + row;
                    let tdCol = parseInt(item.column) + column;
                    let td = computed.find(`#td-${tdRow}-${tdCol}`);
                    if (td.hasClass('set') && !isPieceRemoved) {
                        isPieceRemoved = true;
                        piecesSet--;
                    }
                    td.removeClass('set');
                    td.removeAttr('data-piece');
                });

                function moveAt(e) {
                    view.style.left = (e.pageX - shiftX - 8) + 'px';
                    view.style.top = (e.pageY - shiftY) + 'px';
                }

                function getRowAndCol(e) {
                    let offset = solutionArea.offset();
                    let containerX = e.pageX - offset.left;
                    let containerY = e.pageY - offset.top;
                    let row = Math.round((containerY - shiftY) / tableCellWidth);
                    let column = Math.round((containerX - shiftX) / tableCellWidth);
                    return {row, column};
                }

                view.style.zIndex = 1000; // над другими элементами
                view.style.position = 'absolute';
                document.body.appendChild(view);
                moveAt(e);

                cell.ontouchmove = document.onmousemove = function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    moveAt(e);
                };

                cell.ontouchend = cell.onmouseup = function (e) {
                    let row, column;
                    ({row, column} = getRowAndCol(e));
                    let rowPosition = row * tableCellWidth;
                    let columnPosition = column * tableCellWidth;
                    let currentPieceCells = [];
                    currentPieceTdCoordinates.every(item => {
                        let tdRow = parseInt(item.row) + row;
                        let tdCol = parseInt(item.column) + column;
                        let cell = computed.find(`#td-${tdRow}-${tdCol}`)
                            .not('.set').not('.border-cell');

                        if (cell.length > 0) {
                            currentPieceCells.push(cell);
                        } else {
                            isPieceSet = false;
                            return false;
                        }

                        return true;
                    });

                    solutionArea.append(view);

                    if (isPieceSet) {
                        currentPieceCells.forEach(item => {
                            item.addClass('set');
                            item.attr('data-piece', $(view).attr('id'));
                        });
                        view.style.left = `${columnPosition - 8}px`;
                        view.style.top = `${rowPosition}px`;
                        view.style.display = 'block';
                        $(view).addClass('pieceSet');
                        piecesSet++;
                    } else {
                        view.style.position = '';
                        view.style.left = '';
                        view.style.top = '';
                        view.style.display = '';
                        $(view).removeClass('pieceSet');
                    }

                    cell.ontouchmove = document.onmousemove = null;
                    cell.ontouchend = cell.onmouseup = null;
                    view.style.zIndex = '';

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
                };
            };

            cell.ondragstart = function (e) {
                e.stopPropagation();
                e.preventDefault();
                return false;
            };
        });

        view.ondragstart = function (e) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        };
    });
}

function placePiece() {
    let index = parseInt($(this).attr('id').replace('piece', ''));
    setTimeoutForCoveringPiece(solutionPieces[index], $(this));
}

function placePieceNoInterval() {
    let piece = $(this);
    let left = parseInt(piece.css('left'));
    let top = parseInt(piece.css('top'));
    let row = Math.round(top / tableCellWidth);
    let column = Math.round((left + 8) / tableCellWidth);
    let currentCoordinatesAttribute = piece.attr('data-nodes');
    let currentPieceTdCoordinates = currentCoordinatesAttribute
        .split(/\s*-\s*/)
        .map(item => {
            let coordinates = item.split(/\s*,\s*/);
            return [parseInt(coordinates[0]) + row, parseInt(coordinates[1]) + column];
        });

    let index = parseInt(piece.attr('id').replace('piece', ''));
    let solutionPiece = solutionPieces[index];
    coverPieceInTable(new Piece(currentPieceTdCoordinates, solutionPiece.color));


    //coverPieceInTable(solutionPieces[index]);

    piece.remove();
}

function setTimeoutForCoveringPiece(piece, removedPiece) {
    return new Promise((resolve) => {
        if (!piece)
            return;
        stepOfInterval++;
        setTimeout(() => {
            coverPieceInTable(piece);
            if (removedPiece) {
                removedPiece.remove();
            }
            resolve();
        }, interval * stepOfInterval);
    });
}

function coverPieceInTable(piece) {
    const nodes = piece.nodes;
    const backgroundColor = piece.color;
    for (let i = 0; i < nodes.length; i++) {
        const row = nodes[i].row;
        const column = nodes[i].column;
        const td = computed.find(`#td-${row}-${column}`);
        let border = '1px dashed #121212';
        td.css({backgroundColor, /*boxShadow,*/ border});
        td.addClass('set');
    }
}

function alertWithInterval(message, interval = 50) {
    setTimeout(() => {
        alert(message);
    }, interval);
}

function printLevel() {
    computed.find(".levelSpan").html(level);
}

function printScore() {
    computed.find(".scoreSpan").html(score);
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
        let pieceSelectionArea = $('.pieceSelectionArea');
        setUpPieceSelectionArea(pieceSelectionArea.get(0), 'select-all', 'deselect-all');
        pieceSelectionArea.hide();

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

                    currentPieceTdCoordinates.forEach(item => {
                        let tdRow = parseInt(item.row) + row;
                        let tdCol = parseInt(item.column) + column;
                        let td = computed.find(`#td-${tdRow}-${tdCol}`);
                        td.removeClass('set');
                        td.removeAttr('data-piece');
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

                solutionPiece.nodes.forEach(function(node) {
                    const solutionRow = node.row;
                    const solutionColumn = node.column;
                    const td = computed.find(`#td-${solutionRow}-${solutionColumn}`);
                    let pieceId = td.attr('data-piece');
                    if (!pieceId) {
                        return;
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

                    currentPieceTdCoordinates.forEach(item => {
                        let tdRow = parseInt(item.row) + row;
                        let tdCol = parseInt(item.column) + column;
                        let td = computed.find(`#td-${tdRow}-${tdCol}`);
                        td.removeClass('set');
                        td.removeAttr('data-piece');
                    });

                    coveringPiece.css({
                        position: '',
                        left: '',
                        top: '',
                        display: ''
                    });
                    coveringPiece.removeClass('pieceSet');
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

                setTimeout(() => {
                    computed.find('#next').prop('disabled', false);
                }, interval * stepOfInterval);

                level++;
                score = parseInt(score) + parseInt(scoreForLevel);
                saveToLocalStorage();
                computed.find('#give-up, #add-piece').prop('disabled', true);
            }
        );

        computed.find('#next').click(
            function() {
                computed.find('#give-up, #add-piece').prop('disabled', false);
                $(this).prop('disabled', true);
                generatePolyminoTable();
            }
        );

        let uncheckedPieces = [];

        $('#computed').change(
            function() {
                if($(this).prop( "checked" )) {
                    //setup computed mode
                    $('main.mdl-layout__content.computed').show();
                    $('main.mdl-layout__content.creative').hide();

                    pieceSelectionArea.hide();
                    pieceSelectionArea.find('.pieceContainer').not('.selected').each((i, piece) => {
                        uncheckedPieces.push($(piece));
                        $(piece).click();
                    });
                }
            }
        );

        $('#creative').change(
            function() {
                if($(this).prop( "checked" )) {
                    //setup creative mode
                    $('main.mdl-layout__content.computed').hide();
                    $('main.mdl-layout__content.creative').show();

                    uncheckedPieces.forEach(piece => piece.click());
                    uncheckedPieces = [];
                    pieceSelectionArea.show();
                }
            }
        );
    }
);

/***** SCRIPT-CREATIVE.JS *****/

function startGameCreative(arr) {
    let isGameFinished = false;
    const solutionArea = creative.find('div.solutionArea');
    stepOfIntervalCreative = 0;
    piecesSetCreative = 0;
    //timeStart = performance && performance.now? performance.now() : 0;
    solutionPiecesCreative = findSolution(arr);

    if (!solutionPiecesCreative) {
        alertWithInterval('There is no solution!', interval * (stepOfIntervalCreative + 1));
        creative.find('#give-up-creative').hide();
        return;
    }

    let solutionLengthCreative = solutionPiecesCreative.length;
    shufflePieces(solutionPiecesCreative);

    solutionPiecesCreative.forEach((piece, index) => {
        let view = piece.getView();
        solutionArea.append(view);
        view.setAttribute('id', `piece${index}`);

        $(view).find('td.pieceCell').each(function() {
            let cell = this;

            cell.ontouchcancel = function (e) {
                e.stopPropagation();
                e.preventDefault();
            };

            cell.ontouchstart = cell.onmousedown = function (e) {
                e.stopPropagation();
                e.preventDefault();
                view.style.display = '';
                const coords = getCoordinates(view);
                const shiftX = e.pageX - coords.left;
                const shiftY = e.pageY - coords.top;

                let isPieceSet = true;
                let currentCoordinatesAttributeCreative = view.getAttribute('data-nodes');
                let currentPieceTdCoordinatesCreative = currentCoordinatesAttributeCreative.split('-').map(item => Node.fromString(item));

                let {row, column} = getRowAndCol(e);
                let isPieceRemoved = false;
                currentPieceTdCoordinatesCreative.forEach(item => {
                    let tdRow = parseInt(item.row) + row;
                    let tdCol = parseInt(item.column) + column;
                    let td = creative.find(`#td-${tdRow}-${tdCol}`);
                    if (td.hasClass('set') && !isPieceRemoved) {
                        isPieceRemoved = true;
                        piecesSetCreative--;
                    }
                    td.removeClass('set');
                });

                function moveAt(e) {
                    view.style.left = (e.pageX - shiftX - 8) + 'px';
                    view.style.top = (e.pageY - shiftY) + 'px';
                }

                function getRowAndCol(e) {
                    let offset = solutionArea.offset();
                    let containerX = e.pageX - offset.left;
                    let containerY = e.pageY - offset.top;
                    let row = Math.round((containerY - shiftY) / tableCellWidth);
                    let column = Math.round((containerX - shiftX) / tableCellWidth);
                    return {row, column};
                }

                view.style.zIndex = 1000; // над другими элементами
                view.style.position = 'absolute';
                document.body.appendChild(view);
                moveAt(e);

                cell.ontouchmove = document.onmousemove = function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    moveAt(e);
                };

                cell.ontouchend = cell.onmouseup = function (e) {
                    let row, column;
                    ({row, column} = getRowAndCol(e));
                    let rowPosition = row * tableCellWidth;
                    let columnPosition = column * tableCellWidth;
                    let currentPieceCells = [];
                    currentPieceTdCoordinatesCreative.every(item => {
                        let tdRow = parseInt(item.row) + row;
                        let tdCol = parseInt(item.column) + column;
                        let cell = creative.find(`#td-${tdRow}-${tdCol}`)
                            .not('.set').not('.border-cell');

                        if (cell.length > 0) {
                            currentPieceCells.push(cell);
                        } else {
                            isPieceSet = false;
                            return false;
                        }

                        return true;
                    });

                    solutionArea.append(view);

                    if (isPieceSet) {
                        currentPieceCells.forEach(item => {
                            item.addClass('set');
                        });
                        view.style.left = `${columnPosition - 4}px`;
                        view.style.top = `${rowPosition - 4}px`;
                        view.style.display = 'block';
                        piecesSetCreative++;
                    } else {
                        view.style.position = '';
                        view.style.left = '';
                        view.style.top = '';
                        view.style.display = '';
                    }

                    cell.ontouchmove = document.onmousemove = null;
                    cell.ontouchend = cell.onmouseup = null;
                    view.style.zIndex = '';

                    console.log(piecesSetCreative);
                    if (piecesSetCreative == solutionLengthCreative && !isGameFinished) {
                        isGameFinished = true;
                        creative.find('#give-up-creative').hide();
                        alertWithInterval('Congratulations!', 50);
                    }
                };
            };

            cell.ondragstart = function (e) {
                e.stopPropagation();
                e.preventDefault();
                return false;
            };
        });

        view.ondragstart = function (e) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        };
    });
}

function setTimeoutForCoveringPieceCreative(piece, removedPiece) {
    return new Promise((resolve) => {
        if (!piece)
            return;
        stepOfIntervalCreative++;
        setTimeout(() => {
            coverPieceInTableCreative(piece);
            if (removedPiece) {
                removedPiece.remove();
            }
            resolve();
        }, interval * stepOfIntervalCreative);
    });
}

function coverPieceInTableCreative(piece) {
    const nodes = piece.nodes;
    const backgroundColor = piece.color;
    for (let i = 0; i < nodes.length; i++) {
        const row = nodes[i].row;
        const column = nodes[i].column;
        const td = creative.find(`#td-${row}-${column}`);
        let border = '1px dashed #121212';
        td.css({backgroundColor, border});
        td.addClass('set');
    }
}

function setInitialPolyminoTable() {
    let table = creative.find('table.polytable');
    numberOfRowsCreative = 8;
    numberOfColumnsCreative = 8;
    for (let i = 0; i < 8; i++) {
        const row = $(`<tr class='field-row' id='tr-${i}'></tr>`);
        for (let j = 0; j < 8; j++) {
            row.append($(`<td class='cell empty-cell' id='td-${i}-${j}'></td>`));
        }
        table.append(row);
    }

    table.find('#td-3-3, #td-3-4, #td-4-3, #td-4-4').removeClass('empty-cell').addClass('border-cell');
}

// Transform table
function addColumn() {
    creative.find('tr.field-row').each(
        function (row) {
            $(this).append($(`<td class='cell empty-cell' id='td-${row}-${numberOfColumnsCreative}'></td>`));
        }
    );
    numberOfColumnsCreative++;
}

function addRow() {
    const row = $(`<tr class="field-row" id="tr-${numberOfRowsCreative}"></tr>`);
    for (let i = 0; i < numberOfColumnsCreative; i++) {
        row.append($(`<td class='cell empty-cell' id='td-${numberOfRowsCreative}-${i}'></td>`));
    }

    creative.find('table.polytable tr.field-row').last().after(row);
    numberOfRowsCreative++;
}

function removeColumn() {
    if (numberOfColumnsCreative < 2) {
        return;
    }
    creative.find('tr.field-row').each(
        function () {
            //noinspection JSValidateTypes
            $(this).children('td.cell').last().remove();
        }
    );
    numberOfColumnsCreative--;
}

function removeRow() {
    if (numberOfRowsCreative < 2) {
        return;
    }
    creative.find('tr.field-row').last().remove();
    numberOfRowsCreative--;
}

function resetFieldCreative() {
    creative
        .find('td.cell')
        .removeClass('set')
        .css('backgroundColor', '')
        .css('border', '');
    creative.find('.piece').remove();
    creative.find('#give-up-creative').hide();
}

$(document).ready(
    function() {
        setInitialPolyminoTable();
        countStatistic(creative);
        let solutionArea = creative.find('div.solutionArea');
        let pieceSelectionArea = $('.pieceSelectionArea');

        creative.find('#go').click(
            function () {
                resetFieldCreative();
                if (creative.find('span.statisticSpan .bad').length > 0) {
                    alert("It's impossible to cover table with such number of empty cells!");
                    return;
                }
                shufflePieces(pieces);
                creative.find('#give-up-creative').show();

                const arr = transformTableToMatrix(creative);
                startGameCreative(arr);
            }
        );

        creative.find('#give-up-creative').click(
            function() {
                function placePiece() {
                    let index = parseInt($(this).attr('id').replace('piece', ''));
                    setTimeoutForCoveringPieceCreative(solutionPiecesCreative[index], $(this));
                }

                stepOfIntervalCreative = 0;
                creative.find('.piece[style]').each(placePiece);
                creative.find('.piece').each(placePiece);
                $(this).hide();
            }
        );

        $(document).on('click', '.creative td.cell',
            function () {
                resetFieldCreative();

                if ($(this).hasClass('empty-cell')) {
                    $(this).removeClass('empty-cell').addClass('border-cell');
                    countStatistic(creative);
                }
                else {
                    $(this).removeClass('border-cell').addClass('empty-cell');
                    countStatistic(creative);
                }
            }
        );

        creative.find("#resetBarrierCells").click(
            function () {
                resetFieldCreative();
                creative.find(".polytable td").removeClass('border-cell').addClass('empty-cell').css('backgroundColor', '');
                countStatistic(creative);
            }
        );

        creative.find('div.arrow-div').click(
            function () {
                resetFieldCreative();
                const direction = $(this).removeClass('arrow-div').attr('class').replace('arrow-', '');

                switch (direction) {
                    case 'left':
                        removeColumn();
                        break;
                    case 'right':
                        addColumn();
                        break;
                    case 'top':
                        removeRow();
                        break;
                    case 'bottom':
                        addRow();
                        break;
                }

                $(this).addClass('arrow-div');
                countStatistic(creative);
            }
        );

        creative.find('#countSolutions').click(
            function() {
                const arr = transformTableToMatrix(creative);
                countSolutions(arr);
            }
        );
    }
);