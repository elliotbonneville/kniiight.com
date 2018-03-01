function AStar(e,t,n,r){this.x_array=[0,-1,-1,-1,0,1,1,1];this.y_array=[1,1,0,-1,-1,-1,0,1];this.data=e;this.mapSize={x:t,y:n};this.getTile=r;var i=this;if(!this.data){console.log("Please provide data for AStar to find a path with.")}if(!this.getTile){console.log("Please provide a tile data retrieval function for AStar to run.")}this.Vector2=function(e,t){this.x=e;this.y=t;this.add=function(e){return new i.Vector2(this.x+e.x,this.y+e.y)};this.distance=function(e){var t=e.x-this.x;var n=e.y-this.y;return Math.abs(Math.sqrt(t*t+n*n))};this.manhattan=function(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)};this.clone=function(){return new i.Vector2(this.x,this.y)};this.toString=function(){return"("+this.x+", "+this.y+")"}};this.PathNode=function(e,t,n,r){this.pos=e;this.f=r;this.g=t;this.h=n};this.NodeList=function(){this.nodes=[];this.add=function(e){for(var t=0;t<this.nodes.length;t++){if(this.nodes[t].f<=e.f){this.nodes.splice(t,0,e);return}}this.nodes.push(e)};this.pop=function(){return this.nodes.splice(this.nodes.length-1,1)[0]};this.getNode=function(e){for(var t=0;t<this.nodes.length;t++){if(this.nodes[t].pos.x==e.pos.x&&this.nodes[t].pos.y==e.pos.y){return this.nodes.splice(t,1)[0]}}return-1};this.hasNode=function(e){for(var t=0;t<this.nodes.length;t++){if(this.nodes[t].pos.x==e.pos.x&&this.nodes[t].pos.y==e.pos.y){return true}}return false};this.length=function(){return this.nodes.length}};this.path=function(e,t,n,r){var i=new this.Vector2(e,t);var s=new this.Vector2(n,r);var o=new this.NodeList;o.add(new this.PathNode(i,i.manhattan(s)*10,0,i.manhattan(s)*10));var u=new this.NodeList;while(o.length()>0){var a=o.pop();u.add(a);if(a.pos.x==s.x&&a.pos.y==s.y){var f=[];var l=a;while(true){f.push(l.pos);l=l.parent;if(l.pos.x==i.x&&l.pos.y==i.y)break}return f.reverse()}for(var c=0;c<8;c++){var h=new this.Vector2(a.pos.x+this.x_array[c],a.pos.y+this.y_array[c]);var p=new this.PathNode(h,0,0,0);if(p.pos.x<0||p.pos.y<0||p.pos.x>this.mapSize.x-1||p.pos.y>this.mapSize.y-1){continue}if(u.hasNode(p)||this.getTile(this.data,p.pos.x,p.pos.y).blocks){continue}var d=10;if(c==1||c==3||c==5||c==7){d=14}if(o.hasNode(p)){p=o.getNode(p);if(p.g<a.g){p.parent=a;p.g+=a.g+d;p.h+=p.pos.distance(s)*10;p.f+=p.g+p.h}o.add(p)}else{p.parent=a;p.g+=d;p.h+=p.pos.distance(s)*10;p.f+=p.g+p.h;o.add(p)}}}return undefined}}