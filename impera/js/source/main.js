// -- toolbox
(function() {
	// contains hash that maps all keycodes to their keys
	var keymap = {
		48: 0,
		49: 1,
		50: 2,
		51: 3,
		52: 4,
		53: 5,
		54: 6,
		55: 7,
		56: 8,
		57: 9,
		65: "a",
		66: "b",
		67: "c",
		68: "d",
		69: "e",
		70: "f",
		71: "g",
		72: "h",
		73: "i",
		74: "j",
		75: "k",
		76: "l",
		77: "m",
		78: "n",
		79: "o",
		80: "p",
		81: "q",
		82: "r",
		83: "s",
		84: "t",
		85: "u",
		86: "v",
		87: "w",
		88: "x",
		89: "y",
		90: "z",
		37: "left",
		38: "up",
		39: "right",
		40: "down",
		27: "escape",
		32: "space",
		8: "backspace",
		13: "enter",
		190: ".",
		191: "/"
	};
	
	function KeyLog(which, timestamp, modifier) {
		this.which = which;
		this.timestamp = timestamp;
		this.modifier = modifier;
	}
	
	function KeyListener(triggers, func, context, modifier) {
		this.triggers = triggers;
		
		if(typeof this.triggers !== "object") {
			this.triggers = [this.triggers];
		}
		
		this.func = func;
		this.context = context;
		this.modifier = modifier;
		this.asleep = false;
	}
	
	function Input() {
		var that = this;
		
		this.keys = {};
		this.keyListeners = [];
		this.context = "titleScreen";
		
		this.init = function() {
			// bind events to correct elements
			$(document).keydown(function(e) {
				if(typeof keymap[e.which] === "undefined") {
					return;
				}
				
				var modifier;
				if(e.altKey) {
					modifier = "alt";
				}
				
				if(e.ctrlKey) {
					modifier = "ctrl";
				}
				
				if(e.shiftKey) {
					modifier = "shift";
				}
				
				var keyLog = new KeyLog(e.which, (new Date).getTime(), modifier);
				that.listen(keyLog);
				that.keys[keymap[e.which]] = keyLog;
				
				return !(e.keyCode == 32);
			}).keyup(function(e) {
				delete that.keys[keymap[e.which]];
			});
		};
		
		this.createKeyListener = function(triggers, func, context, modifier) {
			if(!(context instanceof Array)) {
				context = [context];
			}
			
			var l = new KeyListener(triggers, func, context, modifier)
			this.keyListeners.push(l);
			return l;
		}
		
		this.destroyKeyListener = function(keyListener) {
			for(var i = 0; i<this.keyListeners.length; i++) {
				if(this.keyListeners[i] === keyListener) {
					this.keyListeners.splice(i, 1);
				}
			}
		}
		
		this.listen = function(keyLog) {
			for(var i = 0, len = this.keyListeners.length; i<len; i++) {
				var listener = this.keyListeners[i];
				
				if(listener === undefined) {
					continue;
				}

				for(var j = 0; j<listener.triggers.length; j++) {
					if(listener.triggers[j] == keymap[keyLog.which] && 
						listener.modifier == keyLog.modifier && !listener.asleep &&
						listener.context.indexOf(this.context) > -1) {
						listener.func.call(listener, keymap[keyLog.which]);
					}
				}
			}
		}
		
		this.init();
	}
	
	window.Input = Input;
})();

// http://stackoverflow.com/questions/210717/using-jquery-to-center-a-div-on-the-screen
jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + 
                                                $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + 
                                                $(window).scrollLeft()) + "px");
    return this;
}

// http://stackoverflow.com/questions/6466135/adding-extra-zeros-in-front-of-a-number-using-jquery
function pad(str, max) {
	str = str.toString();
	return str.length < max ? pad("0" + str, max) : str;
}

// http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// -- settings
var mapSize = {
	x: 30,
	y: 22
};

var tileSize = {
	x: 18,
	y: 28
}

var skull 	=  ["   _____   ", 
				"  /     \\ ",
				"  |() ()| 	",
				"  \\  ^  / ",
 				"   |||||   ",
  				"   |||||   "];

var mainMenu = [	"Welcome to {Impera}!",
					"           {------}",
					"",
					"Your supposed allies and your",
					"mortal enemy, the {Demon Mage},",
					"have conspired together to",
					"bring about your demise,",
					"stripping you of your powers.",
					"",
					"Your most trusted friends led",
					"you and betrayed you, handing",
					"you over to Impera. It was in",
					"exchange for peace, they said,",
					"and apologized. You rotted in",
					"Impera's dungeons; they were",
					"hailed as heroes.",
					"",
					"But now, you find yourself in",
					"{his} arena. Survive. Regain",
					"your freedom. And avenge your-",
					"self...",
					"",
					"   [spacebar to continue]"]

var helpScreen = [	"Controls:",
					"- Arrow keys, Vi keys, or ",
					"  numpad to move orthogonally",
					"- Spacebar to activate cursor",
					"- When cursor is active, look",
					"  at monsters or press space",
					"  to {place a wall}",
					"- Shift-R to restart",	
					"",
					"Attacking:",
					"- You have {1 hitpoint}",
					"- Bump to attack, but don't",
					"  leave yourself vulnerable",
					"  on the enemy's turn",
					"",
					"Tips:",
					"- Maintaining walls takes",
					"  concentration, slowing you",
					"  you down; watch your speed",
					"- {Inspect monster abilities}",
					"",
					"    [space to continue]"]

var leftArrow = [	"  __ ",
					" /  \\",
					" |<-|",
				    " \\__/"]
				    
var rightArrow = [	"  __ ",
					" /  \\",
					" |->|",
				    " \\__/"];

var characterOffsetY = 4;
var is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
if(is_firefox) {
	characterOffsetY = 2
}

