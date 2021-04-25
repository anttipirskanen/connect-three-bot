/**
 * Bot for mythical jewels: http://www.1001pelit.com/match-3/mythical-jewels
 * 
 * 
 * 
 */

import robot from "robotjs";

var state;
const fetch = setInterval(getCurrentGameState, 1);
getCurrentGameState();
const app = setInterval(() => mainLoop({x: 0, y: 0}, {x: 7, y: 7}), 10);


var isProcessing = false;
var currentNode = {x: 0, y: 0}
//Since fetching of state is run in separate thread to target finding, previously successfull coordinates need to be ignored until state is refreshed
var usedTargets = [];


function mainLoop(min, max) {
    if(!isProcessing && state ) {
        isProcessing = true;   
        var flipTarget = null;
        if(!nodeVisited(currentNode)) {
            flipTarget = find(currentNode.x, currentNode.y, state[currentNode.y][currentNode.x].color, state);
        } 
        if(flipTarget ) {
            usedTargets.push(currentNode);
            robot.moveMouse(state[currentNode.y][currentNode.x].x, state[currentNode.y][currentNode.x].y);
            robot.mouseToggle("down");
            robot.dragMouse(flipTarget.x, flipTarget.y);
            robot.mouseToggle("up");
            getCurrentGameState();
        }
            currentNode.x++;
            if(currentNode.x > max.x) {
                currentNode.x = min.x;
                currentNode.y++;
            }
            if(currentNode.y > max.y) {
                currentNode.y = min.y;
            }
        isProcessing = false;
    }
}


/**
 * Check if node was already visited for this state
 * @param {*} node 
 * @returns 
 */
function nodeVisited(node) {
    var visited = false;
    usedTargets.forEach(t => {
        if(node.x == t.x && node.y == t.y) {
            visited = true;
        }
    });
    return visited;
}

function find(x, y, color, state) {
    //console.log('find', x, y, color);
    //check flip with item above
    //--is there row above
    if(y > 2 && state[y-2][x].color == color && state[y-3][x].color == color) return {x: state[y-1][x].x, y: state[y-1][x].y}
    //--or is there same color twice on the left
    if(y > 0 && x > 1 && state[y-1][x-1].color == color && state[y-1][x-2].color == color) return {x: state[y-1][x].x, y: state[y-1][x].y}
    //--or is there same color twice on the right
    if(y > 0 && x < 6 && state[y-1][x+1].color == color && state[y-1][x+2].color == color) return {x: state[y-1][x].x, y: state[y-1][x].y}
    //--or is there same color left and right
    if(y > 0 && x > 0 && x < 7 && state[y-1][x+1].color == color && state[y-1][x-1].color == color) return {x: state[y-1][x].x, y: state[y-1][x].y}

    //check flip with item below
    //--is there row below
    if(y < 5 && state[y+2][x].color == color && state[y+3][x].color == color) return {x: state[y+1][x].x, y: state[y+1][x].y}
    //--or is there same color twice on the left
    if(y < 7 && x > 1 && state[y+1][x-1].color == color && state[y+1][x-2].color == color) return {x: state[y+1][x].x, y: state[y+1][x].y}
    //--or is there same color twice on the right
    if(y < 7 && x < 6 && state[y+1][x+1].color == color && state[y+1][x+2].color == color) return {x: state[y+1][x].x, y: state[y+1][x].y}
    //--or is there same color left and right
    if(y < 7 && x > 0 && x < 7 && state[y+1][x+1].color == color && state[y+1][x-1].color == color) return {x: state[y+1][x].x, y: state[y+1][x].y}
     
    //check flip with item on the left
    //--is there row above
    if(x > 0 && y > 1 && state[y-1][x-1].color == color && state[y-2][x-1].color == color) {return {x: state[y][x-1].x, y: state[y][x-1].y} }
    //--is there row below
    if(x > 0 && y < 6 && state[y+1][x-1].color == color && state[y+2][x-1].color == color) {return {x: state[y][x-1].x, y: state[y][x-1].y} }
    //--is there same color twice on the left
    if(x > 2 && state[y][x-2].color == color && state[y][x-3].color == color) {return {x: state[y][x-1].x, y: state[y][x-1].y} }
    //--or is there same color above and below
    if(x > 0 && y > 0 && y < 7 && state[y+1][x-1].color == color && state[y-1][x-1].color == color) {return {x: state[y][x-1].x, y: state[y][x-1].y} }

    //check flip with item on the right
    //--is there row above
    if(x < 7 && y > 1 && state[y-1][x+1].color == color && state[y-2][x+1].color == color) return {x: state[y][x+1].x, y: state[y][x+1].y}
    //--is there row below
    if(x < 7 && y < 6 && state[y+1][x+1].color == color && state[y+2][x+1].color == color) return {x: state[y][x+1].x, y: state[y][x+1].y}
    //--is there same color twice on the right
    if(x < 5 && state[y][x+2].color == color && state[y][x+3].color == color) return {x: state[y][x+1].x, y: state[y][x+1].y}
    //--or is there same color above and below
    if(x > 0 && x < 7 && y > 0 && y < 7 && state[y+1][x+1].color == color && state[y-1][x-1].color == color) return {x: state[y][x+1].x, y: state[y][x+1].y}

    return null;
}

