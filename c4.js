var HEIGHT = 480;
var WIDTH = 800;
var COLS = 7;
var ROWS = 6;
var spriteWidth = 80;
var spriteHeight = 57;
var REFRESH_RATE = 16;

var pieceSpeed = 20;

var moveNumber = 0;

var EMPTY = 0;
var P1 = 1;
var P2 = 2;

//store the board transposed (we usually care about columns)
var boardPos = [];
var nextTurn;
var turn = P1;

var initBoard = function(defaultValueCallback) {
    board = [];
    for(var i=0; i<COLS; i++) {
        board[i] = [];
        for(var j=0; j<ROWS; j++) {
            board[i][j] = defaultValueCallback(i, j);
        }
    }
    return board;
};

var checkWin = function() {
    var boardCheck = initBoard(function() { return {}; });
    
    for(var i=0; i<COLS; i++) {
        for(var j=0; j<ROWS; j++) {
            if(boardPos[i][j] != EMPTY) {
                boardCheck[i][j] = {cols:1, rows:1, diag:1};
                if(i>0 && boardPos[i][j] == boardPos[i-1][j]) { boardCheck[i][j].cols = boardCheck[i-1][j].cols + 1; }
                if(j>0 && boardPos[i][j] == boardPos[i][j-1]) { boardCheck[i][j].rows = boardCheck[i][j-1].rows + 1; }
                if(i>0 && j>0 && boardPos[i][j] == boardPos[i-1][j-1]) { boardCheck[i][j].diag = boardCheck[i-1][j-1].diag + 1; }
            }
            else {
                boardCheck[i][j] = {cols:0, rows:0, diag:0};
            }
            
            for(var dir in boardCheck[i][j]) {
                if(boardCheck[i][j][dir] == 4) { return true; }
            }
        }
    }
    
    return false;
};

var advanceTurn = function(currentTurn) {
    if(currentTurn == P1) { return P2; }
    else if(currentTurn == P2) { return P1; }
};
var dropPiece = function($, col, board, piece) {
    col = parseInt(col);
    var sprite = board.addSprite("move" + moveNumber, {
                animation: piece,
                width: spriteWidth,
                height: spriteHeight,
                posx: col * spriteWidth,
                posy: 0 
    });
    var curPieceId = moveNumber;
    
    moveNumber = moveNumber + 1;
    
    var curCol = boardPos[col];
    var highestFilledRow = ROWS;
    for(var i=0; i<ROWS; i++) {
        if(curCol[i] == EMPTY) {
            continue;
        }
        else {
            highestFilledRow = i;
            break;
        }
    }

    if(highestFilledRow == 0) {
        alert("Can't move");
        return;
    }
    nextTurn = advanceTurn(turn);
    boardPos[col][highestFilledRow-1] = turn;
    
    //make the move
    turn = EMPTY;

    var bottomOfCol = (highestFilledRow - 1) * spriteHeight;
            
    turn = EMPTY;
    $.playground().registerCallback(function() {
        var currentSprite = $("#move" + curPieceId);
        var newTop = parseInt(currentSprite.css("top")) + pieceSpeed;
        if(newTop < bottomOfCol) {
            currentSprite.css("top", newTop);
            return false;
        }
        else {
            currentSprite.css("top", bottomOfCol);
            turn = nextTurn;
            if(checkWin()) {
                alert("win!");
            }
            return true;
        }
        
    }, REFRESH_RATE);
};

var init = function($) {
    boardPos = initBoard(function() { return EMPTY; });

    var boardSquare = new $.gameQuery.Animation({ imageURL: "images/sprites.png",
                                            numberOfFrame: 1,
                                            type: $.gameQuery.ANIMATION_ONCE,
                                            offsetx: 0,
                                            offsety: 0});

    var p1Piece = new $.gameQuery.Animation({ imageURL: "images/sprites.png",
                                            numberOfFrame: 1,
                                            type: $.gameQuery.ANIMATION_ONCE,
                                            offsetx: 80,
                                            offsety: 0});
                                            
    var p2Piece = new $.gameQuery.Animation({ imageURL: "images/sprites.png",
                                            numberOfFrame: 1,
                                            type: $.gameQuery.ANIMATION_ONCE,
                                            offsetx: 160,
                                            offsety: 0});
    
    $("#gameboard").playground({height: HEIGHT, width: WIDTH})
        .addGroup("pieceSprites", {height: HEIGHT, width: WIDTH}).end()
        .addGroup("boardsquares", {height: HEIGHT, width: WIDTH});
        
    var boardSprite = $("#boardsquares");    
    var pieceSprites = $("#pieceSprites");
    
    for(var i = 0; i < ROWS; i++) {
        for(var j = 0; j < COLS; j++) {
            var currentSquare = i + "x" + j;
            boardSprite.addSprite(currentSquare, {
                        animation: boardSquare, 
                        width: spriteWidth, 
                        height: spriteHeight, 
                        posx: j * spriteWidth, 
                        posy: i * spriteHeight
            });

            $("#" + currentSquare).click(function(e) {
                var rowcol = e.target.id.split("x");
                if(turn == P1) {
                    dropPiece($, rowcol[1], pieceSprites, p1Piece);
                }
                else if(turn == P2) {
                    dropPiece($, rowcol[1], pieceSprites, p2Piece);
                }
            });
        }
    }

    $.playground().startGame();
    
};

jQuery(document).ready(init);
