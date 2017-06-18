'use strict';

import $ from "jquery";
import {Node} from './js/Node';
import {Piece} from './js/Piece';
import {pieces} from './js/pieces';
import {setUpPieceSelectionArea} from './js/pieceSelection';
import {transformTableToMatrix} from './js/transformTableToMatrix';
import {shuffleArray} from './js/shuffleArray';
import {countStatistic} from './js/statistics';
import {getCoordinates} from './js/getCoordinates';
import {findSolution, findSolutionWithPiece, countSolutions} from './js/solvePolymino';

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

    shuffleArray(pieces);
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

function getPageX(event) {
    if(event.pageX) {
        return event.pageX;
    } else {
        const touches = event.changedTouches;
        if(touches && touches[0]) {
            return touches[0].pageX;
        }
    }
}

function getPageY(event) {
    if(event.pageY) {
        return event.pageY;
    } else {
        const touches = event.changedTouches;
        if(touches && touches[0]) {
            return touches[0].pageY;
        }
    }
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

    shuffleArray(solutionPieces);

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
                const shiftX = getPageX(e) - coords.left;
                const shiftY = getPageY(e) - coords.top;

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
                    view.style.left = (getPageX(e) - shiftX - 8) + 'px';
                    view.style.top = (getPageY(e) - shiftY) + 'px';
                }

                function getRowAndCol(e) {
                    let offset = solutionArea.offset();
                    let containerX = getPageX(e) - offset.left;
                    let containerY = getPageY(e) - offset.top;
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
                        alertWithInterval('Поздравляем!', 50);
                        computed.find('.piece').each(placePieceNoInterval);
                        level++;
                        score = parseInt(score) + parseInt(scoreForLevel);

                        printScore();
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
        computed =  $('.computed');
        creative =  $('.creative');

        let pieceSelectionArea = $('.pieceSelectionArea');
        setUpPieceSelectionArea(pieceSelectionArea.get(0), 'select-all', 'deselect-all', creative);
        pieceSelectionArea.hide();

        restoreFromLocalStorage();
        generatePolyminoTable();
        let solutionArea = computed.find('div.solutionArea');

        computed.find('#add-piece').click(
            function() {
                if (score - pieceCost < 0) {
                    alertWithInterval("У вас недостаточно средств на счете!");
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
                        alertWithInterval('Поздравляем!', 50);
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
                    alertWithInterval("У вас недостаточно средств на счете!");
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

        computed.find('#clear-field').click(
            function() {
                computed.find('.piece.pieceSet').each(function(){
                    const view = this;
                    view.style.position = '';
                    view.style.left = '';
                    view.style.top = '';
                    view.style.display = '';
                    $(view).removeClass('pieceSet');
                });

                computed.find('.cell.set').each(function() {
                    $(this).removeClass('set').removeAttr('data-piece');
                });

                piecesSet = 0;
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
    solutionPiecesCreative = findSolutionWithPiece(arr);

    if (!solutionPiecesCreative) {
        alertWithInterval('Нет решений!', interval * (stepOfIntervalCreative + 1));
        creative.find('#give-up-creative').hide();
        return;
    }

    let solutionLengthCreative = solutionPiecesCreative.length;
    shuffleArray(solutionPiecesCreative);

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
                const shiftX = getPageX(e) - coords.left;
                const shiftY = getPageY(e) - coords.top;

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
                    view.style.left = (getPageX(e) - shiftX - 8) + 'px';
                    view.style.top = (getPageY(e) - shiftY) + 'px';
                }

                function getRowAndCol(e) {
                    let offset = solutionArea.offset();
                    let containerX = getPageX(e) - offset.left;
                    let containerY = getPageY(e) - offset.top;
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
                        alertWithInterval('Поздравляем!', 50);
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
        computed =  $('.computed');
        creative =  $('.creative');

        setInitialPolyminoTable();
        countStatistic(creative);
        let solutionArea = creative.find('div.solutionArea');
        let pieceSelectionArea = $('.pieceSelectionArea');

        creative.find('#go').click(
            function () {
                resetFieldCreative();
                if (creative.find('span.statisticSpan .bad').length > 0) {
                    alert("Невозможно покрыть фигурами поле с таким числом пустым клеток!");
                    return;
                }
                shuffleArray(pieces);
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
                let numberOfSolutions = 0;
                if (creative.find('span.statisticSpan .bad').length == 0) {
                    const arr = transformTableToMatrix(creative);
                    numberOfSolutions = countSolutions(arr);
                }
                $('#numberOfSolutions').html(`Число решений: ${numberOfSolutions}`);
            }
        );
    }
);