'use strict';

import $ from "jquery";

function transformTableToMatrix(container) {
    const arr = [];
    container.find("table.polytable tr.field-row").each((index, row) => {
        arr[arr.length] = [];
        $(row).children('td.cell').each((index2, cell) => {
            let item = 0;
            if ($(cell).hasClass('border-cell')) {
                item = 1;
            }
            arr[index][arr[index].length] = item;
        });
    });
    return arr;
}

export {transformTableToMatrix};