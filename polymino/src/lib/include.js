'use strict';

/*window.onerror = function (message, url, lineNo){
    alert('Error: ' + message + '\n' + 'Line Number: ' + lineNo);
    return true;
};*/

function supportsPromise() {
    return typeof Promise != "undefined";
}

if(!supportsPromise()) {
    document.write(
        '<script src="Promise.js"></script>\n'
    );
}