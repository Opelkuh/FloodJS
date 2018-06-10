/**
 * Finds the ideal next turn in the tile map
 * @param {String[][]} tiles
 * @returns {String} suggested next turn 
 */
function findNext(tiles) {
    return findSolutions(tiles, false);
}

/**
 * Solves the tile map using best-first search
 * @param {String[][]} tiles tile map that should be searched
 * @returns {String[]} the found solution
 */
function findSolution(tiles) {
    return findSolutions(tiles, true);
}

/**
 * Finds the path for the provided tile map using best-first search
 * @param {String[][]} source tile map that should be searched
 * @param {Boolean} repeat whether this function should run until it finds the complete solution
 * @param {String[]} stack previous turns
 * @returns {String[]} the 'ideal' path
 */
function findSolutions(source, repeat, stack = []) {
    let out = [];
    let edges = [];
    let ret = JSON.parse(JSON.stringify(source));
    findChunk(ret, 0, 0, out, edges);
    var colorNum = {};
    edges.forEach((i) => {
        let colorOut = [];
        let colorEdges = [];
        findChunk(ret, i.x, i.y, colorOut, colorEdges);
        if (!colorNum[i.color]) colorNum[i.color] = 0;
        colorNum[i.color] += colorOut.length;
    });
    let highestFound = -1;
    var best;
    for (key in colorNum) {
        if (colorNum[key] > highestFound) {
            best = key;
            highestFound = colorNum[key];
        }
    }
    if (!repeat) return best;
    //Generate new tiles
    out.forEach((i) => {
        ret[i.x][i.y] = best;
    });
    //Check if finished
    let color = ret[0][0];
    var isUniform = true;
    for (let x = 0; x < ret.length; x++) {
        for (let y = 0; y < ret[x].length; y++) {
            if (ret[x][y] != color) {
                isUniform = false;
                break;
            }
        }
        if (!isUniform) break;
    }
    stack.push(best);
    if (isUniform) return stack;
    else {
        return findSolutions(ret, repeat, stack);
    }
}