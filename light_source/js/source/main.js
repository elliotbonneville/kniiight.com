var lightColor = [207, 206, 186],
	wallColor = [125, 125, 125],
	mouseX = 0,
	mouseY = 0,
	toolStatus = undefined;

$(function() {
	var $menu = $("#menu");
	display = new Display($("#map"));
	$menu.css({
		left: (screen.width / 2) - $menu.css("width").replace("px", "") / 2
	}).mousemove(function() {
		clearTimeout(closeMenuTimeout);
		closeMenuTimeout = undefined;
	});

	$("#menu_space").css("left", (screen.width / 2) - $menu.css("width").replace("px", "") / 2);

	var closeMenuTimeout;

	$("#radius").keydown(function() {
		// Allow: backspace, delete, tab, escape, and enter
        if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 || 
             // Allow: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) || 
             // Allow: home, end, left, right
            (event.keyCode >= 35 && event.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        else {
            // Ensure that it is a number and stop the keypress
            if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
                event.preventDefault(); 
            }   
        }

        display.update(mouseX, mouseY, "true");
	}).bind('keyup mouseup', function() {
		if(+$(this).val() > 99) {
			$(this).val("99");
		}

		if(+$(this).val() < 0 && $(this).val() !== "") {
			$(this).val("1");
		}

		display.light.radius = display.light.oldRadius = +$(this).val();
		display.update(mouseX, mouseY, "true");
	});

	closeMenuTimeout = setTimeout(function() {
		$menu.stop().slideUp();
	}, 2000);

	$("#map").mousemove(function(e) {
		if(typeof closeMenuTimeout === "undefined") {
			closeMenuTimeout = setTimeout(function() {
				$menu.stop().slideUp();
			}, 2000);
		}
	});

	$("#menu_space").mousemove(function(e) {
		if(e.pageY < 30) {
			$menu.slideDown(200);
		}
	});
});

function updateLightColor(color) {
	lightColor[0] = Math.round(color.rgb[0] * 255);
	lightColor[1] = Math.round(color.rgb[1] * 255);
	lightColor[2] = Math.round(color.rgb[2] * 255);
	display.update(mouseX, mouseY, "true");
}

function updateBackgroundColor(color) {
	$("body").css("background-color", "#" + $("#bkg_color").val());
}

function updateWallColor(color) {
	wallColor[0] = Math.round(color.rgb[0] * 255);
	wallColor[1] = Math.round(color.rgb[1] * 255);
	wallColor[2] = Math.round(color.rgb[2] * 255);
	display.update(mouseX, mouseY, "true");
}

function Display(elem) {
	var that = this,
		mouseDown = false,
		wasHere = false,
		lastX = 0,
		lastY = 0;

	this.element = $(elem);
	this.context = this.element[0].getContext("2d");
	
	this.tileSize = {x:12, y: 12};

	this.element[0].height = screen.height;
	this.element[0].width = screen.width;
	$("body").css("overflow", "hidden");

	this.mapSize = {
		x: Math.round(this.element[0].width / this.tileSize.x), 
		y: Math.round(this.element[0].height / this.tileSize.y)
	};

	this.tiles = [];

	this.init = function() {
		for(var x = 0; x<this.mapSize.x; x++) {
			this.tiles[x] = [];
			for(var y = 0; y<this.mapSize.y; y++) {
				this.tiles[x][y] = {
					blocks: false,
					lightLevel: 0
				}
			}
		}

		this.light = new LightSource({
			radius: 6,
			mapSize: this.mapSize,
			getLightLevel: function(x, y) {
				return that.tiles[x][y].blocks;
			}
		});

		this.element.mousedown(function(e) {
			mouseDown = true;
			that.update(e.pageX, e.pageY, true);
		}).mouseup(function() {
			mouseDown = wasHere = false;
			toolStatus = undefined;
		}).mouseleave(function(e) {
			mouseDown = wasHere = false;
			toolStatus = undefined;
		}).mousemove(function(e) {
			that.update(e.pageX, e.pageY, mouseDown);
		});

		this.update();
	}

	this.calculateLighting = function(x, y) {
		if(!mouseDown) {
			var result = this.light.update(x, y);

			for(var i = 0; i<result.length; i++) {
				this.tiles[result[i].x][result[i].y].lightLevel = result[i].lightLevel;
				this.tiles[result[i].x][result[i].y].changed = true;
			}

			return result;
		}
	}

	this.update = function(mx, my, addTile) {
		var blocked = false, 
			data;

		if(isNaN(mx) || isNaN(my)) {
			return;
		}

		mouseX = mx;
		mouseY = my;

		mx = Math.floor((mx - this.tileSize.x / 2) / this.tileSize.x + .5);
		my = Math.floor((my - this.tileSize.y / 2) / this.tileSize.y + .5);

		if(addTile === true && !wasHere) {
			if(typeof toolStatus === "undefined") {
				toolStatus = !this.tiles[mx][my].blocks;
			}

			blocked = this.tiles[mx][my].blocks = toolStatus;
		}

		if(this.tiles[mx][my].blocks) {
			blocked = true;
		} else {
			blocked = false;
		}

		if(mx == lastX && my == lastY) {
			if(addTile) {
				wasHere = true;
			} else {
				return;
			}
		} else {
			wasHere = false;
		}

		lastX = mx;
		lastY = my;

		// calculate lighting
		if(!blocked && !mouseDown) {
			data = this.calculateLighting(mx, my).reverse();
		}

		// clear canvas
		this.context.clearRect(0, 0, this.element[0].width, this.element[0].height);

		var wallStyle = "rgb(" + wallColor[0] + ", " + wallColor[1] + ", " + wallColor[2] + ")";
		var lightStyle = "rgba(" + lightColor[0] + ", " + lightColor[1] + ", " + lightColor[2];
		var posX, posY, tile;
		// draw map
		for(var x = 0; x<this.mapSize.x; x++) {
			for(var y = 0; y<this.mapSize.y; y++) {
				posX = x * this.tileSize.x;
				posY = y * this.tileSize.y;
				tile = this.tiles[x][y];

				if(tile.blocks) {
					this.context.fillStyle = wallStyle;
					this.context.fillRect(posX, posY, this.tileSize.x, this.tileSize.y);
				} else {
					if(tile.lightLevel > 0 && !blocked && !mouseDown && tile.changed) {
						this.context.fillStyle = lightStyle + ", " + tile.lightLevel + ")";
						this.context.fillRect(posX, posY, this.tileSize.x, this.tileSize.y);
					}
				}	
			}
		}
	}

	this.init();
}

