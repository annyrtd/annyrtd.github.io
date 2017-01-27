'use strict';

/*window.onerror = function (message, url, lineNo){
    alert('Error: ' + message + '\n' + 'Line Number: ' + lineNo);
    return true;
};*/

function supportsES6() {
    "use strict";

    if (typeof Promise == "undefined") return false;
    try {
        eval("let x = 0");
        eval("const y = 0");
        eval("var z = `abc`");
        eval("class Foo {}");
        eval("function(a = 3) {}");
        eval("var bar = (x) => x+1");
    } catch (e) { return false; }

    return true;
}

if(supportsES6()) {
    document.write(
        '<script src="globals.js"></script>\n' +
        '<script src="classes.js"></script>\n' +
        '<script src="dlx.js"></script>\n' +
        '<script src="script.js"></script>\n' +
        '<script src="script-creative-mode.js"></script>\n'
    );
} else {
    document.write(
        '<script src="es5/Promise.js"></script>\n' +
        '<script src="es5/globals-es5.js"></script>\n' +
        '<script src="es5/classes-es5.js"></script>\n' +
        '<script src="es5/dlx-es5.js"></script>\n' +
        '<script src="es5/script-es5.js"></script>\n' +
        '<script src="es5/script-creative-mode-es5.js"></script>\n'
    );
}