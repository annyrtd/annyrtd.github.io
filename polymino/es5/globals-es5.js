'use strict';

var isSolutionFound = false;
var interval = 200;
var stepOfInterval = 0;
var currentPieceTdCoordinates = void 0;
var currentCoordinatesAttribute = void 0;
var piecesSet = 0;
var solutionLength = void 0;
var solution = [];
var solutionPieces = [];
var timeStart = void 0;
var scoreForLevel = 500;

var stepOfIntervalCreative = 0;
var currentPieceTdCoordinatesCreative = void 0;
var currentCoordinatesAttributeCreative = void 0;
var piecesSetCreative = 0;
var solutionLengthCreative = void 0;
var solutionCreative = [];
var solutionPiecesCreative = [];

var repeats = 2;
var level = 0;
var score = 0;
var pieceCost = 400;
var giveUpCost = void 0;

var tableCellWidth = 35;
var computed = void 0;
var creative = void 0;

function saveToLocalStorage() {
    if (localStorage) {
        localStorage['level'] = parseInt(level);
        localStorage['score'] = parseInt(score);
    }
}

function restoreFromLocalStorage() {
    if (localStorage) {
        level = parseInt(localStorage['level']);
        score = parseInt(localStorage['score']);
    }
}