// this variable holds an array of monsters in the order in which they appear in the gameplay
var levels = ["walker", "cardinalSeeker", "diagonalSeeker", "magus", "shade", "coward", "smart", "doppleganger"];

// -- variables
var level = 1;
var wallCost = 2;
var maxWalls = 1;

// -- game modules
var game = {};

// display
game.display = {};
game.display.clearTile = function(x, y) {
	game.display.context.fillStyle = "black";
	game.display.context.fillRect(x * tileSize.x - 3, y * tileSize.y - characterOffsetY, 
		tileSize.x, tileSize.y);
}

game.display.clearRect = function(x1, y1, x2, y2) {
	for(var x = x1; x < x2; x++) {
		for(var y = y1; y < y2; y++) {
			game.display.drawTile(x, y, " ");
		}
	}
}

game.display.drawTile = function(x, y, character, color, backgroundColor, alpha) {
	character = character || "?";
	
	alpha = (typeof alpha == "undefined") ? 1 : alpha;
	
	color = color || {r: 255, g: 255, b: 255};
	backgroundColor = backgroundColor || {r: 0, g: 0, b: 0};
	
	game.display.clearTile(x, y);
	
	if(typeof backgroundColor.r !== "undefined") {
		backgroundColor = colorString(backgroundColor, alpha);
	}
	
	game.display.context.fillStyle = backgroundColor;
	game.display.context.fillRect(x * tileSize.x - 3, y * tileSize.y - characterOffsetY, 
		tileSize.x, tileSize.y);
	
	if(color.r) {
		game.display.context.fillStyle = colorString(color, alpha);
	} else {
		game.display.context.fillStyle = color;
	}
	
	//game.display.context.fillText(character, (x * tileSize.x) + 3, (y * tileSize.y) + 2);
	game.display.context.fillText(character, (x * tileSize.x), (y * tileSize.y));
}

game.display.draw = function(tile, y) {	
	if(typeof y !== "undefined") {
		tile = game.map.tile(tile, y);
	}
	
	var character = tile.character;
	var color = tile.color;
	var backgroundColor = tile.backgroundColor;
	var lightLevel;
	
	backgroundColor.r = Math.min(255, Math.round(backgroundColor.r + tile.bloodLevel * 5));
	var lightInfo = game.lighting.getLight(tile, color);
	
	color = (!tile.unlit) ? lightInfo.color : tile.color;
	
	for(var i = 0; i<game.actors.length; i++) {
		if(game.actors[i].x == tile.x && game.actors[i].y == tile.y) {
			character = game.actors[i].character;
			color = game.actors[i].color;
		}
	}
	
	game.display.drawTile(tile.x, tile.y, character, color, backgroundColor, lightInfo.strength);
}

game.display.drawCursor = function(x, y) {
	var tile = game.map.data[x][y];
	
	var character = tile.character;
	var color = tile.color;
	var backgroundColor = "gray";
		
	for(var i = 0; i<game.actors.length; i++) {
		if(game.actors[i].x == tile.x && game.actors[i].y == tile.y) {
			character = game.actors[i].character;
			color = game.actors[i].color;
		}
	}
		
	game.display.drawTile(tile.x, tile.y, character, color, backgroundColor);
}

game.display.renderRect = function(x1, y1, x2, y2) {
	for(var x = x1; x < x2; x++) {
		for(var y = y1; y < y2; y++) {
			game.display.draw(x, y);
		}
	}
}

game.display.drawString = function(x, y, str) {
	var cols = ["white", "red"],
		colIndex = 0;
		//i = str.length;
	
	if(str[0] == "{") {
		colIndex++;
		str = str.substr(1);
	}
	
	for(var i = 0; i<str.length; i++) {
		if(str[i+1] == "{") {
			colIndex++;
			str = str.substr(0, i+1) + str.substr(i+2);
		} 
		
		game.display.drawTile(x + i, y, str[i], cols[colIndex]);
		
		if(str[i+1] == "}") {
			str = str.substr(0, i+1) + str.substr(i+2);
			colIndex--;
		}
	}
}

game.display.drawText = function(x, y, text) {
	for(var i = 0; i<text.length; i++) {
		game.display.drawString(x, y + i, text[i]);
	}
}

game.display.updateStatus = function() {
	var statusString = "Walls: " + pad(maxWalls - game.wallCount, 2) + " | Lvl: " + pad(level, 2) + 
		" | Spd: " + pad(game.player.speed, 3);
	game.display.drawString(0, mapSize.y, statusString);
}

game.display.clearLook = function() {
	game.display.renderRect(0, 1, mapSize.x, 5);
}

