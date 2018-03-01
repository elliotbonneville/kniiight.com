// utility functions
jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + 
                                                $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + 
                                                $(window).scrollLeft()) + "px");
    return this;
}

// provide a random range function
Math.randomRange = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

Math.randomRangeOdd = function(min, max) {
    if(min % 2 == 0) min++;
    if(max % 2 == 0) max--;
	return min + 2 * Math.floor((Math.random() * ((max - min) / 2 + 1)));
}

// better rounding
Math.round = function(num) {
	return(this.floor(num + .5));
}

// function to shuffle arrays
function shuffleArray(k){
	var o = k;
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

// function to check line of sight
function canSee(pos1, pos2) {
	var x0 = pos1.x;
	var y0 = pos1.y;
	var x1 = pos2.x;
	var y1 = pos2.y;
	var dx = Math.abs(x1 - x0);
	var dy = Math.abs(y1 - y0);
	
	var sx = (x0 < x1) ? 1 : -1;
	var sy = (y0 < y1) ? 1 : -1;
	
	var err = dx - dy;
		
	while(true) {
		var t = map.tile(new Vector2(x0, y0));
		if(t.blocks) {
			return false;
		}
		
		if(x0 == x1 && y0 == y1) {
			return true;
		}
		
		var e2 = 2*err;
		
		if(e2 > -dy) {
			err -= dy;
			x0 += sx;
		} 
		
		if(e2 < dx) {
			err += dx;
			y0 += sy;
		}
	}
	
	return "true";
}

// actor controllers
var controller = {};

controller["dead"] = function(parent) {
	this.parent = parent;
	
	this.act = function() {
		// do absolutely nothing :>
		this.parent.draw();
	}
}

controller["guardian"] = function(parent) {
	this.parent = parent;
	this.hasTarget = false;
	this.target = undefined;
	
	this.setAsTarget = function() {
		var closeActors = [];
		
		for(var i = 0; i<curActors.length; i++) {
			if(curActors[i] == this.parent) {
				continue;
			}
			
			var d = this.parent.position.distance(curActors[i].position);
			if(d <= 8.4) {
				closeActors.push(curActors[i]);
			}
		}
		
		var d = this.parent.position.distance(player.position);
		if(d <= 8.4) {
			closeActors.push(player);
		}
		
		var visibleActors = [];
		for(i = 0; i<closeActors.length; i++) {
			if(canSee(this.parent.position, closeActors[i].position)) {
				visibleActors.push(closeActors[i]);
			}
		}
		
		for(var i = 0; i<visibleActors.length; i++) {
			visibleActors[i].setTarget(this.parent);
		}
	}
	
	this.act = function() {
		this.setAsTarget();
				
		if(this.target) {
			var pos1 = this.parent.position;
			var pos2 = this.target.position;
			var pathToTarget = pathfinding.path(pos1.x, pos1.y, pos2.x, pos2.y);
			if(pathToTarget.length > 10) {
				this.target = undefined;
				var t = shuffleArray(map.tile(this.parent.position).adjacent()).pop();
				this.parent.moveTo(t.position);
				return;
			}
			
			this.parent.moveTo(pathToTarget[0]);
		} else {
			var t = shuffleArray(map.tile(this.parent.position).adjacent()).pop();
			this.parent.moveTo(t.position);
		}
	}
}

// player controller
controller["player"] = function(parent) {
	this.parent = parent;
	
	this.setAsTarget = function() {
		var closeActors = [];
		
		for(var i = 0; i<curActors.length; i++) {
			if(curActors[i] == this.parent) {
				continue;
			}
			
			var d = this.parent.position.distance(curActors[i].position);
			if(d <= 8.4) {
				closeActors.push(curActors[i]);
			}
		}
		
		var visibleActors = [];
		for(i = 0; i<closeActors.length; i++) {
			if(canSee(this.parent.position, closeActors[i].position)) {
				visibleActors.push(closeActors[i]);
			}
		}
		
		for(var i = 0; i<visibleActors.length; i++) {
			visibleActors[i].setTarget(this.parent);
		}
	}
	
	this.act = function(key, mods) {
		if(this.parent.type == "player") {
			var r = this.parent.move(input.keyToDirection(key));
			if(r == "move") {
				this.setAsTarget();
				update();
			} else if(r == "rest") {
				update();
			}
		}
	}
}

// actor definitions 
var actors = {
	player: {
		character: "@",
		color: "white",
		speed: 100
	},
	
	guardian: {
		character: "&",
		color: "yellow",
		speed: 120
	}
}

// classes
function Display(size, cellSize) {
	this.size = size;
	this.cellSize = cellSize;
	this.window = undefined;
	this.messageLogHeight = 80;
	
	var _this = this;
	
	this.init = function() {
		var windowSize = new Vector2(this.size.x * this.cellSize.x, 
			this.size.y * this.cellSize.y + this.messageLogHeight);
		this.window = window.open("", "Rogue's Labrynth", "width=" + windowSize.x + ",height=" + windowSize.y);
		
		var $win = this.$win = $(this.window.document.body);
		
		$win.css({
			"background-color": "black",
			"font-family": "Courier"
		})
		
		var $canvas = this.canvas = $('<canvas id="map">');
		this.canvas[0].width = this.cellSize.x * world.mapSize.x;
		this.canvas[0].height = this.cellSize.y * world.mapSize.y;
		
		$win.html($canvas);
		
		var $msgLog = $('<div id="messageLog">');
		this.messageLog = $msgLog;
				
		$msgLog.css({
			height: this.messageLogHeight - 10 + "px",
			"background-color": "#444",
			"overflow-y": "auto",
			"padding": "5px"
		});
		
		$win.append($msgLog);
		this.window.onbeforeunload = function() {
			location.reload();
		}
		
		var ctx = this.ctx = $canvas[0].getContext("2d");
		
		$win.css({
			width: this.canvas[0].width,
			height: this.canvas[0].height,
			padding: 0,
			margin: 0,
			overflow: "hidden"
		});
		
		$win.find("body").css("overflow", "none")
		
		this.ctx.font = "16px Courier";
		this.ctx.fillStyle = "white";
		this.ctx.textBaseline = "top";
	}
	
	this.cell = function(character, pos, color, backgroundColor, opacity) {
		if(backgroundColor) {
			this.ctx.fillStyle = backgroundColor;
			this.ctx.fillRect(pos.x * this.cellSize.x, pos.y * this.cellSize.y, this.cellSize.x, this.cellSize.y);
		}
		
		if(color) {
			var col = new Color(color);
			if(opacity) {
				col.alpha = opacity;
			}

			this.ctx.fillStyle = col.toRGBA();
		} else {
			this.ctx.fillStyle = "white";
		}
		
		this.ctx.fillText(character, pos.x * this.cellSize.x, pos.y * this.cellSize.y);
	};
	
	this.fillCell = function(pos, col) {
		col = (typeof col == "undefined") ? "black" : col;
		this.ctx.fillStyle = col;
		this.ctx.fillRect(pos.x * this.cellSize.x, pos.y * this.cellSize.y, this.cellSize.x, this.cellSize.y);
	}
	
	this.clearAll = function() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
	
	this.message = function(messageText, color) {
		var msg = $('<div class="message">');
		msg.html(messageText);
		
		if(color) {
			msg.css("color", color);
		}
		
		this.messageLog.append(msg).scrollTo("100%", 100);
	}
	
	this.effect = function(tilePos, character, color) {
		color = (color) ? color : "white";
		var e = $('<div class="effect">');
				
		e.css({
			"position": "absolute",
			"color": color,
			"left": tilePos.x * world.cellSize.x,
			"top": tilePos.y * world.cellSize.y,
			width: "11px",
			height: "18px",
			"font-family": "Courier",
			"font-weight": "bold"
		});
		
		e.html(character);
		
		e.animate({
			opacity: 0,
			top: "-20px"
		}, 2000);
		
		this.$win.append(e);
	}

	
	this.init();
}

// used to store a point on a map
function Vector2(x, y) {
	this.x = x;
	this.y = y;
	
	this.add = function(other) {
		return new Vector2(this.x + other.x, this.y + other.y);
	};
	
	this.subtract = function(other) {
		return new Vector2(this.x - other.x, this.y - other.y);
	}
	
	this.divide = function(amt) {
        return new Vector2(this.x / amt, this.y / amt);
    }
	
	this.distance = function(pos) {
		var dx = pos.x - this.x;
		var dy = pos.y - this.y;
		
		return Math.abs(Math.sqrt((dx * dx) + (dy * dy)));
	};
	
	this.manhattan = function(pos) {
		return(Math.abs(this.x - pos.x) + Math.abs(this.y - pos.y));
	};
	
	this.clone = function() {
		return(new Vector2(this.x, this.y));
	};
	
	this.equals = function(other) {
		return(this.x == other.x && this.y == other.y);
	}
	
	this.toString = function() {
		return("(" + this.x + ", " + this.y + ")");
	};
}

// used to store a rectangle on a map
function Rect(x, y, width, height) {
	this.x = x;
	this.y = y;
	
	this.x2 = x + width;
	this.y2 = y + height;
	
	this.width = width;
	this.height = height;
	
	this.intersects = function(other) {
		return(this.x <= other.x + other.width && this.x + this.width >= other.x &&
			   this.y <= other.y + other.height && this.y + this.height >= other.y);
	}
	
	this.center = function() {
		var centerX = Math.round((this.x + this.x2) / 2);
		var centerY = Math.round((this.y + this.y2) / 2);
		return new Vector2(centerX, centerY); 
	};
}


// used to hold colors
function Color(r, g, b, a) {
	this.colors = { acqua:'#0ff',   teal:'#008080',   blue:'#00f',      navy:'#000080',
					yellow:'#ff0',  olive:'#808000',  lime:'#0f0',      green:'#008000',
					fuchsia:'#f0f', purple:'#800080', red:'#f00',       maroon:'#800000',
					white:'#fff',   gray:'#808080',   silver:'#c0c0c0', black:'#000' };
	
	var color, values;
	
	this.red = r;
	this.green = g;
	this.blue = b;
	this.alpha = a;
	
	if(isNaN(r)) {
		if(r.indexOf("#") < 0) {
			color = this.colors[r];
		} else {
			color = r;
		}
		
		color = color.substr(1)
		
		if(color.length == 3) {
			this.red = parseInt(color[0] + color[0], 16);
			this.green = parseInt(color[1] + color[1], 16);
			this.blue = parseInt(color[2] + color[2], 16);
			this.alpha = 1;
		} else {
			this.red = parseInt(color.substr(0, 2), 16);
			this.green = parseInt(color.substr(2, 2), 16);
			this.blue = parseInt(color.substr(4, 2), 16);
			this.alpha = 1;
		}
	}
	
	this.toRGBA = function() {
		return "rgba(" + this.red + ", " + this.green + ", " + this.blue + ", " + this.alpha + ")";
	}
}

var tileDefinitions = {
	floor: {
		character: String.fromCharCode(9617),
		//character: ".",
		color: "#555",
		blocks: false
	}, 
	
	wall: {
		character: String.fromCharCode(9619),
		//character: "#",
		color: "gray",
		blocks: true
	}
}

var featureDefinitions = {
	"up stairs": {
		character: "<",
		color: "white",
		blocks: false,
		take: function() {
			
			if(world.level > 1) {
				world.level--;
				map.generateNewLevel();
				map.tile(player.position).removeActor();
				player.position = new Vector2(map.size.x - 2, map.size.y - 2);
				map.tile(new Vector2(map.size.x - 2, map.size.y - 2)).setActor(player);
			} else {
				if(confirm("Would you like to quit the game?")) {
					display.window.close();
				}
			}
		}
	},
	
	"down stairs": {
		character: ">",
		color: "white",
		blocks: false,
		take: function() {
			if(world.level < 7) {
				world.level++;
				player.position = new Vector2(1, 1);
				map.generateNewLevel();
				map.tile(player.position).removeActor();
				map.tile(new Vector2(1, 1)).setActor(player);
				player.position = new Vector2(1, 1);
			}
		}
	},
	
	"closed door": {
		character: "+",
		color: "#8B4513",
		blocks: true
	},
	
	"open door": {
		character: "/",
		color: "#8B4513",
		blocks: false
	}
}

function Feature(pos, type) {
	this.position = pos;
	
	this.setType = function(type) {
		for(prop in featureDefinitions[type]) {
			this[prop] = featureDefinitions[type][prop];
		}
	}
	
	this.setType(type);
}

function Tile(pos, type) {
	this.position = pos;
	this.type = type;
	
	this.feature = undefined;
	this.actor = undefined;
	this.item = undefined;
	
	this.draw = function() {
		display.fillCell(this.position);
		
		var _char,
			col;
		
		if(this.feature) {
			_char = this.feature.character;
			col = this.feature.color;
		}
		
		if(this.item) {
			_char = this.item.character;
			col = this.item.color;
		}
		
		if(this.actor) {
			_char = this.actor.character;
			col = this.actor.color;
		}
		
		display.cell(this.character, this.position, this.color);
		
		if(_char) {
			display.cell(_char, this.position, col);
		}
	}
	
	// utility functions
	this.setItem = function(item) {
		this.item = item;
		this.draw();
	}
	
	this.removeItem = function() {
		this.item = undefined;
		this.draw();
	}
	
	this.setFeature = function(type) {
		this.feature = {type: type};
		
		for(prop in featureDefinitions[type]) {
			this.feature[prop] = featureDefinitions[type][prop];
		}
		
		this.draw();
	}
	
	this.setActor = function(actor) {
		this.actor = actor;
		this.draw();
		
		if(this.actor == player) {
			if(this.item) {
				if(this.item.type == "amulet") {
					win();
				} else if(this.item.type == "key") {
					this.removeItem();
					playerKeys++;
					display.message("You found a key! (" + playerKeys + " out of " + world.level + " total)");
				}
			}
		}
	}
	
	this.removeActor = function() {
		this.actor = undefined;
		this.draw();
	}
	
	this.setType = function(type) {
		this.type = type;
		
		for(prop in tileDefinitions[this.type]) {
			this[prop] = tileDefinitions[this.type][prop];
		}
		
		this.draw();
	}
	
	this.clearStuff = function() {
		this.actor = undefined;
		this.item = undefined;
		this.feature = undefined;
	}
	
	// access functions
	this.neighbors = function(cardinalsOnly) {
		var i = 8, tile, neighbors = [], dec = 1;
		
		if(cardinalsOnly) {
			dec = 2;
		}
		
		while(i-=dec) {
			tile = map.tile(new Vector2(this.position.x + this.x_array[i], this.position.y + this.y_array[i]));
			
			if(tile) {
				neighbors.push(tile);
			}
		}
		
		return neighbors;
	}
	
	this.adjacent = function() {
		var pos = this.position;
		
		var vAbove = map.tile(pos.add(new Vector2(0, -1)));
		var vBelow = map.tile(pos.add(new Vector2(0, 1)));
		var hLeft = map.tile(pos.add(new Vector2(-1, 0)));
		var hRight = map.tile(pos.add(new Vector2(1, 0)));
		
		return [vAbove, vBelow, hLeft, hRight];
	}
	
	this.impassable = function() {
		if(this.blocks) {
			return true;
		}
		
		if(this.feature && this.feature.blocks) {
			return true;
		}
		
		if(this.actor) {
			return true;
		}
		
		return false;
	}
	
	this.setType(type);
}


// a map
function Map(size) {
	var _this = this;
	
	this.size = size;
	this.data = [];
	
	this.apply = function(rect, func) {
		for(var x = rect.x; x<rect.x + rect.width; x++) {
			for(var y = rect.y; y<rect.y + rect.height; y++) {
				func(this.data[x][y]);
			}
		}
	}
	
	this.init = function() {
		for(var x = 0; x<size.x; x++) {
			this.data[x] = [];
			for(var y = 0; y<size.y; y++) {
				this.data[x][y] = new Tile(new Vector2(x, y), "wall");
			}
		}
		
		this.generateMaze();
		
		this.apply(new Rect(0, 0, this.size.x, this.size.y), function(t) {
			t.draw();
		});
	}
	
	this.generateMaze = function() {
		// utility functions for maze generation
		var isVisited = function(t) {
			if(unvisitedCells.indexOf(t) > 0) {
				return false;
			}
			
			return true;
		}
		
		var markVisited = function(t) {
			var i = unvisitedCells.indexOf(t)
			if(i > 0) {
				unvisitedCells.splice(i, 1);
			}
			
			t.setType("floor");
		}
		
		var getAdjacentUnvisitedCells = function(tile) {
			var cells = [], 
				pos = tile.position;
			
			cells.push(_this.tile(new Vector2(pos.x - 2, pos.y)));
			cells.push(_this.tile(new Vector2(pos.x + 2, pos.y)));
			cells.push(_this.tile(new Vector2(pos.x, pos.y - 2)));
			cells.push(_this.tile(new Vector2(pos.x, pos.y + 2)));
			
			for(var i = cells.length-1; i >= 0; i--) {
				if(!cells[i] || isVisited(cells[i])) {
					cells.splice(i, 1);
				}
			}
			
			return cells;
		}
		
		var getWall = function(_1, _2) {
		    var dx = _1.position.x - _2.position.x;
		    var dy = _1.position.y - _2.position.y;
		    var distance = Math.sqrt(dx * dx + dy * dy);
		    		    
		    dx = Math.round(dx / distance);
		    dy = Math.round(dy / distance);
		    
		    return(_this.tile(_2.position.add(new Vector2(dx, dy))));
		}
		
		// stick all unvisited cells in an array
		var unvisitedCells = [],
			cellStack = [];
		
		for(var x = 1; x < this.size.x; x += 2) {
			for(var y = 1; y < this.size.y; y += 2) {
				if(!this.tile(new Vector2(x, y))) {
					continue;
				}
				
				unvisitedCells.push(this.tile(new Vector2(x, y)));
			}
		}
		
		// make the initial cell the current cell and mark it as unvisited
		var currentCell = this.tile(new Vector2(1, 1));
		markVisited(currentCell);
		
		// while there are unvisited cells
		while(unvisitedCells.length > 0) {
			// if the current cell has any neighbors which have not been visited
			var unvisitedNeighbors = getAdjacentUnvisitedCells(currentCell);
			
			if(unvisitedNeighbors.length > 0) {
				// choose randomly one of the unvisited neighbors
				var n = shuffleArray(unvisitedNeighbors).pop();
				
				// push the current cell to the stack
				cellStack.push(currentCell);
				
				// remove the wall between the current cell and the chosen cell
				getWall(currentCell, n).setType("floor");
				
				// make the chosen cell the current cell and mark it as unvisited
				currentCell = n;
				markVisited(currentCell);
			} else if(cellStack.length > 0) { // else if stack is not empty
				// pop a cell from the stack and mark it the current cell
				currentCell = cellStack.pop();
			} else {
				// pick a random cell
				var randomCell = _this.tile(new Vector2(Math.randomRangeOdd(1, _this.size.x),
					Math.randomRangeOdd(1, _this.size.y)));
				
				// make it the current cell
				currentCell = randomCell;
				
				if(!currentCell) {
					break;
				}
				
				// and mark it as visited
				markVisited(currentCell);
			}
		}
		
		// now that the maze has been generated it's time to place start/end
		this.start = new Vector2(1, 1);
		this.end = new Vector2(this.size.x - 2, this.size.y - 2);
				
		if(world.level < 7) {
			this.tile(this.end).setFeature("down stairs");
		} else {
			var mcGuffin = new Item(this.end, "amulet", this);
			this.tile(this.end).setItem(mcGuffin);
		}
	}
	
	this.fillMaze = function() {
		// utility functions
		var isGoodDoorPlacement = function(t) {
			var pos = t.position;
			var vAbove = _this.tile(pos.add(new Vector2(0, -1)));
			var vBelow = _this.tile(pos.add(new Vector2(0, 1)));
			var hLeft = _this.tile(pos.add(new Vector2(-1, 0)));
			var hRight = _this.tile(pos.add(new Vector2(1, 0)));
			
			var hasVerts = (vAbove.type == "wall" && vBelow.type == "wall");
			var hasHoris = (hLeft.type == "wall" && hRight.type == "wall");
			
			if(hasVerts || hasHoris) {
				return true;
			} 
			
			return false;
		}
		
		var adjacent = function(pos) {
			var vAbove = _this.tile(pos.add(new Vector2(0, -1)));
			var vBelow = _this.tile(pos.add(new Vector2(0, 1)));
			var hLeft = _this.tile(pos.add(new Vector2(-1, 0)));
			var hRight = _this.tile(pos.add(new Vector2(1, 0)));
			
			return [vAbove, vBelow, hLeft, hRight];
		}
		
		var floodFill = function(tile, stack) {
			// if the type of node is not equal to target type, return
			if(tile.type == "wall" || tile.feature && tile.feature.type == "closed door") {
				return;
			}
			
			// add node to stack of other nodes
			stack.push(tile);
			var adj = adjacent(tile.position);
			for(var i = 0; i<adj.length; i++) {
				if(!adj[i] || stack.indexOf(adj[i]) > 0) {
					continue;
				}
				
				floodFill(adj[i], stack);
			}
		}
		
		var getTilesBefore = function(doorObj) {
			var s = [];
			floodFill(doorObj.before, s);
			return s;
		}
		
		var tileOccupied = function(t) {
			var pos = t.position;
			
			for(var i = 0; i<curActors.length; i++) {
				if(curActors[i].position.x == pos.x && curActors[i].position.y == pos.y) {
					return true;
				}
			}
			
			return false;
		}
		
		// find path from start to end
		var path = pathfinding.path(this.start.x, this.start.y, 
			this.end.x, this.end.y);
		
		var doorTiles = [];
		var _i = path.length - 2;
		
		for(var i = 0; i<world.level; i++) {
			_i -= Math.randomRange(1, 3);
			var t = (this.tile(path[_i]));
			
			while(!isGoodDoorPlacement(t)) {
				t = this.tile(path[_i--]);
			}
			
			doorTiles.push({
				door: t,
				before: this.tile(path[_i-1]),
				after: this.tile(path[_i+1])
			});
			
			doorTiles[i].door.setFeature("closed door");
		}
		
		doorTiles = doorTiles.reverse();
		var reachableTiles = getTilesBefore(doorTiles[0]);

		var dangerLevel = Math.round(world.level * 3.5);
		for(var i = 0; i<dangerLevel; i++) {
			var p = shuffleArray(reachableTiles).pop();
			
			while(!p || p.impassable() || p.position.distance(new Vector2(1, 1)) < 5) {
				p = shuffleArray(reachableTiles).pop();
			}
			
			var guard = new Actor(p.position, "guardian");
			curActors.push(guard);
		}
	}
	
	this.generateNewLevel = function() {
		curActors = [];
		playerKeys = 0;
		
		var r = new Rect(0, 0, this.size.x, this.size.y);
		map.apply(r, function(t) {
			var pos = t.pos;
			t.clearStuff();
			t.setType("wall");
		});
		
		this.tile(new Vector2(1, 1)).setActor(player);
		player.position = new Vector2(1, 1);
		
		this.generateMaze();
		this.fillMaze();
	}
	
	this.tile = function(pos) {
		if(pos.x < 0 || pos.x >= this.size.x || pos.y < 0 || pos.y >= this.size.y) {
			return undefined;
		}
		
		return this.data[pos.x][pos.y];
	}
	
	this.init();
}

// an actor in the game
function Actor(pos, type) {
	this.position = pos;
	this.type = type;
	
	this.speed = 0;
	this.energyPoints = 0;
	this.confuseTime = 0;
	
	this.aggressive = false;
	
	this.controller = new controller[type](this);
	
	this.draw = function() {
		//display.fillCell(this.position);
		map.tile(this.position).draw();
		display.cell(this.character, this.position, this.color);
	}
	
	this.takeTurn = function(key, mods) {
		this.energyPoints += this.speed;
		while(this.energyPoints > 0) {
			this.controller.act(key, mods);
			this.energyPoints -= 100;
		}
	}
	
	this.confuse = function() {
		this.confuseTime = 2;
		display.effect(this.position, "?", "green");
		display.message("The guardian appears to be confused...");
	}
	
	this.jump = function(dir) {
		var target = this.position.add(dir).add(dir),
			baddiePos = this.position.add(dir),
			baddie;
		
		if(map.tile(target).impassable()) {
			return "oops";
		}
		
		baddie = map.tile(baddiePos).actor;
		
		baddie.confuse();
		
		map.tile(this.position).removeActor();
		this.position = target;
		map.tile(this.position).setActor(this);
		
		return "move";
	}
	
	// used to handle player movement
	this.move = function(dir) {
		var pos = this.position.clone().add(dir);
		var t = map.tile(pos);
		
		if(t.feature && t.feature.type == "closed door") {
			if(playerKeys > 0) {
				playerKeys--;
				map.tile(pos).setFeature("open door");
				return "rest";
			} else {
				return "oops";
			}
		}
		
		if(dir.x == 0 && dir.y == 0) {
			return "rest";
		}
		
		if(t.actor) {
			if(this.type == "player") {
				// we want to attempt to jump whatever's occupying that tile
				return(this.jump(dir));
			}
		}
		
		if(!t || t.impassable()) {
			return;
		}
		
		map.tile(this.position).removeActor();
		this.position = pos;
		map.tile(this.position).setActor(this);
		
		t = map.tile(this.position);
		
		if(t.feature && t.feature.type.indexOf("stairs") > 0) {
			t.feature.take();
		}
				
		return "move";
	}
	
	// functions guardians call/get called
	this.die = function() {
		// now we want to turn this actor into a key! \o/
		map.tile(this.position).removeActor();
		
		// turn this guy dead
		this.controller = new controller.dead(this);
		
		// remove him from the list of actors
		curActors.splice(curActors.indexOf(this), 1);
		
		// add a key to the map
		var key = new Item(this.position, "key", map);
		map.tile(this.position).setItem(key);
	}
	
	this.setTarget = function(t) {
		if(!this.aggressive && t.type != "player") {
			return;
		}
		
		if(t.type == "player") {
			this.aggressive = true;
		}
		
		if(this.type == "guardian" && t != this.controller.target) {
			display.effect(this.position, "!", "red");
			
			if(t.type == "player") {
				display.message("The guardian catches sight of you!");
			}
		}
		
		this.controller.target = t;
	}
	
	this.attack = function(target) {
		switch(target.type) {
			case "player":
				quit();
				break;
			
			case "guardian":
				target.die();
				this.controller.target = undefined;
				break;
			
			default:
				break;
		}
	}
	
	// used to handle guardian movement
	this.moveTo = function(pos) {
		if(this.confuseTime > 0) {
			this.confuseTime--;
			return;
		}
		
		var occupier = map.tile(pos).actor;
		if(occupier) {
			if(this.type == "guardian") {
				// we want to attack whatever's occupying that tile
				this.attack(occupier);
				
				// and then end our turn
				return;
			}
		}
		
		if(pos.distance(this.position) > 1.5) {
			return;
		}
		
		if(!map.tile(pos) || map.tile(pos).impassable()) {
			return;
		}
		
		map.tile(this.position).removeActor();
		this.position = pos;
		map.tile(this.position).setActor(this);
	}
	
	this.init = function() {
		for(prop in actors[this.type]) {
			this[prop] = actors[this.type][prop];
		}
		
		this.draw();
	}
	
	this.init();
}

var item = {};
item["key"] = {
	color: "yellow",
	character: "~"
}

item["amulet"] = {
	character: "*",
	color: "white"
}

// items
function Item(pos, type, map) {
	this.position = pos;
	
	this.draw = function() {
		map.tile(this.position).draw();
		display.cell(this.character, this.position, this.color);
	}
	
	this.init = function(type) {
		this.type = type;
		this["character"] = item[this.type]["character"];
		this["color"] = item[this.type]["color"];
		
		this.draw();
	}
	
	this.init(type);
}

// stairs
function Stair(dir, pos, map) {
	this.dir = dir;
	this.character = (dir == "up") ? "<" : ">";
	this.position = pos;
	
	this.take = function() {
		switch(this.dir) {
			case "up":
				if(world.level > 1) {
					world.level--;
					map.generateNewLevel();
				} else {
					if(confirm("Would you like to quit the game?")) {
						display.window.close();
					}
				}
				break;
				
			case "down":
				if(world.level < 7) {
					world.level++;
					map.generateNewLevel();
				}

				break;
				
			default:
				break;
		}
	}
	
	this.init = function() {
		map.tile(this.position).stairs = this;
		map.tile(this.position).draw();
	}
	
	this.init();
}

// pathfinding
function AStar(data, sizeX, sizeY, getTile) {
	this.x_array = [0, -1, -1, -1, 0, 1, 1, 1];
	this.y_array = [1, 1, 0, -1, -1, -1, 0, 1];
	
	this.data = data;
	this.mapSize = {
		x: sizeX,
		y: sizeY
	}
	this.getTile = getTile;
	
	var astar = this;
	
	if(!this.data) {
		console.log("Please provide data for AStar to find a path with.");
	}
	
	if(!this.getTile) {
		console.log("Please provide a tile data retrieval function for AStar to run.");
	}
	
	this.Vector2 = function(x, y) {
		this.x = x;
		this.y = y;
		
		this.add = function(other) {
			return new astar.Vector2(this.x + other.x, this.y + other.y);
		};
		
		this.distance = function(pos) {
			var dx = pos.x - this.x;
			var dy = pos.y - this.y;
			
			return Math.abs(Math.sqrt((dx * dx) + (dy * dy)));
		};
		
		this.manhattan = function(pos) {
			return(Math.abs(this.x - pos.x) + Math.abs(this.y - pos.y));
		};
		
			this.clone = function() {
			return(new astar.Vector2(this.x, this.y));
		};
		
		this.toString = function() {
			return("(" + this.x + ", " + this.y + ")");
		};
	}
	
	this.PathNode = function(pos, g, h, f) {
		this.pos = pos;
		this.f = f;
		this.g = g;
		this.h = h;
	}
	
	this.NodeList = function() {
		this.nodes = [];
		
		this.add = function(givenNode) {
	        for(var i = 0; i<this.nodes.length; i++) {
	            if(this.nodes[i].f <= givenNode.f) {
	                this.nodes.splice(i, 0, givenNode);
	                return;
	            }
	        }
	        
	        this.nodes.push(givenNode);
	    }
	    
	    this.pop = function() {
	        return this.nodes.splice(this.nodes.length-1, 1)[0];
	    }
	    
	    this.getNode = function(givenNode) {
	        for (var i = 0; i < this.nodes.length; i++) {
	            if (this.nodes[i].pos.x == givenNode.pos.x && this.nodes[i].pos.y == givenNode.pos.y) {
	                return this.nodes.splice(i, 1)[0];
	            }
	        }
	                
	        return -1;
	    }
	    
	    this.hasNode = function(givenNode) {
	        for (var i = 0; i < this.nodes.length; i++) {
	            if (this.nodes[i].pos.x == givenNode.pos.x && this.nodes[i].pos.y == givenNode.pos.y) {
	                return true;
	            }
	        }
	
	        return false;
	    }
	    
	    this.length = function() {
	    	return this.nodes.length;
	    }
	}
	
	this.path = function(startX, startY, endX, endY) {
		var start = new this.Vector2(startX, startY);
		var goal = new this.Vector2(endX, endY);
		var open_list = new this.NodeList();
		open_list.add(new this.PathNode(start, start.manhattan(goal) * 10, 0, start.manhattan(goal) * 10));
		var closed_list = new this.NodeList();

		while(open_list.length() > 0) {
			// get node with lowest F score
			var currentNode = open_list.pop();
			
			// switch it to closed list
			closed_list.add(currentNode);
			
			// if this is the end node, calculate the path and return it
			if(currentNode.pos.x == goal.x && currentNode.pos.y == goal.y) {
				var finalPath = [];
				var curNode = currentNode;
				
				while(true) {
					finalPath.push(curNode.pos);
					curNode = curNode.parent;
					if(!curNode) break;
					if(curNode.pos.x == start.x && curNode.pos.y == start.y) break;
				}
				
				return finalPath.reverse();
			}
			
			// otherwise loop through this tile's neighbors
			for(var i=0; i<8; i++) {
				var neighborPos = new this.Vector2(currentNode.pos.x + this.x_array[i], currentNode.pos.y + this.y_array[i]);
				var neighbor = new this.PathNode(neighborPos, 0, 0, 0);

				if(i % 2 != 0) {
					continue;
				}

				// if this neighbor blocks or is off the map skip it
				if(neighbor.pos.x < 0 || neighbor.pos.y < 0 || neighbor.pos.x > this.mapSize.x-1 || neighbor.pos.y > this.mapSize.y - 1) {
					continue;
				}

				// skip this neighbor if it's on the closed list or isn't walkable
				if(closed_list.hasNode(neighbor) || this.getTile(this.data, neighbor.pos.x, neighbor.pos.y).blocks) {
					continue;
				}
				
				var distanceToTile = 10;
				if(i == 1 || i == 3 || i == 5 || i == 7) {
					distanceToTile = 14;
				}
				
				// if the tile is already on the open list
				if(open_list.hasNode(neighbor)) { 
					neighbor = open_list.getNode(neighbor);
					
					if(neighbor.g < currentNode.g) {
						neighbor.parent = currentNode;
						
						neighbor.g += currentNode.g + distanceToTile;
						neighbor.h += neighbor.pos.distance(goal) * 10;
						neighbor.f += neighbor.g + neighbor.h;
					}
					
					open_list.add(neighbor);
				} else { // if the tile is not on the open list
					neighbor.parent = currentNode;
					
					neighbor.g += distanceToTile;
					neighbor.h += neighbor.pos.distance(goal) * 10;
					neighbor.f += neighbor.g + neighbor.h;
					
					open_list.add(neighbor);
				}
			
			}
		}
		
		return(undefined);
	}
}

// utilities
function Input() {
	// keys currently being held down
	this.activeKeys = [];
	
	// key codes for $.keypress()
	this.key = {
		left: 37,
		up: 38,
		right: 39,
		down: 40,
		1: 49,
		2: 50,
		3: 51,
		4: 52,
		5: 53,
		6: 54,
		7: 55,
		8: 56,
		9: 57,
		0: 48,
		A: 65,
		B: 66,
		C: 67,
		D: 68,
		E: 69,
		F: 70,
		G: 71,
		H: 72,
		I: 73,
		J: 74,
		K: 75,
		L: 76,
		M: 77,
		N: 78,
		O: 79,
		P: 80,
		Q: 81,
		R: 82,
		S: 83,
		T: 84,
		U: 85,
		V: 86,
		W: 87,
		X: 88,
		Y: 89,
		Z: 90,
		escape: 27,
		enter: 13,
		control: 17,
		space: 32,
		",": 188,
		".": 190
	};
	
	// used to map arrow keys and numpad to the top row of number keys 
	this.keymap = {
		// north
		38: 56,
		104: 56,
		75: 56,
		
		// west
		39: 54,
		102: 54,
		76: 54,
		
		// south
		40: 50,
		98: 50,
		74: 50,
		
		// east
		37: 52,
		100: 52,
		72: 52,
		
		// north west
		105: 57,
		85: 57,
		
		// south west
		99: 51,
		78: 51,
		
		// north east
		103: 55,
		89: 55,
		
		// south east
		97: 49,
		66: 49,
		
		// rest
		82: 53,
		101: 53,
		190: 53
	};
	
	this.keyToDirection = function(inputCode) {
		switch(inputCode) {
			// north
			case 56:
				return(new Vector2(0, -1));
				break;
			
			// south
			case 50:
				return(new Vector2(0, 1));
				break;
			
			// east
			case 52:
				return(new Vector2(-1, 0));
				break;
			
			// west
			case 54:
				return(new Vector2(1, 0));
				break;
				
			// north east 
			case 55:
				return(new Vector2(-1, -1));
				break;	
			
			// north west
			case 57:
				return(new Vector2(1, -1));
				break;
				
			// south east
			case 49:
				return(new Vector2(-1, 1));
				break;
				
			// south west
			case 51:
				return(new Vector2(1, 1));
				break;
				
			case 53: 
				return(new Vector2(0, 0));
				break;
				
			default:
				return;
				break;
		}
	}
	
	this.init = function() {
		var _this = this;
		
		$(display.window).on('keydown', function(e) {
			// if key is in numpad or an arrow key, map it to the number key row
			var key = e.which;
			var mods = [];

			if(e.shiftKey) {
				mods.push("shift");
			}
			
			if(e.ctrlKey) {
				mods.push("ctrl");
			}
			
			if(e.altKey) {
				mods.push("alt");
			}
			
			if(_this.keymap[key]) {
				key = _this.keymap[key];
			}

			switch(world.inputMode) {
				case "move":
					// do move action
					player.takeTurn(key, mods);
					break;
				
				case "get direction":
					// get a direction
					if(world.inputCallback) {
						world.inputCallback(_this.keyToDirection(key));
						world.inputCallback = undefined;
						world.inputMode = "move";
					} else {
						console.log("Got a direction but could not find a callback!");
						world.inputMode = "move";
					}
					
					break;
					
				case "wait for input":
					if(key == _this.key.space) {
						world.inputMode = "move";
						if(world.inputCallback) {
							world.inputCallback();
							world.inputCallback = undefined;
						}
					}
					break;
				
				default:
					break;
			}
			
			// prevent event from being echoed twice
			e.stopPropagation();
		});
	}
	
	this.init();
}

var world = {
	mapSize: new Vector2(81, 25),
	cellSize: new Vector2(10, 18),
	inputMode: "move",
	level: 1 // out of 7 levels total
};

var	display,
	input,
	map,
	curActors = [],
	player,
	playerKeys = 0,
	pathfinding;

function update() {
	for(var i = 0; i<curActors.length; i++) {
		curActors[i].takeTurn();
	}
	
	player.draw();
}

function start() {
	display = new Display(world.mapSize, world.cellSize);
	input = new Input();
	map = new Map(world.mapSize);
	pathfinding = new AStar(map, world.mapSize.x, world.mapSize.y, function(d, x, y) {
		return {
			blocks: d.data[x][y].blocks
		}
	});
	map.fillMaze();
	
	for(i = 0; i<curActors.length; i++) {
		curActors[i].draw();
	}
	
	player = new Actor(new Vector2(1, 1), "player");
	map.tile(new Vector2(1, 1)).setActor(player);
		
	display.message("Welcome to the Rogue's Labyrinth. You have come here in search of the famed Amulet of Rodney, an artifact which will grant you the power you need to save your people from impending doom. But be careful--the strange figures that lurk within these twisted walls seek your downfall.");
}

function quit() {
	display.message("Before you can do a thing, the implacable guardian raises an arm and grabs you. Moments later, you die... <br> <br> [space to continue]");
	world.inputMode = "wait for input";
	world.inputCallback = function() {
		display.window.close();
		location.reload();
	}
}

function win() {
	display.message("As you place the mighty Amulet of Rodney about your neck, you feel your power heighten and grow in ways you didn't even know were possible. The guardians, once your strongest enemy, are nothing but tiny specks of insignificance compared to your might. But a greater evil lies outside this labrynth. You face challenges ahead, certainly--yet now, with the amulet's power, you have a chance to overcome them and save your people. <br> <br> Congratulations, you won! [space to continue]");
	world.inputMode = "wait for input";
	world.inputCallback = function() {
		display.window.close();
		location.reload();
	}
}

// start function
$(function() {
	$("#launch_game").click(function() {
		if(map) {
			playerKeys = 0;
			map.generateNewLevel();
		}
		
		start();
	});
});