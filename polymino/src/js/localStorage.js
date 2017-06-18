function saveIntegerToLocalStorage(key, value) {
    if (localStorage) {
        localStorage[key] = parseInt(value);
    }
}

function restoreIntegerFromLocalStorage(key) {
    let value = 0;

    if (localStorage) {
        const restoredValue = parseInt(localStorage.getItem(key));
        value = restoredValue ? restoredValue : 0;
        saveIntegerToLocalStorage(key, value);
    }

    return value;
}

export {saveIntegerToLocalStorage, restoreIntegerFromLocalStorage};