game.display.updateLook = function() {
	var x = game.cursorPosition.x,
		y = game.cursorPosition.y;
	
	if(typeof game.display.lookTarget !== "undefined") {
		game.display.clearLook();
		game.display.drawCursor(game.cursorPosition.x, game.cursorPosition.y);
		game.display.lookTarget = undefined;
	}
		
	for(var i = 0; i<game.actors.length; i++) {
		if(game.actors[i].x == x && game.actors[i].y == y) {
			if(game.actors[i].type === "player") {
				continue;
			}
			
			game.display.lookTarget = game.actors[i];
			break;
		}
	}
	
	if(game.display.lookTarget !== undefined) {
		// we need to draw a look box
		for(var x = 1; x<mapSize.x - 1;x++) {
			for(var y = 1; y<5; y++) {
				var character = " ";
				if(y == 4) {
					character = "-";
				}
				
				game.display.drawTile(x, y, character, "white", "black");
			}
		}
		
		// draw bottom box corners
		game.display.drawTile(0, 4, String.fromCharCode(192));
		game.display.drawTile(mapSize.x - 1, 4, String.fromCharCode(217));
		
		// draw monster character and name centered
		if(game.display.lookTarget.character == "%") {
			if(game.display.lookTarget.name.indexOf("dead") < 0) {
				game.display.lookTarget.name += " (dead)";
			}
		}
		
		var targ = game.display.lookTarget,
			w = targ.name.length + 2,
			center = Math.floor(mapSize.x / 2 - (w / 2));
		
		game.display.drawTile(center, 1, targ.character, targ.color);
		game.display.drawString(center + 2, 1, targ.name);
		
		center = Math.floor((mapSize.x / 2) - targ.description.length / 2);
		game.display.drawString(center, 3, targ.description);
	}
}
// map
game.map = {};
game.map.Tile = function(x, y, type) {
	this.x = x;
	this.y = y;
	this.color = {r: 255, g: 255, b: 255};
	this.backgroundColor = undefined;
	this.blocksSight = false;
	this.lightLevel = .2;
	this.lighting = [];
	this.bloodLevel = 0; // max 5
	this.type = type;
	
	this.setType = function(type) {
		var that = this;
		
		this.type = type;
		
		if(this.backgroundColor !== undefined) {
			var col = this.backgroundColor;
		}
		
		switch(this.type) {
			case "floor":
				this.character = ".";
				this.walkable = true;
				var col = getRandomInt(20, 30);
				
				this.blocksSight = false;
				this.color = {r: 255, g: 255, b: 255}
				this.backgroundColor = {r: col, g: col, b: col};
				break;
				
			case "wall":
				this.character = "#";
				this.backgroundColor = col || {r: 0, g: 0, b: 0};
				this.walkable = false;
				this.blocksSight = true;
				break;
				
			case "permawall":
				this.character = "#";
				this.walkable = false;
				this.color = "white";
				this.backgroundColor = {r: 0, g: 0, b: 0};
				this.blocksSight = true;
				this.unlit = true;
				break;
				
			case "lava":
				this.character = String.fromCharCode(247);
				this.walkable = false;
				this.color = {r: 255, g: 255, b: 255};
				this.lavaTemperature = getRandomInt(3, 6);
				this.backgroundColor = {r: 255, g: this.lavaTemperature  * 19, b: 0};
				
			default:
				break;
		}
		
		game.display.draw(this);
	}
	
	this.lightLevel = function() {
		var strength = 0;
		
		for(var i = 0; i<this.lighting.length; i++) {
			if(this.lighting[i].strength > strength) {
				strength = this.lighting[i].strength;
			}
		}
		
		return strength;
	}
	
	this.init = function() {
		this.setType(this.type);
	}
	
	this.init();
}

game.map.tile = function(x, y) {
	if(x.x !== undefined && x.y !== undefined) {
		return game.map.data[x.x][x.y];
	} else {
		return game.map.data[x][y];
	}
}

game.map.generate = function() {
	game.bloodTiles = [];
	
	// initialize the map
	game.walls = [];
	
	Math.seedrandom();
	
	// create new tile data
	while(game.lavaTiles.length < 30) {
		var offset = getRandomInt(0, 10000000);
		
		game.map.data = [];
		game.lavaTiles = [];
		
		for(var x = 0; x<mapSize.x; x++) {
			game.map.data[x] = [];
			
			for(var y = 0; y<mapSize.y; y++) {
				var tileType = "floor";
				
				if(x > 1 && x < mapSize.x - 2 && y > 1 && y < mapSize.y - 2) {
					if(game.noise.noise((x + offset) / 12, (y + offset) / 12) > .65) {
						tileType = "lava";
					}
				}
				
				var t = new game.map.Tile(x, y, tileType);
				game.map.data[x][y] = t;
				game.display.draw(t);
				
				if(tileType == "lava") {
					game.lavaTiles.push(t);
				}
			}
		}
	}
	
	// when the lava is finalized, add lighting to tiles with floor neighbors
	for(var i = 0; i<game.lavaTiles.length; i++) {
		var xA = game.AI.pather.x_array
			yA = game.AI.pather.y_array,
			t = game.lavaTiles[i],
			canLight = false;
		
		for(var j = 0; j<8; j++) {
			n = game.map.tile(t.x + xA[j], t.y + yA[j]);
			if(n.type == "floor" || n.type == "permawall") {
				canLight = true;
			}
		}
		
		if(canLight) {
			t.lightSource = game.lighting.addLightSource(t, 
				{r: 255, g: 60, b: 0}, Math.round(t.lavaTemperature / 1.5));
		}
	}
	
	// -- create walls
	// left wall
	for(var y = 0; y<mapSize.y; y++) {
		game.map.data[0][y].setType("permawall");
		game.map.data[0][y].character = String.fromCharCode(179);
		game.display.draw(game.map.data[0][y]);
	}
	
	// right permawall
	for(var y = 0; y<mapSize.y; y++) {
		game.map.data[mapSize.x - 1][y].setType("permawall");
		game.map.data[mapSize.x - 1][y].character = String.fromCharCode(179);
		game.display.draw(game.map.data[mapSize.x - 1][y]);
	}
	
	// top permawall
	for(var x = 0; x<mapSize.x; x++) {
		game.map.data[x][0].setType("permawall");
		game.map.data[x][0].character = "-";
		game.display.draw(game.map.data[x][0]);
	}
	
	// bottom permawall
	for(var x = 0; x<mapSize.x; x++) {
		game.map.data[x][mapSize.y - 1].setType("permawall");
		game.map.data[x][mapSize.y - 1].character = "-";
		game.display.draw(game.map.data[x][mapSize.y - 1]);
	}
	
	// upper left corner
	game.map.data[0][0].character = String.fromCharCode(218);
	game.display.draw(game.map.data[0][0]);
	
	// upper right corner
	game.map.data[mapSize.x - 1][0].character = String.fromCharCode(191);
	game.display.draw(game.map.data[mapSize.x - 1][0]);
	
	// lower left corner
	game.map.data[0][mapSize.y - 1].character = String.fromCharCode(192);
	game.display.draw(game.map.data[0][mapSize.y - 1]);
	
	// lower right corner
	game.map.data[mapSize.x - 1][mapSize.y - 1].character = String.fromCharCode(217);
	game.display.draw(game.map.data[mapSize.x - 1][mapSize.y - 1]);
}

