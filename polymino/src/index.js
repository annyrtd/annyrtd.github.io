'use strict';

import $ from "jquery";
import {Node, Piece} from './js/classes';
import {searchBruijn, printBruijn} from './js/debruijn';
import {createXListForExactCoverProblem, searchDLX, printDLX} from './js/dlx';
import {pieces} from './js/pieces';

const interval = 200;
let stepOfInterval = 0;
let currentPieceTdCoordinates;
let currentCoordinatesAttribute;
let piecesSet = 0;
let solutionLength;
let solution = [];
let solutionPieces = [];
let timeStart;
const scoreForLevel = 500;

let stepOfIntervalCreative = 0;
let currentPieceTdCoordinatesCreative;
let currentCoordinatesAttributeCreative;
let piecesSetCreative = 0;
let solutionLengthCreative;
let solutionCreative = [];
let solutionPiecesCreative = [];

const repeats = 2;
let level = 0;
let score = 0;
let pieceCost = 400;
let giveUpCost;

const tableCellWidth = 35;
let computed;
let creative;


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

/***** DLX.JS *****/

function startGame(header) {
    stepOfInterval = 0;
    solution = [];
    timeStart = performance && performance.now? performance.now() : 0;

    let isSolutionFound = searchDLX(header, solution, 0);

    if (!isSolutionFound) {
        generatePolyminoTable();
        console.log('no solution');
        return;
    }

    piecesSet = 0;
    solutionLength = solution.length;

    const solutionArea = computed.find('div.solutionArea');
    solutionPieces = printDLX(solution);

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
                currentCoordinatesAttribute = view.getAttribute('data-nodes');
                currentPieceTdCoordinates = currentCoordinatesAttribute.split('-').map(item => Node.fromString(item));

                let row, column;
                ({row, column} = getRowAndCol(e));
                let isPieceRemoved = false;
                currentPieceTdCoordinates.every(item => {
                    let tdRow = parseInt(item.row) + row;
                    let tdCol = parseInt(item.column) + column;
                    let td = computed.find(`#td-${tdRow}-${tdCol}`);
                    if (td.hasClass('set') && !isPieceRemoved) {
                        isPieceRemoved = true;
                        piecesSet--;
                    }
                    td.removeClass('set');
                    td.removeAttr('data-piece');
                    return true;
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

function getCoordinates(elem) {
    // (1)
    const box = elem.getBoundingClientRect();

    const body = document.body;
    const docEl = document.documentElement;

    // (2)
    const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    // (3)
    const clientTop = docEl.clientTop || body.clientTop || 0;
    const clientLeft = docEl.clientLeft || body.clientLeft || 0;

    // (4)
    const top = box.top + scrollTop - clientTop;
    const left = box.left + scrollLeft - clientLeft;

    // (5)
    return {top: Math.round(top), left: Math.round(left)};
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

/***** SCRIPT.JS *****/

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

/***** SCRIPT-CREATIVE.JS *****/

let numberOfRowsCreative, numberOfColumnsCreative;
const piecesLength = [4];
let isGameFinished;

function startGameCreative(header) {
    isGameFinished = false;
    stepOfIntervalCreative = 0;
    solutionCreative = [];
    //timeStart = performance && performance.now? performance.now() : 0;

    let isSolutionFound = searchDLX(header, solutionCreative, 0);

    if (!isSolutionFound) {
        alertWithInterval('There is no solution!', interval * (stepOfIntervalCreative + 1));
        solutionCreative.splice(0, solutionCreative.length);
        return;
    }

    piecesSetCreative = 0;
    solutionLengthCreative = solutionCreative.length;

    const solutionArea = creative.find('div.solutionArea');
    solutionPiecesCreative = printDLX(solutionCreative);

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
                currentCoordinatesAttributeCreative = view.getAttribute('data-nodes');
                currentPieceTdCoordinatesCreative = currentCoordinatesAttributeCreative.split('-').map(item => Node.fromString(item));

                let row, column;
                ({row, column} = getRowAndCol(e));
                let isPieceRemoved = false;
                currentPieceTdCoordinatesCreative.every(item => {
                    let tdRow = parseInt(item.row) + row;
                    let tdCol = parseInt(item.column) + column;
                    let td = creative.find(`#td-${tdRow}-${tdCol}`);
                    if (td.hasClass('set') && !isPieceRemoved) {
                        isPieceRemoved = true;
                        piecesSetCreative--;
                    }
                    td.removeClass('set');
                    return true;
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

// Counting connected components in a table
function countStatistic() {
    const arr = transformTableToMatrix(creative);
    let startNode, size = [];
    while (!isAllVisited(arr)) {
        startNode = getStartNode(arr);
        size[size.length] = 1 + countOneComponent(startNode, arr);
    }

    for (let s = 0, temp; s < size.length; s++) {
        //TODO: add proper check if number of empty cells can be divided by pieces
        if (checkIfProperNumber(size[s])) {
            temp = `<span class="good">${size[s]}</span>`;
        }
        else {
            temp = `<span class="bad">${size[s]}</span>`;
        }
        size[s] = temp;
    }


    let txt = '';
    if (size.length <= 0) {
        txt = '0';
    }
    else {
        if (size.length == 1) {
            txt = size[0];
        }
        else {
            for (let i = 0; i < size.length - 1; i++) {
                txt += size[i] + ' + ';
            }
            txt += size[size.length - 1] + ' = ' + creative.find(".empty-cell").length.toString();
        }
    }

    creative.find(".statisticSpan").html(txt);
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

//TODO
function checkIfProperNumber(number) {
    for (let i = 0; i < piecesLength.length; i++) {
        if (number % piecesLength[i] == 0) {
            return true;
        }
    }
    return false;
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

function runTestOnce(arr) {
    let timeStart, timeStop, header, solutionBruijn = [], solutionDLX = [];

    timeStart = new Date();
    searchBruijn(arr, solutionBruijn);
    timeStop = new Date();
    console.log(`de Bruijn - search: ${timeStop - timeStart}ms`);

    timeStart = new Date();
    printBruijn(solutionBruijn);
    timeStop = new Date();
    console.log(`de Bruijn - print: ${timeStop - timeStart}ms`);

    timeStart = new Date();
    header = createXListForExactCoverProblem(arr);
    timeStop = new Date();
    console.log(`DLX - list forming: ${timeStop - timeStart}ms`);

    timeStart = new Date();
    searchDLX(header, solutionDLX, 0);
    timeStop = new Date();
    console.log(`DLX - search: ${timeStop - timeStart}ms`);

    timeStart = new Date();
    printDLX(solutionDLX);
    timeStop = new Date();
    console.log(`DLX - print: ${timeStop - timeStart}ms`);
}

function runTestsAll(arr, N) {
    let timeStart, timeStop, header;
    const solutionBruijn = [], solutionDLX = [];
    const bruijnSearch = [], bruijnPrint = [];
    const DLXcreatList = [], DLXSearch = [], DLXPrint = [];

    for(let i = 0; i < N; i++) {
        timeStart = new Date();
        searchBruijn(arr, solutionBruijn);
        timeStop = new Date();
        bruijnSearch.push(timeStop - timeStart);

        timeStart = new Date();
        printBruijn(solutionBruijn);
        timeStop = new Date();
        bruijnPrint.push(timeStop - timeStart);

        timeStart = new Date();
        header = createXListForExactCoverProblem(arr);
        timeStop = new Date();
        DLXcreatList.push(timeStop - timeStart);

        timeStart = new Date();
        searchDLX(header, solutionDLX, 0);
        timeStop = new Date();
        DLXSearch.push(timeStop - timeStart);

        timeStart = new Date();
        printDLX(solutionDLX);
        timeStop = new Date();
        DLXPrint.push(timeStop - timeStart);
    }

    const avg = (arr) => arr.reduce((result, current) => result + current) / parseFloat(arr.length);


    const message =
        `        De Bruijn       DLX
setup                   ${avg(DLXcreatList)}ms
search  ${avg(bruijnSearch)}ms\t\t\t${avg(DLXSearch)}ms
print   ${avg(bruijnPrint)}ms\t\t\t${avg(DLXPrint)}ms
---------------------------------
total   ${avg(bruijnSearch) + avg(bruijnPrint)}ms\t\t\t${avg(DLXcreatList) + avg(DLXSearch) + avg(DLXPrint)}ms`;

    console.log(message);
}

function runTests(arr, N) {
    let timeStart, timeStop, header;
    const solutionBruijn = [], solutionDLX = [];
    let bruijnSearch, bruijnPrint;
    let DLXcreatList, DLXSearch, DLXPrint;

    timeStart = new Date();
    for(let i = 0; i < N; i++) {
        searchBruijn(arr, solutionBruijn);
    }
    timeStop = new Date();
    bruijnSearch = (timeStop - timeStart) / N;

    timeStart = new Date();
    for(let i = 0; i < N; i++) {
        printBruijn(solutionBruijn);
    }
    timeStop = new Date();
    bruijnPrint = (timeStop - timeStart) / N;

    timeStart = new Date();
    for(let i = 0; i < N; i++) {
        header = createXListForExactCoverProblem(arr);
    }
    timeStop = new Date();
    DLXcreatList = (timeStop - timeStart) / N;

    timeStart = new Date();
    for(let i = 0; i < N; i++) {
        searchDLX(header, solutionDLX, 0);
    }
    timeStop = new Date();
    DLXSearch = (timeStop - timeStart) / N;


    timeStart = new Date();
    for(let i = 0; i < N; i++) {
        printDLX(solutionDLX);
    }
    timeStop = new Date();
    DLXPrint = (timeStop - timeStart) / N;

    const message =
        `        De Bruijn       DLX
setup                   ${DLXcreatList}ms
search  ${bruijnSearch}ms\t\t\t${DLXSearch}ms
print   ${bruijnPrint}ms\t\t\t${DLXPrint}ms
---------------------------------
total   ${bruijnSearch + bruijnPrint}ms\t\t\t${DLXcreatList + DLXSearch + DLXPrint}ms`;

    console.log(message);
}

$(document).ready(
    function() {
        setInitialPolyminoTable();
        countStatistic();
        let solutionArea = creative.find('div.solutionArea');

        creative.find('#go').click(
            function () {
                resetFieldCreative();
                if (creative.find('span.statisticSpan .bad').length > 0) {
                    alert("It's impossible to cover table with such number of empty cells!");
                    return;
                }
                shufflePieces();
                creative.find('#give-up-creative').show();

                const arr = transformTableToMatrix(creative);
                const header = createXListForExactCoverProblem(arr);
                startGameCreative(header, solution);
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
                    countStatistic();
                }
                else {
                    $(this).removeClass('border-cell').addClass('empty-cell');
                    countStatistic();
                }
            }
        );

        creative.find("#resetBarrierCells").click(
            function () {
                resetFieldCreative();
                creative.find(".polytable td").removeClass('border-cell').addClass('empty-cell').css('backgroundColor', '');
                countStatistic();
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
                countStatistic();
            }
        );
    }
);