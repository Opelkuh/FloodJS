/**
 * The maximum is exclusive and the minimum is inclusive
 * @param {Number} min 
 * @param {Number} max
 * @returns {Number} 
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}


var c = document.getElementById("game");
var ctx = c.getContext("2d");
var size = 16;
var tileSize = 15;
var colors = ["red", "blue", "yellow", "orange", "cyan", "green"]
var tiles = [];
var turns = 0;


for (let x = 0; x < size; x++) {
    tiles.push([]);
    for (let y = 0; y < size; y++) {
        let colorId = getRandomInt(0, colors.length);
        tiles[x][y] = colors[colorId];
    }
}

c.addEventListener('click', function (event) {
    let x = Math.floor((event.pageX - c.offsetLeft) / tileSize);
    let y = Math.floor((event.pageY - c.offsetTop) / tileSize);
    //Find clicked
    if (x >= tiles.length) return;
    if (y >= tiles[x].length) return;
    game(tiles[x][y]);
}, false);

/**
 * Does game logic
 * @param {String} color clicked target
 */
function game(color) {
    if (tiles[0][0] == color) return;
    var toChange = [{
        x: 0,
        y: 0
    }];
    turns++;
    var edges = [];
    findChunk(0, 0, color, toChange, edges);
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
    if (isUniform) func = doEndGameAnimation;
    //Queue animation
    edges.forEach((i) => {
        doChangeAnimation(toChange, i.x, i.y, color, func);
    });
}

/**
 * Does the end-game animation
 */
function doEndGameAnimation() {
    var cycles = 10;
    var delay = 2;

    let original = tiles[0][0];
    let x = Math.floor(tiles.length / 2);
    let y = Math.floor(tiles.length / 2);
    for (let i = 0; i < cycles; i++) {
        waitFrames(i * delay, () => {
            doSpread(x, y, colors[i % colors.length], []);
        });
    }
    waitFrames(cycles * delay, () => {
        doSpread(x, y, original, []);
    });
}

/**
 * Creeps from the selected position
 * @param {Number} x 
 * @param {Number} y 
 * @param {String} color 
 * @param {Object[]} blacklist 
 */
function doSpread(x, y, color, blacklist) {
    findNeighbors(x, y, blacklist).forEach((i) => {
        drawTile(i.x, i.y, color);
        blacklist.push(i);
        onFrame(() => {
            doSpread(i.x, i.y, color, blacklist);
        });
    });

}

/**
 * Calls the function after <frames> frames
 * @param {Number} frames 
 * @param {Function} cb 
 */
function waitFrames(frames, cb) {
    if (frames <= 0) onFrame(cb);
    else onFrame(() => waitFrames(--frames, cb));
}

/**
 * Creates the animation on tile change
 * @param {Object[]} toChange 
 * @param {Number} x 
 * @param {Number} y 
 * @param {String} color 
 * @param {Function} cb call after the animation ends 
 */
function doChangeAnimation(toChange, x, y, color, cb) {
    if (toChange.length > 0) {
        if (toChange[0].finished) return;
    }
    findNeighbors(x, y, toChange, true).forEach((i) => {
        drawTile(i.x, i.y, color);
        toChange.forEach((z, key) => {
            if (z.x == i.x && z.y == i.y) toChange.splice(key, 1);
        });
        onFrame(() => {
            doChangeAnimation(toChange, i.x, i.y, color, cb);
        });
    });
    if (toChange.length == 0) {
        console.log(toChange);
        cb.call(null);
        toChange.push({
            finished: true
        });
    }
}

/**
 * Finds the solved color chunk from 0,0
 * @param {Number} x 
 * @param {Number} y 
 * @param {String} targetColor 
 * @param {Object[]} out 
 * @param {Object[]} edgeOut
 */
function findChunk(x, y, targetColor, out, edgeOut) {
    //Input check
    if (!tileExists(x, y)) return;
    //Color check
    let color = tiles[x][y];
    findNeighbors(x, y, out).forEach((tile) => {
        switch (tile.color) {
            case color:
                out.push({
                    x: tile.x,
                    y: tile.y
                });
                findChunk(tile.x, tile.y, targetColor, out, edgeOut);
                break;
            case targetColor:
                edgeOut.push({
                    x: tile.x,
                    y: tile.y
                });
                return;
                break;
            default:
                return;
        }
    });
}

/**
 * Gets all the existing neighbors of the tile
 * @param {Number} x 
 * @param {Number} y 
 * @param {Object[]} [list=[]]
 * @param {Boolean} [isWhitelist=false] whether the list is a whitelist (true) or ignorelist (false)
 * @returns {Object[]}
 */
function findNeighbors(x, y, list = [], isWhitelist = false) {
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
        let tile = getTile(tileX, tileY);
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
 * @param {Number} x 
 * @param {Number} y
 * @returns {Boolean} 
 */
function tileExists(x, y) {
    if (x < 0) return false;
    if (y < 0) return false;
    if (tiles.length <= x) return false;
    if (tiles[x].length <= y) return false;
    return true;
}

/**
 * Gets color of the tile
 * @param {Number} x 
 * @param {Number} y
 * @returns {String} color of the tile
 */
function getTile(x, y) {
    if (!tileExists(x, y)) return;
    return tiles[x][y];
}

renderFrame();