// wall placement
game.map.placeWall = function() {
	var pos = game.cursorPosition;
	var t = game.map.tile(pos);
	
	if(game.map.tile(pos).type === "permawall") {
		return false;
	}
	
	// make sure there isn't a monster there first
	for(var i = 0; i<game.actors.length; i++) {
		// there's something here, we can't put down a wall
		if(game.actors[i].x == pos.x && game.actors[i].y == pos.y) {
			return false;
		}
	}

	if(t.type == "floor") {
		if(game.wallCount < maxWalls) {
			t.setType("wall");
			game.wallCount++;
			game.player.speed = game.player.maxSpeed - game.wallCount * wallCost;
			
			var blocked = 0;
			
			game.player.surrounded();
			
			game.display.updateStatus();
			
			return true;
		} else {
			return false;
		}
	} else if(t.type == "wall") {
		return false;
	}
	
	game.display.updateStatus();
	return true;
}

game.map.tileBlocked = function(x, y) {
	if(!game.map.tile(x, y).walkable) {
		return true;
	}
	
	for(var i = 0; i<game.actors.length; i++) {
		// check if the actor is dead
		if(game.actors[i].x == x && game.actors[i].y == y && game.actors[i].dead == true) {
			return true;
		}
	}
	
	return false;
}

game.map.randomTile = function() {
	var x = getRandomInt(2, mapSize.x - 2);
	var y = getRandomInt(2, mapSize.y - 2);
	
	while(true){ 
		x = getRandomInt(2, mapSize.x - 2);
		y = getRandomInt(2, mapSize.y - 2);
		
		var canBreak = game.map.tile(x, y).walkable;
		
		for(var i = 0; i<game.actors.length; i++) {
			if(game.actors[i].x == x && game.actors[i].y == y) {
				canBreak = false;
			}
		}
		
		if(canBreak) {
			break;
		}
	}
	
	return game.map.data[x][y];
}

// actor
game.Actor = function(x, y, type) {	
	this.x = x;
	this.y = y;
	
	this.type = type;
	
	this.speed = 100;
	this.energy = 0;
	
	this.character = "?";
	
	this.move = function(x, y) {
		var dx = this.x + x;
		var dy = this.y + y;
		
		if(game.map.data[dx][dy].walkable == false) {
			return false;
		}
		
		for(var i = 0; i<game.actors.length; i++) {
			var a = game.actors[i];
			if(a.x == dx && a.y == dy) {
				if(a.dead == true) {
					return false;
				}
				
				if(a.type == "player") {
					game.over();
					return true;
				} else if (this.type == "player") {
					a.die();
					return true;
				} else {
					return false;
				}
			}
		}
		
		if(game.ended) {
			return;
		}
		
		this.x = dx;
		this.y = dy;
		
		var oldTile = this.tile;
		this.tile = game.map.data[this.x][this.y];
		
		game.display.draw(oldTile);
		game.display.draw(this.tile);
		
		return true;
	}
	
	this.moveTo = function(x, y) {
		if(game.map.data[x][y].walkable == false) {
			return false;
		}
		
		for(var i = 0; i<game.actors.length; i++) {
			var a = game.actors[i];
			if(a.x == x && a.y == y) {
				if(a.dead == true) {
					return false;
				}
				
				if(a.type == "player") {
					game.over();
					return true;
				} else if (this.type == "player") {
					a.die();
					return true;
				} else {
					return false;
				}
			}
		}
		
		if(game.ended) {
			return;
		}
		
		this.x = x;
		this.y = y;
		
		var oldTile = this.tile;
		this.tile = game.map.data[this.x][this.y];
		
		game.display.draw(oldTile);
		game.display.draw(this.tile);
		
		return true;
	}
	
	this.takeTurn = function () {
		this.energy += this.speed;
		
		while(this.energy > 0 && this.type !== "player") {
			if(this.ai) {
				this.ai.go();
				this.energy -= 100;
			} else {
				break;
			}
		}
	}
	
	this.die = function() {
		game.player.surrounded();
		if(this.dead) {
			return;
		}
		
		this.dead = true;
		this.character = "%";
		this.color = {r: 200, g: 0, b: 0};
		this.speed = 0;
		
		// check to see how many actors have been killed now
		deathToll = 0;
		for(var i = 0; i<game.actors.length; i++ ){
			if(game.actors[i].dead === true) {
				deathToll++;
			}
		}
		
		if(this.lightSource) {
			this.lightSource.destroy();
		}
		
		// all the actors besides the player are dead
		if(deathToll === game.actors.length - 1) {
			if(level < 8) {
				game.nextLevel();
			} else {
				game.win();
			}
			
			return;
		}
		
		if(this.type == "shade") {
			for(var i = 0; i<game.actors.length; i++) {
				if(game.actors[i] == this) {
					game.actors.splice(i, 1);
				}
			}
		} else {
			this.tile.bloodLevel = 16;
			game.bloodTiles.push(this.tile);
			game.display.draw(this.tile);
		}
	}
	
	this.init = function() {
		this.tile = game.map.data[this.x][this.y];
		
		var that = this;
		switch(type) {
			case "player":
				this.character = "@";
				this.color = {r: 255, g: 255, b: 255};
				break;
				
			case "walker":
				this.character = "K";
				this.name = "Fool";
				this.description = "Attacks at random."
				this.color = {r: 255, g: 255, b: 255};
				this.ai = new game.AI.walker(this);
				break;
				
			case "cardinalSeeker":
				this.character = "o";
				this.name = "Bladebound";
				this.description = "Attacks orthogonally.";
				this.color = "green";
				this.ai = new game.AI.cardinalSeeker(this);
				break;
			
			case "diagonalSeeker":
				this.character = "k";
				this.name = "Blademaster";
				this.description = "Attacks diagonally."
				this.color = "yellow";
				this.ai = new game.AI.diagonalSeeker(this);
				break;
				
			case "magus":
				this.character = "m";
				this.name = "Magus";
				this.description = "Conjures bolts. No melee.";
				this.lastBlink = 0;
				this.ai = new game.AI.magus(this);
				
				var color = [	{r: 255, g: 255, b: 0}, 
								{r: 10, g: 10, b: 255}, 
								{r: 255, g: 0, b: 0},
								{r: 255, g: 0, b: 255}];
				var classes = ["Lightning", "Water", "Fire", "War"];
				
				var t = getRandomInt(0, 3);
				
				this.color = color[t];
								
				this.name = classes[t] + " " + this.name;
				this.lightSource = game.lighting.addLightSource(this, color[t], 5);
				break;
				
			case "coward":
				this.character = "c";
				this.name = "Craven";
				this.description = "Runs away. Don't corner it.";
				this.color = "white";
				this.ai = new game.AI.coward(this);
				break;
				
			case "smart":
				this.character = "q";
				this.name = "Battlemonk";
				this.description = "Attacks with caution.";
				this.color = {r: 255, g: 0, b: 255};
				this.ai = new game.AI.smart(this);
				break;
			
			case "doppleganger":
				this.character = "@";
				this.name = "Doppleganger",
				this.description = "It's... you? Places walls.";
				this.color = {r: 150, g: 150, b: 150};
				this.ai = new game.AI.doppleganger(this);
				break;
				
			case "shade":
				this.character = "&";
				this.name = "Shade";
				this.description = "It awaits you in the dark.";
				this.color = {r: 105, g: 105, b: 105};
				this.ai = new game.AI.shade(this);
				break;
				
			case "demon mage":
				this.character = "&";
				this.name = "Impera, the Demon Mage";
				this.description = "Breathes hellfire. Melees.";
				this.color = "red"; // shifting colors 
				this.ai = new game.AI.demonMage(this);
				break;
				
			default:
				break;
		}
		game.display.draw(this.tile);
	}
}

