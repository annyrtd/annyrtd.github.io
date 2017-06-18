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

class PieceDataObject extends DataObject{
    constructor({left, right, up, down, column, piece}) {
        super({left, right, up, down, column});
        this.piece = piece;
    }
}

class ColumnObject extends DataObject{
    constructor({left, right, up, down, column, size = 0, name}) {
        super({left, right, up, down, column});
        this.size = size;
        this.name = name;
    }
}

export {ColumnObject, DataObject, RootObject, PieceDataObject};