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
        announceWin();
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
    findNeighbors(tiles, x, y, blacklist).forEach((i) => {
        drawTile(i.x, i.y, color);
        blacklist.push(i);
        onFrame(() => {
            doSpread(i.x, i.y, color, blacklist);
        });
    });

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
    drawTile(x, y, color);
    findNeighbors(tiles, x, y, toChange, true).forEach((i) => {
        drawTile(i.x, i.y, color);
        toChange.forEach((z, key) => {
            if (z.x == i.x && z.y == i.y) toChange.splice(key, 1);
        });
        onFrame(() => {
            doChangeAnimation(toChange, i.x, i.y, color, cb);
        });
    });
    if (toChange.length == 0) {
        cb.call(null);
        toChange.push({
            finished: true
        });
    }
}