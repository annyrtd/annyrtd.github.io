'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RootObject = function RootObject(_ref) {
    var left = _ref.left,
        right = _ref.right;

    _classCallCheck(this, RootObject);

    this.left = left;
    this.right = right;
};

var DataObject = function (_RootObject) {
    _inherits(DataObject, _RootObject);

    function DataObject(_ref2) {
        var left = _ref2.left,
            right = _ref2.right,
            up = _ref2.up,
            down = _ref2.down,
            column = _ref2.column;

        _classCallCheck(this, DataObject);

        var _this = _possibleConstructorReturn(this, (DataObject.__proto__ || Object.getPrototypeOf(DataObject)).call(this, { left: left, right: right }));

        _this.up = up;
        _this.down = down;
        _this.column = column;
        return _this;
    }

    return DataObject;
}(RootObject);

var ColumnObject = function (_DataObject) {
    _inherits(ColumnObject, _DataObject);

    function ColumnObject(_ref3) {
        var left = _ref3.left,
            right = _ref3.right,
            up = _ref3.up,
            down = _ref3.down,
            column = _ref3.column,
            _ref3$size = _ref3.size,
            size = _ref3$size === undefined ? 0 : _ref3$size,
            name = _ref3.name;

        _classCallCheck(this, ColumnObject);

        var _this2 = _possibleConstructorReturn(this, (ColumnObject.__proto__ || Object.getPrototypeOf(ColumnObject)).call(this, { left: left, right: right, up: up, down: down, column: column }));

        _this2.size = size;
        _this2.name = name;
        return _this2;
    }

    return ColumnObject;
}(DataObject);

var Node = function () {
    function Node(row, column) {
        _classCallCheck(this, Node);

        this.row = row;
        this.column = column;
    }
    //example: "1,1"


    _createClass(Node, [{
        key: 'toString',
        value: function toString() {
            return this.row + ',' + this.column;
        }
    }, {
        key: 'equalsTo',
        value: function equalsTo(node) {
            return this.row == node.row && this.column == node.column;
        }
    }, {
        key: 'toArray',
        value: function toArray() {
            return [this.row, this.column];
        }
    }], [{
        key: 'fromString',
        value: function fromString(str) {
            var position = str.indexOf(',');
            var row = str.substr(0, position);
            var column = str.substr(position + 1);
            return new Node(row, column);
        }
    }]);

    return Node;
}();

var Piece = function () {
    function Piece(coordinates) {
        var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getRandomColor();

        _classCallCheck(this, Piece);

        this.color = color;
        var nodes = [];
        var maxrow = coordinates[0][0];
        var minrow = coordinates[0][0];
        var maxcol = coordinates[0][1];
        var mincol = coordinates[0][1];
        for (var i = 0; i < coordinates.length; i++) {
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

    _createClass(Piece, [{
        key: 'getView',
        value: function getView() {
            var _this3 = this;

            var color = this.color;
            var tbody = document.createElement('tbody');
            var table = document.createElement('table');

            for (var i = this.minrow; i <= this.maxrow; i++) {
                var tr = document.createElement('tr');
                for (var j = this.mincol; j <= this.maxcol; j++) {
                    var td = document.createElement('td');
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            }

            this.nodes.forEach(function (node) {
                var cell = tbody.children[node.row - _this3.minrow].children[node.column - _this3.mincol];
                cell.style.backgroundColor = color;
                cell.setAttribute('class', 'pieceCell');
                cell.style.border = '1px solid black';
            });

            table.setAttribute('class', 'piece');
            table.setAttribute('data-nodes', this.nodes.map(function (item) {
                return new Node(item.row - _this3.minrow, item.column - _this3.mincol).toString();
            }).join('-'));
            table.appendChild(tbody);
            return table;
        }
    }]);

    return Piece;
}();