// game
game.generateLevel = function() {
	Math.seedrandom();
	
	// get rid of all actors
	game.actors = [game.player];
	
	// remove blood
	for(var i = 0; i<game.bloodTiles.length; i++) {
		game.bloodTiles[i].bloodLevel = 0;
	}
	
	// drop the blood tiles
	game.bloodTiles = [];
	
	// remove lava
	game.lavaTiles = [];
	
	// get rid of light sources
	game.lighting.reset();
	
	// generate a new map
	game.map.generate();
	
	game.player.lightSource = game.lighting.addLightSource(game.player, {r: 255, g: 255, b: 255}, 7);
	
	// reset player speed
	game.wallCount = 0;
	game.player.speed = game.player.maxSpeed - game.wallCount * wallCost;
	
	var l = Math.max(Math.min(10, level + 3), 0);
	
	// place grunts
	for(var i = 0; i < (l * .25); i++) {
		var grunt = shuffle(["cardinalSeeker", "diagonalSeeker", "diagonalSeeker", "coward", "magus", "magus"])[1];
		var t = game.map.randomTile();
		var m = new game.Actor(t.x, t.y, grunt);
		game.actors.push(m);
		m.init();
	}
	
	// place specials
	for(var i = 0; i < (l * .75); i++) {		
		// select a special monster type based on monster level and game level
		var beginLevel = level - 1,
			mType;
		
		while(Math.random() > .5) {
			beginLevel--;
		}
		
		beginLevel = Math.min(levels.length, Math.max(0, beginLevel));
		
		for(var j = 0; j<levels.length; j++) {
			if(Math.abs(((j)+1) - beginLevel) <= 1) {
				mType = levels[j];
			}
		}
		
		var t = game.map.randomTile();
		var m = new game.Actor(t.x, t.y, mType);
		game.actors.push(m);
		m.init();
	}
	
	if(level == 8) {
		// generate the Demon Mage
		var pos = game.map.randomTile();
		var m = new game.Actor(pos.x, pos.y, "demon mage");
		m.lightSource = game.lighting.addLightSource(m, {r: 255, g: 0, b: 0}, 10);
		game.actors.push(m);
		m.init();
	}
	
	// reposition player
	var t = game.map.randomTile();
	game.player.x = t.x;
	game.player.y = t.y;
	
	// and finally, update lighting
	game.lighting.update();
}

