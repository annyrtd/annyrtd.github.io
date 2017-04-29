// algo: https://en.wikipedia.org/wiki/Fisher-Yates_shuffle
function shufflePieces(arrayOfPieces) {
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

export {shufflePieces};