var nextFrame = [];
var nextFrameTime = Date.now();
var targetFramerate = 1000/50;

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
        thisFrame.slice(0).forEach((i) => {
            i.call(null);
        });
    }
    
    window.requestAnimationFrame(renderFrame);
}

renderFrame();