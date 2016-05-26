var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();
function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();
	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	if(deltaTime > 1)
		deltaTime = 1;
		
	return deltaTime;
}
var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;
var fps = 0;
var fpsCount = 0;
var fpsTime = 0;
var keyboard = new Keyboard();
var LAYER_COUNT= level1.layers.length;
var MAP = { tw: level1.width, th: level1.height};
var TILE = level1.tilewidth;
var TILESET_TILE = level1.tilesets[0].tilewidth;
var TILESET_PADDING = level1.tilesets[0].margin;
var TILESET_SPACING = level1.tilesets[0].spacing
var TILESET_COUNT_X = level1.tilesets[0].columns;
var TILESET_COUNT_Y = level1.tilesets[0].tilecount / TILESET_COUNT_X
var viewOffset = new Vector2();
var LAYER_BACKGOUND = 0;
var LAYER_PLATFORMS = 4;
var LAYER_LADDERS = 2;
var LAYER_LAVA = 3; 
var METER = TILE;
var GRAVITY = METER * 9.8 * 6;
var MAXDX = METER * 10;
var MAXDY = METER * 15;
var ACCEL = MAXDX * 2;
var FRICTION = MAXDX * 6;
var JUMP = METER * 1500;
var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;
var gameState = STATE_SPLASH;
var score = 0;
var lives = 3;

var viewOffset = new Vector2();

var tileset = document.createElement("img");
tileset.src = level1.tilesets[0].image;
var heartImage = document.createElement("img");
heartImage.src ="heart.png";

function cellAtPixelCoord(layer, x,y)
{
if(x<0 || x>SCREEN_WIDTH || y<0)
return 1;
if(y>SCREEN_HEIGHT)
return 0;
return cellAtTileCoord(layer, p2t(x), p2t(y));
};
function cellAtTileCoord(layer, tx, ty)
{
if(tx<0 || tx>=MAP.tw || ty<0)
return 1;
if(ty>=MAP.th)
return 0;
return cells[layer][ty][tx];
};
function tileToPixel(tile)
{
return tile * TILE;
};
function pixelToTile(pixel)
{
return Math.floor(pixel/TILE);
};
function bound(value, min, max)
{
if(value < min)
return min;
if(value > max)
return max;
return value;
}

function drawMap()
{
for(var layerIdx=0; layerIdx<LAYER_COUNT; layerIdx++)
{
var idx = 0;
for( var y = 0; y < level1.layers[layerIdx].height; y++ )
{
for( var x = 0; x < level1.layers[layerIdx].width; x++ )
{
if( level1.layers[layerIdx].data[idx] != 0 )
{
var tileIndex = level1.layers[layerIdx].data[idx] - 1;
var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) * (TILESET_TILE + TILESET_SPACING);
var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) * (TILESET_TILE + TILESET_SPACING);
context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE, x*TILE, (y-1)*TILE, TILESET_TILE, TILESET_TILE);
}
idx++;
}
}
}
}

var cells = [];
function initialize() {
for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) {
cells[layerIdx] = [];
var idx = 0;
for(var y = 0; y < level1.layers[layerIdx].height; y++) {
cells[layerIdx][y] = [];
for(var x = 0; x < level1.layers[layerIdx].width; x++) {
if(level1.layers[layerIdx].data[idx] != 0) {
cells[layerIdx][y][x] = 1;
cells[layerIdx][y-1][x] = 1;
cells[layerIdx][y-1][x+1] = 1;
cells[layerIdx][y][x+1] = 1;
}
else if(cells[layerIdx][y][x] != 1) {
cells[layerIdx][y][x] = 0; 
}
idx++;
}
}
}
}

var splashTimer = 3;
function runSplash(deltaTime)
{
splashTimer -= deltaTime;
if(splashTimer <= 0)
{
gameState = STATE_GAME;
return;
}
DrawImage(context, Markiplier, SCREEN_WIDTH/2, SCREEN_HEIGHT/2, 0, 1.5, 1.5)
context.fillStyle = "#000";
context.font="38px Arial";
context.fillText("The almost infinite course (its pretty long)", 1, 240);
}

var Markiplier = document.createElement("img");
Markiplier.src = "Chuck.png";


function runGame(deltaTime)
{
	context.save();
	viewOffset.x = player.position.x - canvas.width/2;
context.translate(-viewOffset.x, 0);
drawMap();

player.update(deltaTime);

player.draw();

context.restore();
for(var i=0; i <lives; i++)
{
	context.drawImage(heartImage, 20 + ((heartImage.width+2)*i), 40);
}

	fpsTime += deltaTime;
	fpsCount++;
	if(fpsTime >= 1)
	{
		fpsTime -= 1;
		fps = fpsCount;
		fpsCount = 0;
	}
	
	context.fillStyle = "#f00";
	context.font="14px Arial";
	context.fillText("FPS: " + fps, 5, 20, 100);
}

function runGameOver(deltaTime)
{
}


var player = new Player();

function run()
{
context.fillStyle = "#ccc";
context.fillRect(0,0, canvas.width, canvas.height);

context.filllStyle = "yellow";
context.font="32px Arial";
var scoreText = "Score: " + score;
context.fillText(scoreText, SCREEN_WIDTH - 170, 35);



var deltaTime = getDeltaTime();
	
switch(gameState)
{
case STATE_SPLASH:
runSplash(deltaTime);
break;
case STATE_GAME:
runGame(deltaTime);
break;
case STATE_GAMEOVER:
runGameOver(deltaTime);
break;
}
}


initialize();

(function() {
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
  }
  
  window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);
