'use strict';

/*window.onerror = function (message, url, lineNo){
    alert('Error: ' + message + '\n' + 'Line Number: ' + lineNo);
    return true;
};*/

function supportsPromise() {
    return typeof Promise !== "undefined";
}/*

function supportsWeakMap() {
    return typeof WeakMap !== "undefined";
}*/

if(!supportsPromise()) {
    document.write(
        '<script src="Promise.js"></script>\n'
    );
}
/*

if(!supportsWeakMap()) {
    document.write(
        '<script src="weakmap.js"></script>\n'
    );
}*/
