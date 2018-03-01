game.Projectile = function(x, y, speed, targetX, targetY, color, verticalCharacter, horizontalCharacter) {
	this.x = x;
	this.y = y;
	
	this.color = color || "blue";
	
	this.target = {
		x: targetX,
		y: targetY
	}
	
	this.verticalCharacter = verticalCharacter || "|";
	this.horizontalCharacter = horizontalCharacter || "-";
	
	this.speed = speed;
	
	/*this.fire = function() {
		if(this.axis === "x") {
			if(this.x < this.target.x) {
				// travelling to the right
				while(this.x <= this.target.x)
					var t = game.map.tile(x, this.y);
					if(!t.walkable) {
						return;
					}
					
					for(var i = 0; i<game.actors.length; i++) {
						if(game.actors[i].x == x && game.actors[i].y == this.y) {
							// hit an actor
							if(game.actors[i].type === "player") {
								this.animate();
								return;
							} else {
								return;
							}
						}
					}
					
					this.x++;
				}
			} else if(this.x > this.target.x) {
				// travelling to the left
				for(var x = this.x; x > this.x - speed; x--) {
					var t = game.map.tile(x, this.y);
					if(!t.walkable) {
						return;
					}
					
					for(var i = 0; i<game.actors.length; i++) {
						if(game.actors[i].x == x && game.actors[i].y == this.y) {
							// hit an actor
							if(game.actors[i].type === "player") {
								this.animate();
								return;
							} else {
								return;
							}
						}
					}
				}
			}
		} else if (this.axis === "y") {
			if(this.y < this.target.y) {
				// travelling downwards
				for(var y = this.y; y<this.y + speed; y++) {
					var t = game.map.tile(this.x, y);
					if(!t.walkable) {
						return false;
					}
				}
			} else if(this.y > this.target.y) {
				// travelling upwards
				for(var y = this.y; y>this.y - speed; y--) {
					var t = game.map.tile(this.x, y);
					if(!t.walkable) {
						return false;
					}
				}
			}
		}
	}*/
	
	this.check = function() {
		
	}

	this.init = function() {
		game.projectiles.push(this);
		
		this.axis = (this.x - this.target.x !== 0) ? "x" : "y";
		this.currentCharacter = (this.axis == "x") ? this.horizontalCharacter : this.verticalCharacter;
	}
	
	this.init();
}