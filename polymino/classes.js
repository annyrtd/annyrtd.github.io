'use strict';

class RootObject {
    constructor({left, right}) {
        this.left = left;
        this.right = right;
    }
}

class DataObject extends RootObject{
    constructor({left, right, up, down, column}) {
        super({left, right});
        this.up = up;
        this.down = down;
        this.column = column;
    }
}

class ColumnObject extends DataObject{
    constructor({left, right, up, down, column, size = 0, name}) {
        super({left, right, up, down, column});
        this.size = size;
        this.name = name;
    }
}

class Node {
    constructor(row, column) {
        this.row =  row;
        this.column = column;
    }
    //example: "1,1"
    static fromString(str) {
        let position = str.indexOf(',');
        let row = str.substr(0, position);
        let column = str.substr(position + 1);
        return new Node(row, column);
    }
    toString() {
        return this.row + ',' + this.column;
    }
    equalsTo(node) {
        return (this.row == node.row) && (this.column == node.column);
    }
    toArray() {
        return [this.row, this.column];
    }
}

class Piece {
    constructor(coordinates, color = getRandomColor()) {
        this.color = color;
        let nodes = [];
        let maxrow = coordinates[0][0];
        let minrow = coordinates[0][0];
        let maxcol = coordinates[0][1];
        let mincol = coordinates[0][1];
        for (let i = 0; i < coordinates.length; i++) {
            nodes.push(new Node(coordinates[i][0], coordinates[i][1]));
            if (coordinates[i][0] > maxrow) {
                maxrow = coordinates[i][0];
            }
            if (coordinates[i][1] > maxcol) {
                maxcol = coordinates[i][1];
            }

            if (coordinates[i][0] < minrow) {
                minrow = coordinates[i][0];
            }
            if (coordinates[i][1] < mincol) {
                mincol = coordinates[i][1];
            }
        }

        this.nodes = nodes;
        this.maxrow = maxrow;
        this.minrow = minrow;
        this.maxcol = maxcol;
        this.mincol = mincol;
    }
    getView() {
        let color = this.color;
        let tbody = document.createElement('tbody');
        let table = document.createElement('table');

        for (let i = this.minrow; i <= this.maxrow; i++) {
            let tr = document.createElement('tr');
            for (let j = this.mincol; j <= this.maxcol; j++) {
                let td = document.createElement('td');
                tr.appendChild(td)
            }
            tbody.appendChild(tr);
        }

        this.nodes.forEach(node => {
           let cell = tbody
               .children[node.row - this.minrow]
               .children[node.column - this.mincol];
           cell.style.backgroundColor = color;
           cell.setAttribute('class', 'pieceCell');
           cell.style.border = '1px solid black';
        });

        table.setAttribute('class', 'piece');
        table.setAttribute('data-nodes', this.nodes.map(item => new Node(item.row - this.minrow, item.column - this.mincol).toString()).join('-'));
        table.appendChild(tbody);
        return table;
    }
}