game.lighting = function() {
	this.algorithm = new Light();
	this.lightSources = [];
	
	this.LightSource = function(owner, color, strength) {
		this.owner = owner;
		this.color = color;
		this.strength = strength;
		
		this.destroy = function() {
			for(var i = 0; i<game.lighting.lightSources.length; i++) {
				if(game.lighting.lightSources[i] == this) {
					game.lighting.lightSources.splice(i, 1);
				}
			}
			
			game.lighting.update();
		}
	}
	
	this.LightInteraction = function(color, strength) {
		this.color = color;
		this.strength = strength;
	}
	
	this.addLightSource = function(owner, color, strength) {
		var lightSource = new this.LightSource(owner, color, strength)
		this.lightSources.push(lightSource);
		
		return lightSource;
	}
	
	this.getLight = function(tile, color) {
		// get the tile and its lighting
		var lights = tile.lighting;
		
		// if there are no lights shining on this tile, return
		if(tile.lighting.length == 0) {
			return {color: color || tile.backgroundColor, strength: .2};
		}
		
		// assume one light for testing
		var strength = 0, // pick the strongest light ray to render at
			colors = [{color: color, strength: 1}], // find all colors acting on tile
			col, canAdd;
			
		for(var i = 0; i<lights.length; i++) {
			if(lights[i].strength > strength) {
				strength = lights[i].strength;
			}
			
			canAdd = true;
			col = lights[i].color;
			for(var j = 0; j<colors.length; j++) {
				if(colors[j].r == col.r && colors[j].g == col.g && colors[j].b == col.b) {
					canAdd = false;
				}
			}
			
			if(canAdd) {
				colors.push({color: col, strength: lights[i].strength * 2});
			}
		}
		
		// now that we've collected all the colors acting on this tile, we can average them
		color = colors[0];
		if(colors.length > 1) {
			for(i = 0; i<colors.length; i++) {
				color = blendColors(colors);
			}
		}
		
		return {color: color, strength: strength};
	}
	
	// remove all light and light sources from the map
	this.clear = function() {
		for(var x = 1; x<mapSize.x - 1; x++) {
			for(var y = 1; y<mapSize.y - 1; y++) {
				game.map.tile(x, y).lighting = [];
			}
		}
	}
	
	this.flush = function() {
		this.lightSources = [];
	}
	
	// update all the lights on the map
	this.update = function() {
		this.clear();
		
		for(var i = 0; i<this.lightSources.length; i++) {
			var ls = this.lightSources[i];
			
			if(ls.owner.shadeTouch !== undefined) {
				ls.strength -= ls.owner.shadeTouch;
			}
			
			this.algorithm.calculate(ls);
		}
		
		// finally, render the whole map again now that lights have changed
		if(!game.ended) {
			game.display.renderRect(1, 1, mapSize.x - 1, mapSize.y - 1);
		}
	}
	
	// reset the lights for when the level changes
	this.reset = function() {
		this.clear();
		this.lightSources = [];
	}
}

game.update = function() {
	game.player.lightSource.strength = 7;
	game.player.shadeTouch = 0;
	
	if(game.input.context == "nextLevelMode" || game.input.context == "won") {
		return;
	}
	
	// update blood tiles
	for(i = game.bloodTiles.length - 1; i>=0; i--) {
		var t = game.bloodTiles[i];
		
		var x_array = [0, -1, -1, -1, 0, 1, 1, 1];
		var y_array = [1, 1, 0, -1, -1, -1, 0, 1];
		
		var bloodSpread = t.bloodLevel / 8;
		if(bloodSpread < .25) {
			t.bloodLevel = 0;
			game.bloodTiles.splice(i, 1);
			continue;
		}
		
		// build a list of neighbors
		var neighbors = [],
			neighbor, dx, dy;
			
		for(var j = 0; j<8; j++) {
			dx = t.x + x_array[j],
			dy = t.y + y_array[j];
			
			if(dx < 1 || dx > mapSize.x - 1 || dy < 1 || dy > mapSize.y - 1) {
				continue;
			}
			
			neighbor = game.map.tile(dx, dy);
			
			if(neighbor.bloodLevel >= t.bloodLevel || !neighbor.walkable || neighbor.type == "lava") {
				continue;
			}
			
			if(neighbor.bloodLevel == 0) {
				game.bloodTiles.push(neighbor);
			}
			
			t.bloodLevel -= bloodSpread;
			neighbor.bloodLevel += bloodSpread;
			
			if(t.bloodLevel <= 0) {
				game.bloodTiles.splice(i, 1);
			}
			
			game.display.draw(neighbor);
		}
		
		game.display.draw(t);
	}
	
	// animate lava tiles
	for(var i = 0; i<game.lavaTiles.length; i++) {
		var t = game.lavaTiles[i];
		
		if(t.lightSource == undefined) {
			continue;
		}
		
		t.lavaTemperature = getRandomInt(3, 6);
		t.backgroundColor.g = t.lavaTemperature * 19;
		t.lightSource.strength = Math.round(t.lavaTemperature / 1.5);
		game.display.draw(t);
	}
	
	// update shade influence on player
	while(game.player.energy < 100 && !game.ended) {
		// update actors
		for(var i = 0; i<game.actors.length; i++) {
			var actor = game.actors[i];
			
			if(actor.ai && actor.ai.surrounded()) {
				actor.die();
			}
			
			actor.takeTurn();
			
			if(actor.type == "shade") {
				var dx = game.player.x - actor.x,
					dy = game.player.y - actor.y,
					distance = Math.abs(Math.sqrt((dx * dx) + (dy * dy)));
					
				var shadeTouch = 7 - Math.round(distance);
				game.player.shadeTouch = Math.max(game.player.shadeTouch, shadeTouch);
			}
		}
	}
	
	game.lighting.update();
	game.player.energy -= 100;
}

