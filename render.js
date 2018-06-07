var nextFrame = [];
var nextFrameTime = Date.now();
var targetFramerate = 1000/50;
var isFresh = false;

/**
 * Renders a single tile
 * @param {Number} x 
 * @param {Number} y 
 * @param {String} color 
 */
function drawTile(x,y,color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
}

/**
 * Rerenders all tiles
 */
function renderTiles() {
    for (let x = 0; x < tiles.length; x++) {
        for (let y = 0; y < tiles[x].length; y++) {
            drawTile(x,y,tiles[x][y]);
        }
    }
}

/**
 * Called on requestAnimationFrame
 */
function renderFrame() {
    if(Date.now() > nextFrameTime) {
        nextFrameTime = Date.now()+targetFramerate;
        let thisFrame = nextFrame.slice(0);
        nextFrame = [];
        thisFrame.sort((a,b) => {
            if(!a.turn) return -1;
            if(!b.turn) return 1;
            return a.turn - b.turn;
        });
        if(thisFrame.length <= 0) {
            if(!isFresh) {
                console.log("Fresh");
                renderTiles();
                isFresh = true;
            }
        }
        else {
            isFresh = false;
            thisFrame.forEach((i) => {
                if(!i.cb) {
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
    nextFrame.push({cb:cb, turn: turns});
}