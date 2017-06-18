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

export {Node};