game.init = function() {
	// get canvas
	game.display.canvas = document.getElementById("map");
	game.display.context = game.display.canvas.getContext("2d");
	
	// size canvas properly, not with CSS to avoid scaling the output
	game.display.canvas.width = mapSize.x * tileSize.x;
	game.display.canvas.height = (mapSize.y + 1) * tileSize.y;
	
	$(window).resize(function() {
		$("#map").center();
	});
	
	$("#map").center();
	
	// set render font settings
	game.display.context.font = "20pt VideoTerminalScreen";
	game.display.context.textAlign = "left";
	game.display.context.textBaseline = "top";
	
	// input handling
	game.input = new Input();
	
	// initiate perlin noise
	game.noise = new SimplexNoise();
	
	// init lighting
	game.lighting = new game.lighting();
	
	// initialize AI
	game.AI.init();
	
	// initialize actors
	game.actors = [];
	
	// intialize blood
	game.bloodTiles = [];
	
	// initialize lava
	game.lavaTiles = [];
	
	// create the player
	game.player = new game.Actor(5, 5, "player");
	game.actors.push(game.player);
	game.player.speed = 100;
	game.player.shadeTouch = 0;
	game.player.maxSpeed = 100;
	game.player.energy = 95;
	game.player.surrounded = function() {
		var blocked = 0;
		if(game.map.tileBlocked(game.player.x - 1, game.player.y)) {
			blocked++;
		}
		
		if(game.map.tileBlocked(game.player.x + 1, game.player.y)) {
			blocked++;
		}
		
		if(game.map.tileBlocked(game.player.x, game.player.y + 1)) {
			blocked++;
		}
		
		if(game.map.tileBlocked(game.player.x, game.player.y - 1)) {
			blocked++;
		}
		
		// oh dear, the player is surrounded, special death for him
		if(blocked == 4) {
			game.over(false, "surrounded");
		}
		
		game.display.updateStatus();
	}
	
	// display title screen
	var dh=	[	"    /(   )*           ",
				"    * *_/ /   , /* ,  ",
				"    /_   _*  /| || |* ",
				"   | *> </ | |*_||_/| ",
				"   (_     _)  *____/  ",
				" /`*|vvvvv|/`* _*/_   ",
				" *  *_____/  /  ()    ",
				" /*   )=(   /*  ()    ",
				"/  `-.*=/.-`  * ()    "];

	for(var i = 0; i<dh.length; i++) {
		dh[i] = dh[i].replace(/\*/g, "\\");
	}
					
	var impera = "{Impera}";
	var x = Math.round(mapSize.x / 2 - (impera.length-2) / 2);
	game.display.drawString(x, 0, impera);
	
	var by = "by Elliot Bonneville";
	x = Math.round(mapSize.x / 2 - (by.length) / 2);
	game.display.drawString(x, 2, by);
	
	x = Math.round(mapSize.x / 2 - (dh[0].length / 2))
	game.display.drawText(x, 5, dh);
	
	txt = "[spacebar to continue]"
	x = Math.round(mapSize.x / 2 - (txt.length) / 2);
	game.display.drawString(x, 18, txt);
	
	txt = "? for help in-game"
	x = Math.round(mapSize.x / 2 - (txt.length) / 2);
	game.display.drawString(x, 16, txt);
	
	game.input.createKeyListener("space", function() {
		// display main menu
		game.display.clearRect(0, 0, mapSize.x, mapSize.y);
		
		for(var i = 0; i<mainMenu.length; i++) {
			game.display.drawString(0, i, mainMenu[i]);
		}
		
		game.input.destroyKeyListener(this);
		game.input.context = "mainMenu";
	}, "titleScreen");
	
	// main menu listeners
	game.input.createKeyListener("space", function() {
		// initalize the map
		game.map.generate();
		game.wallCount = 0;
		
		game.display.updateStatus();
		game.generateLevel()
		
		game.player.init();
		
		game.input.context = "action";
		game.input.destroyKeyListener(this);
	}, "mainMenu");
	
	// player movement listeners
	game.input.createKeyListener(["up", "k", 8], function() {
		if(game.player.move(0, -1)) {
			game.update();
		}
	}, "action");
	
	game.input.createKeyListener(["down", "j", 2], function() {
		if(game.player.move(0, 1)) {
			game.update();
		}
	}, "action");
	
	game.input.createKeyListener(["right", "l", 6], function() {
		if(game.player.move(1, 0)) {
			game.update();
		}
	}, "action");
	
	game.input.createKeyListener(["left", "h", 4], function() {
		if(game.player.move(-1, 0)) {
			game.update();
		}
	}, "action");
	
	game.input.createKeyListener("space", function() {
		game.input.context = "wallMode";
		
		game.cursorPosition = {
			x: game.player.x,
			y: game.player.y
		}
		
		game.display.drawCursor(game.cursorPosition.x, game.cursorPosition.y);
		
		game.wallCreationBinding = game.input.createKeyListener("space", function() {
			if(game.map.placeWall()) {
				if(game.input.context == "gameOver") {
					return;
				}
				
				game.input.context = "action";
				game.input.destroyKeyListener(this);
				//game.update();
			} else {
				game.input.context = "action";
				game.display.draw(game.map.tile(game.cursorPosition));
				game.input.destroyKeyListener(this);
				game.display.clearLook();
			}
		}, "wallMode");
	}, "action");
	
	// wall placement key listeners
	game.input.createKeyListener(["up", "k", 8], function() {
		if(game.cursorPosition.y == 0) {
			return;
		}
		
		game.display.draw(game.map.tile(game.cursorPosition));
		game.cursorPosition.y -= 1;
		game.display.drawCursor(game.cursorPosition.x, game.cursorPosition.y);
		game.display.updateLook();
	}, "wallMode");
	
	game.input.createKeyListener(["down", "j", 2], function() {
		if(game.cursorPosition.y == mapSize.y - 1) {
			return;
		}
		
		game.display.draw(game.map.tile(game.cursorPosition));
		game.cursorPosition.y++;
		game.display.drawCursor(game.cursorPosition.x, game.cursorPosition.y);
		game.display.updateLook();
	}, "wallMode");
	
	game.input.createKeyListener(["right", "l", 6], function() {
		if(game.cursorPosition.x == mapSize.x - 1) {
			return;
		}
		
		game.display.draw(game.map.tile(game.cursorPosition));
		game.cursorPosition.x++;
		game.display.drawCursor(game.cursorPosition.x, game.cursorPosition.y);
		game.display.updateLook();
	}, "wallMode");
	
	game.input.createKeyListener(["left", "h", 4], function() {
		if(game.cursorPosition.x == 0) {
			return;
		}
		
		game.display.draw(game.map.tile(game.cursorPosition));
		game.cursorPosition.x--;
		game.display.drawCursor(game.cursorPosition.x, game.cursorPosition.y);
		game.display.updateLook();
	}, "wallMode");
	
	game.input.createKeyListener("escape", function() {
		game.input.context = "action";
		game.input.destroyKeyListener(game.wallCreationBinding);
		game.display.draw(game.map.tile(game.cursorPosition));
		game.display.clearLook();			
	}, "wallMode");
	
	game.input.createKeyListener("r", function() {
		game.restart();
	}, "action", "shift");
	
	game.input.createKeyListener("/", function() {
		game.input.context = "help";

		for(var x = 0; x<mapSize.x; x++) {
			for(var y = 0; y<mapSize.y + 1; y++) {
				game.display.clearTile(x, y);
			}
		}
		
		game.display.drawText(1, 1, helpScreen);
				
		game.input.createKeyListener("space", function() {
			game.input.context = "action";
			game.display.renderRect(0, 0, mapSize.x, mapSize.y);
			game.display.updateStatus();
		}, "help");
		
		game.input.createKeyListener("escape", function() {
			game.input.context = "action";
			game.display.renderRect(0, 0, mapSize.x, mapSize.y);
			game.display.updateStatus();
		}, "help");
	}, ["action"], "shift");
}

