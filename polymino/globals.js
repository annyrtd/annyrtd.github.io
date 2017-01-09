'use strict';

let isSolutionFound = false;
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
        if(localStorage.getItem('level')) {
            level = parseInt(localStorage['level']);
		} else {
            localStorage['level'] = level = 0;
		}

        if(localStorage.getItem('score')) {
            score = parseInt(localStorage['score']);
        } else {
            localStorage['score'] = score = 0;
		}
    }
}