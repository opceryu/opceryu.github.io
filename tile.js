function Tile(x_,y_){
	this.gridX = x_;
	this.gridY = y_;
	this.posX = x_ * tileSize;
	this.posY = y_ * tileSize;
	this.posSplit = false;
	this.negSplit = false;
	this.center = 0;
	this.top = 0;
	this.right = 0;
	this.bottom = 0;
	this.left = 0;
	this.topLeft = 0;
	this.bottomRight = 0;	
	this.topRight =0;
	this.bottomLeft = 0;
	this.owner = 0;
	this.defaultCol = color(180);
	this.selectCol = color(255,255,0);
	this.lineCol = color(0,255,0);
	this.color = this.defaultCol;

	this.render = function(){
		stroke(0)
		strokeWeight(1);
		fill(this.color);
		rect(this.posX, this.posY, tileSize, tileSize);

		if(this.posSplit && this.negSplit){
			line(this.posX,this.posY,this.posX+tileSize,this.posY+tileSize);
			line(this.posX,this.posY+tileSize,this.posX+tileSize,this.posY);
			drawSymbol(this.top, this.posX + tileSize*1/3, this.posY, 1/3);
			drawSymbol(this.right, this.posX + tileSize*2/3, this.posY + tileSize*1/3, 1/3);
			drawSymbol(this.bottom, this.posX + tileSize*1/3, this.posY + tileSize*2/3, 1/3);
			drawSymbol(this.left, this.posX, this.posY + tileSize*1/3, 1/3);
		}

		else if(this.posSplit){
			line(this.posX,this.posY+tileSize,this.posX+tileSize,this.posY);
			drawSymbol(this.topLeft, this.posX, this.posY, 0.5);
			drawSymbol(this.bottomRight, this.posX + tileSize/2, this.posY + tileSize/2, 0.5);
		}

		else if(this.negSplit) {
			line(this.posX,this.posY,this.posX+tileSize,this.posY+tileSize);
			drawSymbol(this.topRight, this.posX + tileSize/2, this.posY, 0.5);
			drawSymbol(this.bottomLeft, this.posX, this.posY + tileSize/2, 0.5);
		}

		else{
			drawSymbol(this.center, this.posX, this.posY, 1);
		}
	}

	this.calculateOwner = function(){
		var sum;
		this.lineCol = color(255,0,0);

		if(this.posSplit && this.negSplit){
			sum = this.top + this.right + this.bottom + this.left;
		}
		else if(this.posSplit){
			sum = this.topLeft + this.bottomRight;
		}
		else if (this.negSplit){
			sum = this.bottomLeft + this.topRight;
		}
		else{
			sum = this.center;
		}
		if(sum == 0){
			this.owner = 0;
		}
		else if(sum > 0){
			this.owner = 1;
		}

		else if(sum < 0){
			this.owner = -1;
		}
	}

	this.change = function() {
		if(lineMode){
			this.line();
		} else {
			this.default();
		}	
	}

	this.select = function() {
		this.color = this.selectCol;
	}

	this.default = function() {
		this.color = this.defaultCol;
	}

	this.line = function() {
		this.color = this.lineCol;
	}
}

function drawX(x,y){
	stroke(0);
	strokeWeight(4);
	line(x + (tileSize/5) , y + (tileSize/5), x + (tileSize/5) * 4, y + (tileSize/5) * 4);
	line(x + (tileSize/5) * 4, y + (tileSize/5), x + (tileSize/5), y + (tileSize/5) * 4);
}

function drawO(x,y){
	stroke(0);
	fill(0,0);
	strokeWeight(4);
	ellipse(x + tileSize/2, y + tileSize/2, (tileSize/5) * 4,  (tileSize/5) * 4);
}

function drawSymbol(side, x, y,s){
	push();
	scale(s);

	if (side == 1) {
		drawX(x/s,y/s);
	}
	else if (side == -1){
		drawO(x/s,y/s);
	}
	pop();
}