/**
 * Get current jewel arrangement into matrix
 */
function getCurrentGameState() {
    isProcessing = true;
    const screen = robot.screen.capture();
    //box width and heigh 60 px, matrix size: 8x8, first box starts at x: 715, y:480
    //coordinates of first box upper left corner
    var x = 715
    var y = 480 
    
    var gameMatrix = [[]];
    
    var k = 0; // x of matrix
    var j = 0; // y of matrix
    
    
    for(var i = 0; i < 8*8; i++) {
        
        const boxX = x + 20 + (60 * k);
        const boxY = y + 20 + (60 * j);
        
        const color = getBaseColor(screen.colorAt( boxX,  boxY));
    
        const obj = {color: color, x: boxX, y: boxY}
    
        gameMatrix[j].push(obj);
    
        //row is full, create new row
        if(gameMatrix[j].length == 8 && gameMatrix.length < 8)  {
            gameMatrix.push([]);
            j++;
            k = 0;
        }
        else {
            k++;
        }
    }
    
    console.log("____________________");
    gameMatrix.forEach(row => {
        var data = "";
        row.forEach((item, i) => {
            data += "|" + item.color[0] + (i == row.length -1 ? "|" : "");
        });
        data += "\n-----------------"
        console.log(data);
    });
    state = gameMatrix;
    usedTargets = [];
    isProcessing = false;
}

/**
 * Convert hex to rgb
 * @param {*} hex 
 * @returns rgb as array
 */
function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
  
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16),parseInt(result[2], 16),parseInt(result[3], 16)] : null;
}

/**
 * Return closest matching base color for hex color
 * @param {*} colorCode 
 * @returns color name as string
 */
function getBaseColor(colorCode) {
    const baseColors = [
        {name: 'blue', codes: ['00329e', '26b5f2', '00649e', '00949c']},
        {name: 'white', codes: ['dce2e5', 'ffffff', 'bcdfea', 'd3d6dc']},
        {name: 'red', codes: ['e52113', 'f098a2', 'e10d22', 'f96603']},
        {name: 'green', codes: ['59ec15', '67ff6a', '17a926', '19e613']},
        {name: 'purple', codes: ['e61bac', 'fa8ecd', '9938e9', 'eb099c']},
        {name: 'orange', codes: ['ff910b', 'ff5036', 'ffff6b', 'ff7903']},
        {name: 'yellow', codes: ['faca1e', 'fbe859', 'f9c10d', 'fec522']}
    
    ];
    var bestResult = null;
    baseColors.forEach(c => {
        c.codes.forEach(code => {
            const diff = deltaE(hexToRgb(code), hexToRgb(colorCode));
            if(!bestResult || diff < bestResult.diff) { 
                bestResult = {name: c.name, diff: diff}; 
            }
        });
    });
    return bestResult.name;
}

/**
 * Calculate difference between colors  
 * <= 1.0	 Not perceptible by human eyes.
    1 - 2	 Perceptible through close observation.
    2 - 10	 Perceptible at a glance.
    11 - 49 Colors are more similar than opposite
    100	 Colors are exact opposite
 * @param {*} rgbA 
 * @param {*} rgbB 
 * @returns 
 */
function deltaE(rgbA, rgbB) {
    let labA = rgb2lab(rgbA);
    let labB = rgb2lab(rgbB);
    let deltaL = labA[0] - labB[0];
    let deltaA = labA[1] - labB[1];
    let deltaB = labA[2] - labB[2];
    let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
    let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
    let deltaC = c1 - c2;
    let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
    deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
    let sc = 1.0 + 0.045 * c1;
    let sh = 1.0 + 0.015 * c1;
    let deltaLKlsl = deltaL / (1.0);
    let deltaCkcsc = deltaC / (sc);
    let deltaHkhsh = deltaH / (sh);
    let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
    return i < 0 ? 0 : Math.sqrt(i);
  }
  
function rgb2lab(rgb){
    let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;
    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
    return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}


