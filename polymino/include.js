'use strict';

function detectIE() {
    var ua = window.navigator.userAgent;

    return ua.indexOf('MSIE ') >= 0 ||
        ua.indexOf('Trident/') >= 0 ||
        ua.indexOf('Edge/') >= 0;


}

if(detectIE()) {
    document.write(
        '<script src="es5/Promise.js"></script>\n' +
        '<script src="es5/globals-es5.js"></script>\n' +
        '<script src="es5/classes-es5.js"></script>\n' +
        '<script src="es5/dlx-es5.js"></script>\n' +
        '<script src="es5/script-es5.js"></script>\n' +
        '<script src="es5/script-creative-mode-es5.js"></script>\n'
    );
} else {
    document.write(
        '<script src="globals.js"></script>\n' +
        '<script src="classes.js"></script>\n' +
        '<script src="dlx.js"></script>\n' +
        '<script src="script.js"></script>\n' +
        '<script src="script-creative-mode.js"></script>\n'
    );
}