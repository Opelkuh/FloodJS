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
var tileSize = 20;
var colors = ["red", "blue", "yellow", "orange", "cyan", "green"]
var tiles = [];

for (let x = 0; x < size; x++) {
    tiles.push([]);
    for (let y = 0; y < size; y++) {
        let colorId = getRandomInt(0, colors.length);
        tiles[x][y] = colors[colorId];
    }
}

c.addEventListener('click', function (event) {
    let x = Math.floor((event.pageX - c.offsetLeft)/tileSize);
    let y = Math.floor((event.pageY - c.offsetTop)/tileSize);
    //Find clicked
    if (x >= tiles.length) return;
    if (y >= tiles[x].length) return;
    game(tiles[x][y]);
}, false);

render();

function render() {
    for(let x = 0; x < tiles.length; x++) {
        for(let y = 0; y < tiles[x].length; y++) {
            ctx.fillStyle = tiles[x][y];
            ctx.fillRect(x*tileSize, y*tileSize, tileSize, tileSize);
        }
    }
    //window.requestAnimationFrame(xd);
}

function game(color) {
    var toChange = [{x:0, y:0}];
    findNeighbors(0,0,toChange);
    console.log(toChange);
    toChange.forEach((i) => {
        tiles[i.x][i.y] = color;
    });
    render();
}

function findNeighbors(x,y,out) {
    //Input check
    if(!tileExists(x,y)) return;
    //Color check
    console.log("Find X:%i Y:%i", x,y);
    let color = tiles[x][y];
    matchTile(x, y-1, color, out); //Up
    matchTile(x+1, y, color, out); //Right
    matchTile(x, y+1, color, out); //Down
    matchTile(x-1, y, color, out); //Left
}

function tileExists(x,y) {
    if(x < 0) return false;
    if(y < 0) return false;
    if(tiles.length <= x) return false;
    if(tiles[x].length <= y) return false;
    return true;
}

function matchTile(x,y,color,out) {
    if(!tileExists(x,y)) return;
    let exists = false;
    out.forEach((i) => {
        if(i.x == x && i.y == y) exists = true;
    })
    if(exists) return;
    let ret = tiles[x][y];
    if(ret != color) return;
    out.push({x:x, y:y});
    findNeighbors(x,y,out);
}