game.nextLevel = function() {
	// clear all tiles
	for(var x = 1; x<mapSize.x - 1; x++) {
		for(var y = 1; y<mapSize.y - 1; y++) {
			game.display.clearTile(x, y);
		}
	}
		
	game.display.drawString(0, 0, "You advance to the next level!");
	
	// divide screen into two halves
	var x = mapSize.x / 2 - 1;
	for(var y = 1; y<mapSize.y - 1; y++) {
		game.display.drawString(x, y, String.fromCharCode(179));
		game.display.drawString(x + 1, y, String.fromCharCode(179));
	}
	
	game.display.drawString(x, mapSize.y - 1, String.fromCharCode(217));
	game.display.drawString(x + 1, mapSize.y - 1, String.fromCharCode(192));
	
	// left side of the screen: more walls
	var y = 8;
	game.display.drawString(2, y, "More walls");
	game.display.drawText(4, y + 1, leftArrow);
	
	// right side of the screen: more speed
	game.display.drawString((mapSize.x / 2) + 3, y, "More speed");
	game.display.drawText((mapSize.x / 2) + 5, y + 1, rightArrow);
	
	game.input.context = "nextLevelMode";
	
	// set up input listeners
	var leftKey = game.input.createKeyListener(["left", "h", 4], function() { // more walls
		maxWalls+=3;
		level++;
		
		game.generateLevel();
		game.input.context = "action";
		game.display.updateStatus();
		game.input.destroyKeyListener(this);
		game.input.destroyKeyListener(rightKey);
	}, "nextLevelMode");
	
	var rightKey = game.input.createKeyListener(["right", "l", 6], function() { // more speed
		game.player.maxSpeed += 5;
		game.player.speed = game.player.maxSpeed;
		level++;
		
		game.generateLevel();
		game.input.context = "action";
		game.display.updateStatus();
		game.input.destroyKeyListener(this);
		game.input.destroyKeyListener(leftKey);
	}, "nextLevelMode");
}

game.restart = function() {
	game.input.context = "action";
	game.ended = false;
	
	maxWalls = 1;
	game.wallCount = 0;
	level = 1;
	
	game.player.dead = false;
	game.player.character = "@";
	game.player.color = "white";
	game.player.maxSpeed = 100;
	game.player.speed = 100;
	game.player.shadeTouch = 0;
	game.player.lightSource.strength = 7;

	game.display.updateStatus();
	game.generateLevel();
}

game.over = function(waited, surrounded) {
	var deathText = shuffle([	"You have been slain.",
								"You've been slaughtered.",
								"You died...",
								"You've departed this life.",
								"You've given up the ghost.",
								"You're food for the ghouls.",
								"You kicked the bucket.",
								"You got dead.",
								"You have been destructified.",
								"You have been killed dead.",
								"You have bought the farm.",
								"All is lost; you died.",
								"Revenge forgotten, you die.",
								"You have been defeated."])[1];
	
	game.input.context = "gameOver";
	game.ended = true;
	
	if(!waited) {
		setTimeout(function() {game.over(true, surrounded)}, 10);
		return;
	} 
	
	if(surrounded) { // oops the player has been surrounded by wall
		deathText = "You've been buried alive.";
	}
	
	// clear all tiles
	for(var x = 1; x<mapSize.x - 1; x++) {
		for(var y = 1; y<mapSize.y - 1; y++) {
			game.display.clearTile(x, y);
		}
	}
	
	var x = Math.round(mapSize.x / 2) - Math.round(skull[0].length / 2);
	var y = Math.round(mapSize.y / 2) - Math.round(skull.length / 2) - 2;
	
	for(var i = 0; i<skull.length; i++) {
		game.display.drawString(x, y + i, skull[i]);
	}
	
	game.display.drawString((Math.round(mapSize.y / 2) - Math.round(deathText.length / 2) + 4), y + 7, deathText);
	
	var str = "[space to restart]";
	x = Math.round(mapSize.x / 2) - Math.round(str.length / 2);
	game.display.drawString(x, mapSize.y - 3, str);
	
	game.input.createKeyListener("space", function() {
		game.input.destroyKeyListener(this);
		game.restart();
	}, "gameOver");
}

game.win = function() {
	game.ended = true;
	
	// clear all tiles
	for(var x = 0; x<mapSize.x; x++) {
		for(var y = 0; y<mapSize.y+1; y++) {
			game.display.clearTile(x, y);
		}
	}
	
	var winText = [	"         \\/",
					"         /\\",
					"          .",
					"Congratulations! You won.",
					"           .",
					"           .       \\/",
					"\\/         .       /\\",
					"/\\          .       .",
					" .     \\/    .      .",
					" .     /\\    .      .",
					".     .       .      .",
					".    .        .      .",
					"",
					"...but at what cost? You",
					"have purchased your free-",
					"-dom from {Impera, the Demon}",
					"{Mage}, at a steep price. You",
					"paid in blood, and you must",
					"atone. You'll make them all",
					"{suffer}. But first, you need ",
					"your powers back... demon."
				  ];
	x = Math.round(mapSize.x / 2) - Math.round(winText.length / 2);
	game.display.drawText(2, 2, winText);
	
	game.input.context = "won";
}

$(window).bind("load", game.init);