// uses shadowcasting to calculate lighting at specified position
function LightSource(d) {
	var Vector2 = function(x, y) { // basic position class, holds x and y coordinates and utility functions
		this.x = x;
		this.y = y;
		
		this.add = function(other) {
			return new Vector2(this.x + other.x, this.y + other.y);
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
			return(new Vector2(this.x, this.y));
		};
		
		this.toString = function() {
			return("(" + this.x + ", " + this.y + ")");
		};
	}

	var data = d.data;
	var gradient = d.gradient;
	var mapSize = d.mapSize;
	this.doesTileBlock = d.getLightLevel;
	this.tiles = [];
	this.position = new Vector2(-1, -1);
	this.radius = d.radius;
	this.oldRadius = this.radius;
	
	// multipliers for transforming coordinates into other octants.
	this.mult = [
					[1,  0,  0, -1, -1,  0,  0,  1],
					[0,  1, -1,  0,  0, -1,  1,  0],
					[0,  1,  1,  0,  0, -1, -1,  0],
					[1,  0,  0,  1, -1,  0,  0, -1]
				];
	
	// calculates an octant. Called by the this.calculate when calculating lighting
	this.calculateOctant = function(cx, cy, row, start, end, radius, xx, xy, yx, yy, id) {
		this.tiles.push({
			x: cx,
			y: cy,
			lightLevel: 0
		});
		
		var new_start = 0;	
		
		if(start < end) return;
		
		var radius_squared = radius * radius;		
 
		for(var i = row; i<radius+1; i++) {
			var dx = -i-1;
			var dy = -i;
			
			var blocked = false;
			
			while(dx <= 0) {
 
				dx += 1;
				
				var X = cx + dx * xx + dy * xy;
				var Y = cy + dx * yx + dy * yy;
				
				if(X < mapSize.x && X >= 0 && Y < mapSize.y && Y >=0) {
				
					var l_slope = (dx-0.5)/(dy+0.5);
					var r_slope = (dx+0.5)/(dy-0.5);
					
					if(start < r_slope) {
						continue;
					} else if( end > l_slope) {
						break;
					} else {
						if(dx*dx + dy*dy < radius_squared) {
							var pos1 = new Vector2(X, Y);
							var pos2 = this.position;
							var d = (pos1.x - pos2.x) * (pos1.x - pos2.x) + (pos1.y - pos2.y) * (pos1.y - pos2.y);

							this.tiles.push({
								x: X, 
								y: Y, 
								lightLevel: (gradient === false) ? 1 : (1 - (d / (this.radius * this.radius)))
							});
						} 
						
						if(blocked) {
							if(this.doesTileBlock(X, Y)) {
								new_start = r_slope;
								continue;
							} else {
								blocked = false;
								start = new_start;
							}
						} else {
							if(this.doesTileBlock(X, Y) && i < radius) {
								blocked = true;
								this.calculateOctant(cx, cy, i+1, start, l_slope, this.radius, xx, xy, yx, yy, id+1);
								
								new_start = r_slope;
							}
						}
					}
				}
			}
			
			if(blocked) break;
		}
	}
	
	// sets flag lit to false on all tiles within radius of position specified
	this.clear = function () {
		var i = this.tiles.length; 
		while(i--) {
			this.tiles[i].lightLevel = 0;
		}

		var o = this.tiles;
		this.tiles = [];
		return o;
	}
	
	// sets flag lit to true on all tiles within radius of position specified
	this.calculate = function () {		
		for(var i = 0; i<8; i++) {
			this.calculateOctant(this.position.x, this.position.y, 1, 1.0, 0.0, this.radius, 
				this.mult[0][i], this.mult[1][i], this.mult[2][i], this.mult[3][i], 0);
		}

		this.tiles.push({
			x: this.position.x,
			y: this.position.y,
			lightLevel: 1
		})

		return this.tiles;
	}
		
	// update the position of the light source
	this.update = function(x, y) {
		this.position = new Vector2(x, y);
		return this.clear().concat(this.calculate());
	}
}