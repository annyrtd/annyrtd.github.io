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

function getPageX(event) {
    if(event.pageX) {
        return event.pageX;
    } else {
        const touches = event.changedTouches;
        if(touches && touches[0]) {
            return touches[0].pageX;
        }
    }
}

function getPageY(event) {
    if(event.pageY) {
        return event.pageY;
    } else {
        const touches = event.changedTouches;
        if(touches && touches[0]) {
            return touches[0].pageY;
        }
    }
}

export {getCoordinates, getPageX, getPageY};