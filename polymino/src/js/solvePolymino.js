import {createXListForExactCoverProblem, searchDLX, printDLX, createXListForExactCoverProblemWithPiece, searchDLXWithPiece, countDLXsolutions} from './dlx';
import {searchBruijn, searchBruijnWithPiece, countBruijnSolutions} from './debruijn';

function shouldDeBruijnBeUsed(arr){
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

    return (barriers < 8 && (freeCells + barriers) < 132) || (barriers >= 8 && barriers < 12 && (freeCells + barriers) < 96);
}

function findSolution(arr)  {
    if(shouldDeBruijnBeUsed(arr)) {
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

function findSolutionWithPiece(arr)  {
    if(shouldDeBruijnBeUsed(arr)) {
        console.log('debruijn');
        const solution = [];
        if(!searchBruijnWithPiece(arr, solution)) {
            return;
        }
        return solution;
    } else {
        console.log('dlx');
        const header = createXListForExactCoverProblemWithPiece(arr);
        const solution = [];
        if (!searchDLXWithPiece(header, solution, 0)) {
            return;
        }
        return printDLX(solution);
    }
}

function countSolutions(arr) {
    let numberOfSolutions;

    if(shouldDeBruijnBeUsed(arr)) {
        numberOfSolutions = countBruijnSolutions(arr);
        console.log(`debruijn: ${numberOfSolutions} solutions`);
    } else {
        const header = createXListForExactCoverProblemWithPiece(arr);
        numberOfSolutions = countDLXsolutions(header, 0);
        console.log(`dlx: ${numberOfSolutions} solutions`);
    }

    return numberOfSolutions;
}

export {findSolution, findSolutionWithPiece, countSolutions};