var nextFrame = [];
var nextFrameTime = Date.now();
var targetFramerate = 1000 / 50;
var isFresh = false;

/**
 * Renders a single tile
 * @param {Number} x 
 * @param {Number} y 
 * @param {String} color 
 */
function drawTile(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
}

/**
 * Renders a single hint
 * @param {Number} x 
 * @param {Number} y 
 */
function drawHint(x, y) {
    let offset = (tileSize / 2) - hintSize / 2;
    ctx.fillStyle = "black";
    ctx.fillRect(x * tileSize + offset, y * tileSize + offset, hintSize, hintSize);
}

/**
 * Rerenders all tiles
 */
function renderTiles() {
    for (let x = 0; x < tiles.length; x++) {
        for (let y = 0; y < tiles[x].length; y++) {
            drawTile(x, y, tiles[x][y]);
        }
    }
}

/**
 * Called on requestAnimationFrame
 */
function renderFrame() {
    if (Date.now() > nextFrameTime) {
        nextFrameTime = Date.now() + targetFramerate;
        let thisFrame = nextFrame.slice(0);
        nextFrame = [];
        thisFrame.sort((a, b) => {
            if (!a.turn) return -1;
            if (!b.turn) return 1;
            return a.turn - b.turn;
        });
        if (thisFrame.length <= 0) {
            if (!isFresh) {
                renderTiles();
                displayHints();
                isFresh = true;
            }
        } else {
            isFresh = false;
            thisFrame.forEach((i) => {
                if (!i.cb) {
                    console.warn("Invalid nextFrame function! Add function using 'onFrame'!!");
                    return;
                }
                i.cb.call(null);
            });
        }
    }

    window.requestAnimationFrame(renderFrame);
}

/**
 * Adds the function to the stack for next frame
 * @param {Function} cb 
 */
function onFrame(cb) {
    nextFrame.push({
        cb: cb,
        turn: turns
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