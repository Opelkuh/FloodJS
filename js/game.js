var EXTRA_TURNS = 2;
var MAX_UNDO = 2;

/**
 * Generates a random number between two values
 * @param {Number} min INCLUSIVE minimal value
 * @param {Number} max EXCLUSIVE maximal value
 * @returns {Number} 
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Starts a new game
 */
function newGame() {
    turns = 0;
    tiles = [];
    for (let x = 0; x < size; x++) {
        tiles.push([]);
        for (let y = 0; y < size; y++) {
            let colorId = getRandomInt(0, colors.length);
            tiles[x][y] = colors[colorId];
        }
    }
    maxTurns = findSolution(tiles).length + EXTRA_TURNS;
    nextFrame = [];
    canUndo = true;
    updateTurnIndicator();
    renderTiles();
    displayHints();
}

/**
 * Does game logic
 * @param {String} color clicked target
 */
function game(color) {
    if (turns >= maxTurns) return;
    if (tiles[0][0] == color) return;
    saveTurn();
    var toChange = [];
    turns++;
    updateTurnIndicator();
    var edges = [];
    findChunk(tiles, 0, 0, toChange, edges);
    //Change chunk color
    toChange.forEach((i) => {
        tiles[i.x][i.y] = color;
    });
    if (edges.length <= 0) {
        edges.push({
            x: 0,
            y: 0
        });
    }
    //Check if finished
    var isUniform = true;
    var func = () => {};
    for (let x = 0; x < tiles.length; x++) {
        for (let y = 0; y < tiles[x].length; y++) {
            if (tiles[x][y] != color) {
                isUniform = false;
                break;
            }
        }
        if (!isUniform) break;
    }
    if (isUniform) {
        canUndo = false;
        func = doEndGameAnimation;
    }
    //Queue animation
    displayHints();
    edges.forEach((i) => {
        if (i.color == color) {
            doChangeAnimation(toChange, i.x, i.y, color, func);
        }
    });
    if (!isUniform && turns >= maxTurns) {
        canUndo = false;
        announceLoss();
    }
}

function saveTurn() {
    tileHistory.push(JSON.parse(JSON.stringify(tiles)));
    if(tileHistory.length > MAX_UNDO) {
        tileHistory.shift();
    }
}

function undo() {
    if(!canUndo) return;
    let change = tileHistory.pop();
    if(!change) return;
    turns--;
    tiles = change;
    renderTiles();
    updateTurnIndicator();
}

/**
 * Shows hints for this round
 * @returns {Boolean} whether the hints were drawn or not
 */
function displayHints() {
    if (!showHints) return false;
    let edges = [];
    findChunk(tiles, 0, 0, [], edges);
    let color = findNext(tiles);
    let toChange = edges.filter(i => i.color == color);
    toChange.forEach((item) => {
        drawHint(item.x, item.y);
    });
    return true;
}

/**
 * Finds the solved color chunk from 0,0
 * @param {String[][]} tiles
 * @param {Number} x 
 * @param {Number} y 
 * @param {Object[]} out 
 * @param {Object[]} edgeOut
 */
function findChunk(tiles, x, y, out, edgeOut, color = null) {
    if (out.length == 0) {
        out.push({
            x: x,
            y: y
        });
    }
    if (color == null) color = tiles[x][y];
    //Input check
    if (!tileExists(tiles, x, y)) return;
    //Color check
    findNeighbors(tiles, x, y, out).forEach((tile) => {
        if (tile.color == color) {
            out.push({
                x: tile.x,
                y: tile.y
            });
            findChunk(tiles, tile.x, tile.y, out, edgeOut, color);
        } else {
            let exists = false;
            edgeOut.forEach((i) => {
                if (i.x == tile.x && i.y == tile.y) exists = true;
            });
            if (!exists) edgeOut.push(tile);
        }
    });
}

/**
 * Gets all the existing neighbors of the tile
 * @param {String[][]} tiles
 * @param {Number} x 
 * @param {Number} y 
 * @param {Object[]} [list=[]]
 * @param {Boolean} [isWhitelist=false] whether the list is a whitelist (true) or ignorelist (false)
 * @returns {Object[]}
 */
function findNeighbors(tiles, x, y, list = [], isWhitelist = false) {
    let ret = [];
    let targets = [{
        x: x + 1,
        y: y
    }, {
        x: x,
        y: y + 1
    }, {
        x: x - 1,
        y: y
    }, {
        x: x,
        y: y - 1
    }];
    targets.forEach((item) => {
        let tileX = item.x;
        let tileY = item.y;
        //Check if already exists
        let exists = false;
        list.forEach((i) => {
            if (i.x == tileX && i.y == tileY) exists = true;
        });
        if (isWhitelist) exists = !exists;
        if (exists) return;
        //Get tile color
        let tile = getTile(tiles, tileX, tileY);
        if (!tile) return;
        ret.push({
            x: tileX,
            y: tileY,
            color: tile
        });
    });
    return ret;
}

/**
 * Checks whether the tile exists
 * @param {String[][]} tiles
 * @param {Number} x 
 * @param {Number} y
 * @returns {Boolean} 
 */
function tileExists(tiles, x, y) {
    if (x < 0) return false;
    if (y < 0) return false;
    if (tiles.length <= x) return false;
    if (tiles[x].length <= y) return false;
    return true;
}

/**
 * Gets color of the tile
 * @param {String[][]} tiles
 * @param {Number} x 
 * @param {Number} y
 * @returns {String} color of the tile
 */
function getTile(tiles, x, y) {
    if (!tileExists(tiles, x, y)) return;
    return tiles[x][y];
}

var c = document.getElementById("game");
var ctx = c.getContext("2d");
var size = 16;
var tileSize = 18;
var hintSize = tileSize / 3;
var colors = ["red", "blue", "yellow", "orange", "cyan", "green"]
var tiles = [];
var tileHistory = [];
var turns = 0;
var maxTurns = 0;
var showHints = false;
var canUndo = true;

c.width = tileSize * size;
c.height = c.width;
c.addEventListener('click', function (event) {
    let x = Math.floor((event.pageX - c.offsetLeft) / tileSize);
    let y = Math.floor((event.pageY - c.offsetTop) / tileSize);
    //Find clicked
    if (x >= tiles.length) return;
    if (y >= tiles[x].length) return;
    game(tiles[x][y]);
}, false);

newGame();
renderFrame();