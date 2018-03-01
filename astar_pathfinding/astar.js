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
					if(curNode.pos.x == start.x && curNode.pos.y == start.y) break;
				}
				
				return finalPath.reverse();
			}
			
			// otherwise loop through this tile's neighbors
			for(var i=0; i<8; i++) {
				var neighborPos = new this.Vector2(currentNode.pos.x + this.x_array[i], currentNode.pos.y + this.y_array[i]);
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