	(function() { // A* implementation
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
			
			this.coward = function(pos) {
				var dx = pos.x - this.x;
				var dy = pos.y - this.y;
				
				return -Math.abs(Math.sqrt((dx * dx) + (dy * dy)));
			}
			
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
		
		this.path = function(startX, startY, endX, endY, pathType) {
			// if it's true then we want diagonals only
			var diagonalDistance = 14,
				heuristic = "distance",
				shade = false;
			
			xArray = this.x_array;
			yArray = this.y_array;
			
			switch(pathType) {
				case "diagonal":
					diagonalDistance = Infinity;
					break;
				
				case "orthogonal":
					xArray = [0, 0, 1, -1];
					yArray = [1, -1, 0, 0];
					break;
					
				case "coward":
					heuristic = "coward";
					break;
					
				case "shade":
					shade = true;
					break;
					
				default:
					break;
			}
			
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
						finalPath.push(curNode);
						curNode = curNode.parent;
						if(curNode.pos.x == start.x && curNode.pos.y == start.y) break;
					}
					
					finalPath = finalPath.reverse();
					
					if(finalPath[0].f === Infinity) {
						return undefined;
					}
					
					return finalPath;
				}
				
				// otherwise loop through this tile's neighbors
				for(var i=0; i<xArray.length; i++) {
					var neighborPos = new this.Vector2(currentNode.pos.x + xArray[i], currentNode.pos.y + yArray[i]);
					var neighbor = new this.PathNode(neighborPos, 0, 0, 0);

					// if this neighbor blocks or is off the map skip it
					if(neighbor.pos.x < 0 || neighbor.pos.y < 0 || neighbor.pos.x > this.mapSize.x-1 || neighbor.pos.y > this.mapSize.y - 1) {
						continue;
					}

					// skip this neighbor if it's on the closed list or isn't walkable
					if(closed_list.hasNode(neighbor) || this.getTile(this.data, neighbor.pos.x, neighbor.pos.y).blocks) {
						continue;
					}
					
					var distanceToTile = 10;
					if(diagonalDistance !== 14) {
						distanceToTile = Infinity;
						if(i == 1 || i == 3 || i == 5 || i == 7) {
							distanceToTile = 10;
						}
					} else {
						if(i == 1 || i == 3 || i == 5 || i == 7) {
							distanceToTile = 14;
						}
					}
					
					// if the tile is already on the open list
					if(open_list.hasNode(neighbor)) { 
						neighbor = open_list.getNode(neighbor);
						
						if(neighbor.g < currentNode.g) {
							neighbor.parent = currentNode;
							
							neighbor.g += currentNode.g + distanceToTile;
							neighbor.h += neighbor.pos[heuristic](goal) * 10;
							
							var influence = 0;
							
							if(shade) {
								influence = game.map.tile(neighbor.pos.x, neighbor.pos.y).lightLevel() * 50;
							}
							
							neighbor.f += neighbor.g + neighbor.h + influence;
						}
						
						open_list.add(neighbor);
					} else { // if the tile is not on the open list
						neighbor.parent = currentNode;
						
						neighbor.g += distanceToTile;
						neighbor.h += neighbor.pos[heuristic](goal) * 10;
						
						var influence = 0;
							
						if(shade) {
							influence = game.map.tile(neighbor.pos.x, neighbor.pos.y).lightLevel() * 50;
						}
						
						neighbor.f += neighbor.g + neighbor.h + influence;
						
						open_list.add(neighbor);
					}
				
				}
			}
			
			return(undefined);
		}
	}

	// AI
	game.AI = {};
	
	game.AI.init = function() {
		game.AI.pather = new AStar(game.map.data, mapSize.x, mapSize.y, function(data, x, y) {
			var blocks = !game.map.data[x][y].walkable;
			
			for(var i = 0; i<game.actors.length; i++) {
				if(game.actors[i].x == x && game.actors[i].y == y && game.actors[i].type !== "player") {
					blocks = true;
				}
			}
			
			if(game.map.data[x][y].type == "lava") {
				blocks = true;
			}
			
			return {
				blocks: blocks
			}
		});
	}
	
	game.AI.randomDir = function() {
		return Math.random() > .5 ? -1 : 1;
	}
	
	game.AI.walker = function(parent) {
		this.parent = parent;
		
		this.go = function() {
			var x = Math.random() > .5 ? -1 : 1;
			var y = Math.random() > .5 ? -1 : 1;
			
			this.parent.move(x, y);
		}
		
		this.surrounded = function() {
			this.surrounded = function() {
				var x_array = [0, -1, -1, -1, 0, 1, 1, 1];
				var y_array = [1, 1, 0, -1, -1, -1, 0, 1];
				var blocked = 0;
				
				for(var i = 0; i<8; i++) {
					var dx = this.parent.x + x_array[i];
					var dy = this.parent.y + y_array[i];
					
					if(game.map.tileBlocked(dx, dy)) {
						blocked++;
					}
					
					for(var j = 0; j<game.actors.length; j++) {
						if(game.actors[j].x == dx && game.actors[j].y == dy && game.actors[j].dead) {
							blocked++;
						}
					}
				}
				
				if(blocked == 8) {
					return true;
				}
				
				return false;
			}
		}
	}

	game.AI.cardinalSeeker = function(parent) {
		this.parent = parent;
		
		this.go = function() {
			// pathfind in only the cardinal directions
			var path = game.AI.pather.path(this.parent.x, this.parent.y, game.player.x, game.player.y, "orthogonal");
			
			if(typeof path !== "undefined") {
				var dx = path[0].pos.x - this.parent.x;
				var dy = path[0].pos.y - this.parent.y;
				this.parent.move(dx, dy);
				return true;
			}
			
			//this.parent.move(game.AI.randomDir(), game.AI.randomDir());
		}
		
		this.surrounded = function() {
			var blocked = 0;
			
			// if we actually place a wall
			if(game.map.tileBlocked(this.parent.x - 1, this.parent.y)) {
				blocked++;
			}
			
			if(game.map.tileBlocked(this.parent.x + 1, this.parent.y)) {
				blocked++;
			}
			
			if(game.map.tileBlocked(this.parent.x, this.parent.y + 1)) {
				blocked++;
			}
			
			if(game.map.tileBlocked(this.parent.x, this.parent.y - 1)) {
				blocked++;
			}
			
			// oh dear, the player is surrounded, special death for him
			if(blocked == 4) {
				return true;
			}
			
			return false;
		}
	}
	
	game.AI.diagonalSeeker = function(parent) {
		this.parent = parent;
		
		this.go = function() {
			// pathfind in only the cardinal directions
			var path = game.AI.pather.path(this.parent.x, this.parent.y, game.player.x, game.player.y, "diagonal");
			if(path !== undefined) {
				var dx = path[0].pos.x - this.parent.x;
				var dy = path[0].pos.y - this.parent.y;
				this.parent.move(dx, dy);
				return true;
			}
			
			this.parent.move(game.AI.randomDir(), game.AI.randomDir());
		}
		
		this.surrounded = function() {
			var blocked = 0;
			
			// if we actually place a wall
			if(game.map.tileBlocked(this.parent.x - 1, this.parent.y-1)) {
				blocked++;
			}
			
			if(game.map.tileBlocked(this.parent.x - 1, this.parent.y+1)) {
				blocked++;
			}
			
			if(game.map.tileBlocked(this.parent.x + 1, this.parent.y + 1)) {
				blocked++;
			}
			
			if(game.map.tileBlocked(this.parent.x + 1, this.parent.y - 1)) {
				blocked++;
			}
			
			// oh dear, the player is surrounded, special death for him
			if(blocked == 4) {
				return true;
			}
			
			return false;
		}
	}
	
	game.AI.magus = function(parent) {
		this.parent = parent;
		
		this.go = function() {
			this.parent.lastBlink++;
			
			// first check if player is in direct orthogonal line of sight
			var canShoot = false,
				character,
				points = [],
				line;
			
			if(game.player.x == this.parent.x || game.player.y == this.parent.y) {
				canShoot = true;
				
				line = getLine(game.player.x, game.player.y, this.parent.x, this.parent.y).reverse();
				
				for(var i = 0; i<line.length; i++) {
					var x = line[i].x;
					var y = line[i].y;
					
					if(!game.map.tile(x, y).walkable) {
						canShoot = false;
					}
										
					for(var j = 0; j<game.actors.length; j++) {
						if(game.actors[j].x == x && game.actors[j].y == y && game.actors[j].type !== "player" && game.actors[j] !== this.parent) {
							canShoot = false;
						}
					}
				}
			}
			
			if(this.parent.lastBlink < 2) {
				canShoot = false;
			}
			
			if(line && line.length < 3) {
				canShoot = false;
			}
			
			if(game.ended == true) {
				canShoot = false;
			}
			
			if(canShoot && line.length < 10) {				
				// animate a shot in the proper direction
				game.input.context = "dead";
				
				if(game.player.x == this.parent.x) { // horizontal line, animate that
					character = "|";
				} else { // otherwise it's a vertical line
					character = "-";
				}
				
				var that = this;
				
				for(var i = 0; i<line.length; i++) {
					(function(i) {
						setTimeout(function() {
							// if we've reached the end of the line
							if(i == line.length - 1) {
								game.over();
								return;
							}
							
							if(i > 0) {
								game.display.draw(game.map.tile(line[i-1].x, line[i-1].y));
							}
							
							game.display.drawTile(line[i].x, line[i].y, character, that.parent.color, game.map.tile(line[i].x, line[i].y).backgroundColor);
						}, i * 100);
					})(i);
				}
				
				return;
			}
			
			if(Math.random() < .95) {
				return;
			}
			
			// we need to store the position here
			var pos = {x: -1, y: -1};
			
			// pick an axis to line up with the player on
			while(!false) {
				switch(Math.random() > .5 ? "x" : "y") {
					case "x":
						// pick a distance along X axis
						var distance = getRandomInt(3, mapSize.x / 2 - 2);
						
						if(Math.random() > .5) {
							distance *= -1;
						}
						
						// get that distance
						pos.x = game.player.x + distance;
						pos.y = game.player.y;
						
						break;
						
					case "y":
						// pick a distance along Y axis
						var distance = getRandomInt(3, mapSize.y / 2 - 2);
						
						if(Math.random() > .5) {
							distance *= -1;
						}
						
						pos.x = game.player.x;
						pos.y = game.player.y + distance;
						
						break;
						
					default:
						break;
				}
				
				// make sure our position is valid
				if(pos.x < 2 || pos.x > mapSize.x - 2 || pos.y < 2 || pos.y > mapSize.y - 2  || !game.map.tile(pos).walkable) {
					continue;
				}
								
				// make the parent go to that spot
				var oldPos = {x: parent.x, y: parent.y};
				parent.moveTo(pos.x, pos.y);
				this.parent.lastBlink = 0;
				break;
			}
		}
		
		this.surrounded = function() {
			return false;
		}
	}
	
	game.AI.coward = function(parent) {
		this.parent = parent;
		
		this.go = function() {
			var escapeRoute = game.AI.pather.path(this.parent.x, this.parent.y, game.player.x, game.player.y, "coward");
			var dx = escapeRoute[0].pos.x - this.parent.x;
			var dy = escapeRoute[0].pos.y - this.parent.y;
			
			var foundEscapeRoute = true;
			
			// iterate through neighbors looking for an escape route, we're right next to the player
			if(escapeRoute[0].pos.x == game.player.x && escapeRoute[0].pos.y == game.player.y) {
				var x_array = [0, -1, -1, -1, 0, 1, 1, 1];
				var y_array = [1, 1, 0, -1, -1, -1, 0, 1];
				for(var i = 0; i<8; i++) {
					// select each neighbor
					var x = this.parent.x + x_array[i];
					var y = this.parent.y + y_array[i];
					
					// determine if one is walkable
					var walkable = false;
					walkable = game.map.tile(x, y).walkable;
					
					// make sure there aren't any actors there
					if(walkable) {
						for(var j = 0; j<game.actors.length; j++) {
							if(game.actors[j].x == x && game.actors[j].y == y) {
								walkable = false;
							}
						}
					}
					
					if(walkable) {
						this.parent.move(x_array[i], y_array[i]);
						return;
					}
				}
			}
			
			this.parent.move(dx, dy);
		}
		
		this.surrounded = function() {
			var x_array = [0, -1, -1, -1, 0, 1, 1, 1];
			var y_array = [1, 1, 0, -1, -1, -1, 0, 1];
			var blocked = 0;
			
			for(var i = 0; i<8; i++) {
				var dx = this.parent.x + x_array[i];
				var dy = this.parent.y + y_array[i];
				
				if(game.map.tileBlocked(dx, dy)) {
					blocked++;
				}
				
				for(var j = 0; j<game.actors.length; j++) {
					if(game.actors[j].x == dx && game.actors[j].y == dy && game.actors[j].dead) {
						blocked++;
					}
				}
			}
			
			if(blocked == 8) {
				return true;
			}
			
			return false;
		}
	}
	
	game.AI.smart = function(parent) {
		this.parent = parent;
		
		this.go = function() {
			// find alive actors
			var allyCount = -1;
			for(var i = 0; i<game.actors.length; i++) {
				if(!game.actors[i].dead) {
					allyCount++;
				}
			}
						
			if(allyCount >= 3) {
				// attack smartly
				var dx = game.player.x - this.parent.x,
					dy = game.player.y - this.parent.y,
					distance = Math.abs(Math.sqrt((dx * dx) + (dy * dy))),
					path;
				
				if(distance > 1.5) {	
					path = game.AI.pather.path(this.parent.x, this.parent.y, game.player.x, game.player.y);
					
					if(path == undefined) {
						return;
					}
					
					dx = path[0].pos.x - this.parent.x;
					dy = path[0].pos.y - this.parent.y;
					
					if(path.length > 2) {	
						this.parent.move(dx, dy);
					} else {
						var neighbors = [], 
							dangerTile;
						
						// find an empty neighbor and move to it
						for(var i = 0; i<8; i++) {
							var n = game.map.tile(this.parent.x + game.AI.pather.x_array[i], this.parent.y + game.AI.pather.y_array[i]);
							if(!n.walkable) {
								continue;
							}
							
							var canMoveThere = true;
							
							// check if there's a monster on the tile
							for(var j = 0; j<game.actors.length; j++) {
								if(game.actors[j].x == n.x && game.actors[j].y == n.y) {
									canMoveThere = false;
								}
							}
							
							if(!canMoveThere) {
								continue;
							}
							
							if(canMoveThere) {	
								neighbors.push(n);
							} else {
								dangerTile = n;
							}
						}
						
						neighbors = shuffle(neighbors);
						
						// if there are no safe tiles to move then add dangerTile
						if(neighbors.length == 0 || Math.random() > .7) {
							neighbors.unshift(dangerTile);
						}
						
						dx = neighbors[0].x - this.parent.x;
						dy = neighbors[0].y - this.parent.y;
						
						this.parent.move(dx, dy);
					}
				} else {
					this.parent.move(dx, dy);
				}
			} else {
				// flee
				this.parent.ai = new game.AI.coward(this.parent);
			}
		}
		
		this.surrounded = function() {
			var x_array = [0, -1, -1, -1, 0, 1, 1, 1];
			var y_array = [1, 1, 0, -1, -1, -1, 0, 1];
			var blocked = 0;
			
			for(var i = 0; i<8; i++) {
				var dx = this.parent.x + x_array[i];
				var dy = this.parent.y + y_array[i];
				
				if(game.map.tileBlocked(dx, dy)) {
					blocked++;
				}
				
				for(var j = 0; j<game.actors.length; j++) {
					if(game.actors[j].x == dx && game.actors[j].y == dy && game.actors[j].dead) {
						blocked++;
					}
				}
			}
			
			if(blocked == 8) {
				return true;
			}
			
			return false;
		}
	}
	
	game.AI.doppleganger = function(parent) {
		this.parent = parent;
		this.parent.wallCount = 6; // can place six walls total
		
		this.castWall = function(tile) {
			if(this.parent.wallCount > 0) {
				tile.setType("wall");
				this.parent.wallCount--;
			}
			
			game.player.surrounded();
		}
		
		this.go = function() {
			if(this.parent.character == "A") {
				this.parent.character = "@";
			} else if(Math.random() > .9) {
				this.parent.character = "A";
			}
			
			if(Math.random() > .95) { // hey, we're going to cast a door! ^_^
				// find a spot next to the player for a door
				var x = game.player.x; 
				var y = game.player.y;
				var neighbors = [];
				
				for(var i = 0; i<8; i++) {
					var dx = x + game.AI.pather.x_array[i];
					var dy = y + game.AI.pather.y_array[i];
					
					if(!game.map.tileBlocked(dx, dy)) {
						neighbors.push(game.map.tile(dx, dy));
					}
				}
				
				if(neighbors.length > 0) {
					this.castWall(shuffle(neighbors)[0]);
					return;
				}
			} else {
				// if we decide to move and not place wall
				var dx = game.player.x - this.parent.x,
					dy = game.player.y - this.parent.y,
					distance = Math.abs(Math.sqrt((dx * dx) + (dy * dy)));
				
				// if we're going to walk we can either run or walk randomly
				if(Math.random() > .5) {
					// ha, we're going to walk randomly
					for(var i = 0; i<8; i++) {
						dx = this.parent.x + game.AI.pather.x_array[i];
						dy = this.parent.y + game.AI.pather.y_array[i];
						
						if(!game.map.tileBlocked(dx, dy) && dx !== game.player.x && dy !== game.player.y) {
							this.parent.move(game.AI.pather.x_array[i], game.AI.pather.y_array[i]);
							return;
						}
					}
				} else {
					// we're going to move with purpose
					if(distance < 6) {
						// if close (within 6 tiles), he moves away from player
						var path = game.AI.pather.path(this.parent.x, this.parent.y, game.player.x, game.player.y, "coward");
						var dx = path[0].pos.x - this.parent.x;
						var dy = path[0].pos.y - this.parent.y;
						this.parent.move(dx, dy);
					} else {
						// if far, he closes to 6 tiles or walks randomly
						var path = game.AI.pather.path(this.parent.x, this.parent.y, game.player.x, game.player.y);
						var dx = path[0].pos.x - this.parent.x;
						var dy = path[0].pos.y - this.parent.y;
						
						// iterate through neighbors looking for an escape route, we're right next to the player
						if(path[0].pos.x == game.player.x && path[0].pos.y == game.player.y) {						
							var x_array = [0, -1, -1, -1, 0, 1, 1, 1];
							var y_array = [1, 1, 0, -1, -1, -1, 0, 1];
							for(var i = 0; i<8; i++) {
								// select each neighbor
								var x = this.parent.x + x_array[i];
								var y = this.parent.y + y_array[i];
								
								// determine if one is walkable
								var walkable = game.map.tile(x, y).walkable;
								
								// make sure there aren't any actors there
								if(walkable) {
									for(var j = 0; j<game.actors.length; j++) {
										if(game.actors[j].x == x && game.actors[j].y == y) {
											walkable = false;
										}
									}
								}
								
								if(walkable) {
									this.parent.move(x_array[i], y_array[i]);
									return;
								}
							}
						}
						this.parent.move(dx, dy);
					}
				}
			}
		}
		
		this.surrounded = function() {
			var x_array = [0, -1, -1, -1, 0, 1, 1, 1];
			var y_array = [1, 1, 0, -1, -1, -1, 0, 1];
			var blocked = 0;
			
			for(var i = 0; i<8; i++) {
				var dx = this.parent.x + x_array[i];
				var dy = this.parent.y + y_array[i];
				
				if(game.map.tileBlocked(dx, dy)) {
					blocked++;
				}
				
				for(var j = 0; j<game.actors.length; j++) {
					if(game.actors[j].x == dx && game.actors[j].y == dy && game.actors[j].dead) {
						blocked++;
					}
				}
			}
			
			if(blocked == 8) {
				return true;
			}
			
			return false;
		}
	}
	
	game.AI.shade = function(parent) {
		this.parent = parent;
		
		this.go = function() {
			// attempt to stay out of lit tiles
			var path = game.AI.pather.path(this.parent.x, this.parent.y, game.player.x, game.player.y, "shade");
			var dx = path[0].pos.x - this.parent.x;
			var dy = path[0].pos.y - this.parent.y;
			
			if(game.map.tile(path[0].pos.x, path[0].pos.y).lightLevel() > 0) {
				dx = Math.random() > .5 ? -1 : 1;
				dy = Math.random() > .5 ? -1 : 1;
				
				while(!(game.map.tile(this.parent.x + dx, this.parent.y + dy).lightLevel() - 
						game.map.tile(this.parent.x, this.parent.y).lightLevel() > 0) && 
						!this.parent.move(dx, dy)) {
					dx = Math.random() > .5 ? -1 : 1;
					dy = Math.random() > .5 ? -1 : 1;
				}
			} else {
				this.parent.move(dx, dy);
			}
		}
		
		this.surrounded = function() {
			this.surrounded = function() {
				var x_array = [0, -1, -1, -1, 0, 1, 1, 1];
				var y_array = [1, 1, 0, -1, -1, -1, 0, 1];
				var blocked = 0;
				
				for(var i = 0; i<8; i++) {
					var dx = this.parent.x + x_array[i];
					var dy = this.parent.y + y_array[i];
					
					if(game.map.tileBlocked(dx, dy)) {
						blocked++;
					}
					
					for(var j = 0; j<game.actors.length; j++) {
						if(game.actors[j].x == dx && game.actors[j].y == dy && game.actors[j].dead) {
							blocked++;
						}
					}
				}
				
				if(blocked == 8) {
					return true;
				}
				
				return false;
			}
		}
	}
	
	game.AI.demonMage = function(parent) {
		this.parent = parent;
		
		this.go = function() {
			this.parent.color = {r: (getRandomInt(1, 10) * 10) + 100, g: 0, b: 0};
			var path;
			var allyCount = -1;
			for(var i = 0; i<game.actors.length; i++) {
				if(!game.actors[i].dead) {
					allyCount++;
				}
			}
			
			// var t = game.map.tile(this.parent.x, this.parent.y)
			// t.setType("lava");
			// game.display.draw(t);
			// game.lavaTiles.push(t);
			
			var dx = game.player.x - this.parent.x,
				dy = game.player.y - this.parent.y,
				distance = Math.abs(Math.sqrt((dx * dx) + (dy * dy)));
			
			if(allyCount > 1 && distance < 12) {
				path = game.AI.pather.path(this.parent.x, this.parent.y, game.player.x, game.player.y, "coward");
			} else if(distance > 4) {
				path = game.AI.pather.path(this.parent.x, this.parent.y, game.player.x, game.player.y);
			} else if(distance < 6 && distance > 2.5 && (game.player.x == this.parent.x || game.player.y == this.parent.y)) {
				// close enough for mage beams
				if(Math.random() > .4) {
					var canShoot = false, line;
					
					if(game.player.x == this.parent.x || game.player.y == this.parent.y) {
						canShoot = true;
						
						line = getLine(game.player.x, game.player.y, this.parent.x, this.parent.y).reverse();
						
						for(var i = 0; i<line.length; i++) {
							var x = line[i].x;
							var y = line[i].y;
							
							if(!game.map.tile(x, y).walkable) {
								canShoot = false;
							}
												
							for(var j = 0; j<game.actors.length; j++) {
								if(game.actors[j].x == x && game.actors[j].y == y && game.actors[j].type !== "player" && game.actors[j] !== this.parent) {
									canShoot = false;
								}
							}
						}
					} else {
						return;
					}
					
					if(line && line.length < 3) {
						canShoot = false;
					}
					
					if(game.ended == true) {
						canShoot = false;
					}
										
					if(canShoot && line.length < 6) {	
						// animate a shot in the proper direction
						game.input.context = "dead";
						
						if(game.player.x == this.parent.x) { // horizontal line, animate that
							character = "|";
						} else { // otherwise it's a vertical line
							character = "-";
						}
						
						for(var i = 0; i<line.length; i++) {
							(function(i) {
								setTimeout(function() {
									// if we've reached the end of the line
									if(i == line.length - 1) {
										game.over();
										return;
									}
									
									if(i > 0) {
										var t = game.map.tile(line[i-1].x, line[i-1].y);
										game.display.draw(t);
									}
									
									game.display.drawTile(line[i].x, line[i].y, character, "red", game.map.tile(line[i].x, line[i].y).backgroundColor);
								}, i * 100);
							})(i);
						}
						
						return;
					}
				}
				
				return;
			} else if(distance < 2.5) {
				// we need to run away from the player
				path = game.AI.pather.path(this.parent.x, this.parent.y, game.player.x, game.player.y, "coward");
			}

			// if we can't find a way to reach the player
			if(path == undefined) {
				// pick tile closest to player from this one
				if(distance < 2.5) {
					var dx = this.parent.x - game.player.x;
					var dy = this.parent.y - game.player.y;
				} else {
					var dx = game.player.x - this.parent.x;
					var dy = game.player.y - this.parent.y;
				}
				
				var distance = Math.sqrt(dx * dx + dy * dy);
				
				dx = Math.round(dx / distance);
				dy = Math.round(dy / distance);
				
				var t = game.map.tile(this.parent.x + dx, this.parent.y + dy);
				
				// if it's lava or wall, make it floor
				if(t.type == "lava" || t.type == "wall") {
					t.setType("floor");
				}
				
				return;
			}
			
			var dx = path[0].pos.x - this.parent.x;
			var dy = path[0].pos.y - this.parent.y;
			
			this.parent.move(dx, dy);
		}
		
		this.surrounded = function() {
			return false;
		}
	}
})();