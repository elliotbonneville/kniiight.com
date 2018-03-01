// uses shadowcasting to calculate lighting at specified position
function Light() {
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
	
	// multipliers for transforming coordinates into other octants.
	this.mult = [
					[1,  0,  0, -1, -1,  0,  0,  1],
					[0,  1, -1,  0,  0, -1,  1,  0],
					[0,  1,  1,  0,  0, -1, -1,  0],
					[1,  0,  0,  1, -1,  0,  0, -1]
				];
	
	// calculates an octant. Called by the this.calculate when calculating lighting
	this.calculateOctant = function(cx, cy, row, start, end, radius, xx, xy, yx, yy, id) {	
		// this.tiles.push({
		// 	x: cx,
		// 	y: cy,
		// 	lightLevel: 0,
		// 	color: this.color
		// });
		
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

							var t = game.map.tile(X, Y);
							var l = Math.max(.2, 1 - (d / (this.radius * this.radius)));
							
							// add the light interaction to the tile
							t.lighting.push(new game.lighting.LightInteraction(this.color, l));
						} 
						
						if(blocked) {
							if(game.map.tile(X, Y).blocksSight) {
								new_start = r_slope;
								continue;
							} else {
								blocked = false;
								start = new_start;
							}
						} else {
							if(game.map.tile(X, Y).blocksSight && i < radius) {
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
	
	// calculate light
	this.calculate = function(lightSource) {
		var that = this,
			i;
		
		// update the internal variables used for calculation
		this.position = new Vector2(lightSource.owner.x, lightSource.owner.y);
		this.radius = lightSource.strength;
		this.color = lightSource.color;
		
		// update the tile the light is on because it won't be calculated
		game.map.tile(this.position.x, this.position.y).lighting = [{
			color: lightSource.color,
			strength: this.radius
		}];
		
		// calculate each octant
		for(i = 0; i<8; i++) {
			this.calculateOctant(this.position.x, this.position.y, 1, 1.0, 0.0, this.radius, 
				this.mult[0][i], this.mult[1][i], this.mult[2][i], this.mult[3][i], 0);
		}
	}
}