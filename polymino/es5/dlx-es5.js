'use strict';

function startGame(header) {
    isSolutionFound = false;
    stepOfInterval = 0;
    solution = [];
    timeStart = performance.now();

    search(header, solution, 0);

    if (!isSolutionFound) {
        generatePolyminoTable();
        console.log('no solution');
        //alertWithInterval('There is no solution!', interval * (stepOfInterval + 1));
        //solution.splice(0, solution.length);
        return;
    }

    piecesSet = 0;
    solutionLength = solution.length;

    var solutionArea = computed.find('div.solutionArea');
    solutionPieces = print(solution);

    var numberOfRows = solutionPieces[0].maxrow - solutionPieces[0].minrow;
    var numberOfCols = solutionPieces[0].maxcol - solutionPieces[0].mincol;
    if (solutionPieces.every(function (piece) {
            return piece.maxcol - piece.mincol == numberOfCols && piece.maxrow - piece.minrow == numberOfRows;
        })) {
        console.log('all pieces are the same');
        generatePolyminoTable();
        return;
    }

    shufflePieces(solutionPieces);

    solutionPieces.forEach(function (piece, index) {
        var view = piece.getView();
        solutionArea.append(view);
        view.setAttribute('id', 'piece' + index);

        $(view).find('td.pieceCell').each(function () {
            var cell = this;
            cell.onmousedown = function (e) {
                view.style.display = '';
                var coords = getCoordinates(view);
                var shiftX = e.pageX - coords.left;
                var shiftY = e.pageY - coords.top;

                var isPieceSet = true;
                currentCoordinatesAttribute = view.getAttribute('data-nodes');
                currentPieceTdCoordinates = currentCoordinatesAttribute.split('-').map(function (item) {
                    return Node.fromString(item);
                });

                var row = void 0,
                    column = void 0;

                var _getRowAndCol = getRowAndCol(e);

                row = _getRowAndCol.row;
                column = _getRowAndCol.column;

                var isPieceRemoved = false;
                currentPieceTdCoordinates.every(function (item) {
                    var tdRow = parseInt(item.row) + row;
                    var tdCol = parseInt(item.column) + column;
                    var td = computed.find('#td-' + tdRow + '-' + tdCol);
                    if (td.hasClass('set') && !isPieceRemoved) {
                        isPieceRemoved = true;
                        piecesSet--;
                    }
                    td.removeClass('set');
                    td.removeAttr('data-piece');
                    return true;
                });

                function moveAt(e) {
                    view.style.left = e.pageX - shiftX - 8 + 'px';
                    view.style.top = e.pageY - shiftY + 'px';
                }

                function getRowAndCol(e) {
                    var offset = solutionArea.offset();
                    var containerX = e.pageX - offset.left;
                    var containerY = e.pageY - offset.top;
                    var row = Math.round((containerY - shiftY) / tableCellWidth);
                    var column = Math.round((containerX - shiftX) / tableCellWidth);
                    return { row: row, column: column };
                }

                view.style.zIndex = 1000; // над другими элементами
                view.style.position = 'absolute';
                document.body.appendChild(view);
                moveAt(e);

                document.onmousemove = function (e) {
                    moveAt(e);
                };

                cell.onmouseup = function (e) {
                    var row = void 0,
                        column = void 0;

                    var _getRowAndCol2 = getRowAndCol(e);

                    row = _getRowAndCol2.row;
                    column = _getRowAndCol2.column;

                    var rowPosition = row * tableCellWidth;
                    var columnPosition = column * tableCellWidth;
                    var currentPieceCells = [];
                    currentPieceTdCoordinates.every(function (item) {
                        var tdRow = parseInt(item.row) + row;
                        var tdCol = parseInt(item.column) + column;
                        var cell = computed.find('#td-' + tdRow + '-' + tdCol).not('.set').not('.border-cell');

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
                        currentPieceCells.forEach(function (item) {
                            item.addClass('set');
                            item.attr('data-piece', $(view).attr('id'));
                        });
                        view.style.left = columnPosition - 8 + 'px';
                        view.style.top = rowPosition + 'px';
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

                    document.onmousemove = null;
                    cell.onmouseup = null;
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

            cell.ondragstart = function () {
                return false;
            };
        });

        view.ondragstart = function () {
            return false;
        };
    });
}

function placePiece() {
    var index = parseInt($(this).attr('id').replace('piece', ''));
    setTimeoutForCoveringPiece(solutionPieces[index], $(this));
}

function placePieceNoInterval() {
    var piece = $(this);
    var left = parseInt(piece.css('left'));
    var top = parseInt(piece.css('top'));
    var row = Math.round(top / tableCellWidth);
    var column = Math.round((left + 8) / tableCellWidth);
    var currentCoordinatesAttribute = piece.attr('data-nodes');
    var currentPieceTdCoordinates = currentCoordinatesAttribute.split(/\s*-\s*/).map(function (item) {
        var coordinates = item.split(/\s*,\s*/);
        return [parseInt(coordinates[0]) + row, parseInt(coordinates[1]) + column];
    });

    var index = parseInt(piece.attr('id').replace('piece', ''));
    var solutionPiece = solutionPieces[index];
    coverPieceInTable(new Piece(currentPieceTdCoordinates, solutionPiece.color));

    //coverPieceInTable(solutionPieces[index]);

    piece.remove();
}

function getCoordinates(elem) {
    // (1)
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    // (2)
    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    // (3)
    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    // (4)
    var top = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    // (5)
    return { top: Math.round(top), left: Math.round(left) };
}

// DLX algorithm
function search(header, solution, k) {
    if (performance.now() - timeStart > 5000) {
        console.log("Too long");
        return;
    }
    if (header.right == header) {
        if (isSolutionFound) {
            return;
        }
        isSolutionFound = true;
        //print(solution);
    } else {
        if (isSolutionFound) {
            return;
        }
        var current = chooseColumn(header);
        coverColumn(current);
        var row = current.down;

        while (row != current && !isSolutionFound) {
            solution[k] = row;

            var j = row.right;
            while (j != row) {
                coverColumn(j.column);
                j = j.right;
            }
            search(header, solution, k + 1);
            row = solution[k];
            current = row.column;
            j = row.left;
            while (j != row) {
                uncoverColumn(j.column);
                j = j.left;
            }
            row = row.down;
        }

        uncoverColumn(current);
    }
}

function setTimeoutForCoveringPiece(piece, removedPiece) {
    return new Promise(function (resolve) {
        if (!piece) return;
        stepOfInterval++;
        setTimeout(function () {
            coverPieceInTable(piece);
            if (removedPiece) {
                removedPiece.remove();
            }
            resolve();
        }, interval * stepOfInterval);
    });
}

function coverPieceInTable(piece) {
    var nodes = piece.nodes;
    var backgroundColor = piece.color;
    for (var i = 0; i < nodes.length; i++) {
        var row = nodes[i].row;
        var column = nodes[i].column;
        var td = computed.find('#td-' + row + '-' + column);
        var border = '1px dashed #121212';
        td.css({ backgroundColor: backgroundColor, /*boxShadow,*/border: border });
        td.addClass('set');
    }
}

function alertWithInterval(message) {
    var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;

    setTimeout(function () {
        alert(message);
    }, interval);
}

function print(solution) {
    var pieces = [];
    console.log('Solution(' + solution.length + ' pieces):');
    //let interval = 50;
    for (var i = 0; i < solution.length; i++) {
        var o = solution[i];
        var f = solution[i].left;
        var str = '';
        var nodes = [];
        while (o != f) {
            nodes.push(o.column.name.toArray());
            str += o.column.name.toString() + '   ';
            o = o.right;
        }
        nodes.push(o.column.name.toArray());
        str += o.column.name.toString();
        pieces.push(new Piece(nodes));
        console.log(str);
    }
    return pieces;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 12 + 2)];
    }
    if (color == '#000000' || color == '#FFFFFF') {
        return '#333333';
    }
    return color;
}

function chooseColumn(header) {
    var j = header.right;
    var current = j;
    var size = j.size;

    while (j != header) {
        if (j.size < size) {
            current = j;
            size = j.size;
        }
        j = j.right;
    }

    return current;
}

function coverColumn(current) {
    current.right.left = current.left;
    current.left.right = current.right;
    var i = current.down;
    while (i != current) {
        var j = i.right;
        while (j != i) {
            j.down.up = j.up;
            j.up.down = j.down;
            j.column.size--;

            j = j.right;
        }

        i = i.down;
    }
}

function uncoverColumn(current) {
    var i = current.up;
    while (i != current) {
        var j = i.left;
        while (j != i) {
            j.column.size++;
            j.down.up = j;
            j.up.down = j;

            j = j.left;
        }

        i = i.up;
    }
    current.right.left = current;
    current.left.right = current;
}