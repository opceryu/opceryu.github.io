var tileSize;
var grid;
var originalGrid;

var History = [];
var ristory = [];

var selection;
var tr2bl = [];
var tl2br = [];
var br2tl = [];
var bl2tr = [];
var linedTiles = [];

var turnOwner; // 1 is X, -1 is O
var winner;
var gridD = 11;
var winLineStartX;
var winLineStartY;
var winLineEndX;
var winLineEndY;
var resButton;
var modeButton;
var undoButton;
var redoButton;
var lineMode;

function setup() {
	var canvas = createCanvas(600, 600);
	canvas.parent('sketch-holder');
	
	resButton = select('#restart');
	modeButton = select('#mode');
	undoButton = select('#undo');
	redoButton = select('#redo');

	resButton.mousePressed(restart);
	modeButton.mousePressed(changeMode);
	undoButton.mousePressed(undo);
	redoButton.mousePressed(redo);
	
	restart();
}

function draw() {
	background(100);

	grid.forEach(function(t) {
		t.render();
	});

	stroke(0);
	completeLines();
	stroke(255,0,0);
	strokeWeight(4);
	line(winLineStartX, winLineStartY, winLineEndX, winLineEndY);
}

function mousePressed() {
	if(!lineMode){
		grid.forEach(function(t) {
	    	var x = t.posX;
	    	var y = t.posY;

	    	if(mouseX >= x && mouseX <= x + tileSize && mouseY >= y && mouseY <= y + tileSize){
	    		var mX = mouseX - x - tileSize/2;
	    		var mY = mouseY - y - tileSize/2;

	    		if(!(t.posSplit || t.negSplit) && t.center == 0){
	    			t.center = turnOwner;
	    			validPlay(t);
	    		}

	    		else if(t.posSplit && t.negSplit){
	    			if(mX > mY && mX < -mY && t.top == 0){
	    				t.top = turnOwner;
	    				validPlay(t);
	    			}

	    			else if(mX > mY && mX > -mY && t.right == 0){
	    				t.right = turnOwner;
	    				validPlay(t);
	    			}

	    			else if(mX < mY && mX > -mY && t.bottom == 0){
	    				t.bottom = turnOwner;
	    				validPlay(t);
	    			}

	    			else if(mX < mY && mX < -mY && t.left == 0){
	    				t.left = turnOwner;
	    				validPlay(t);
	    			}
	    			
	    		}

	    		else if(t.posSplit){
	    			if(mX < -mY && t.topLeft == 0){
	    				t.topLeft = turnOwner;
	    				validPlay(t);
	    			}
	    			else if(mX > -mY && t.bottomRight == 0){
	    				t.bottomRight = turnOwner;
	    				validPlay(t);
	    			}
	    		}

	    		else if(t.negSplit) {
	    			if(mX > mY && t.topRight == 0){
	    				t.topRight = turnOwner;
	    				validPlay(t);
	    			}
					else if(mX < mY && t.bottomLeft == 0){
						t.bottomLeft = turnOwner;
						validPlay(t);
					}

	    		}
	    		
	    	}
		});
	} else {
		if(!(selection >= 0)){
			for (var i = 0; i < grid.length; i++) {
				t = grid[i]
				var x = t.posX;
		    	var y = t.posY;

		    	if(mouseX >= x && mouseX <= x + tileSize && mouseY >= y && mouseY <= y + tileSize){
		    		if(t.owner == 0){
		    			selection = i;
		    			print(selection);
		    			selectTile();
		    			break;
		    		}
		    	}
			}	
		}
		
		else {		
			for (var j = 0; j < grid.length; j++) {
				t = grid[j]
				var x = t.posX;
		    	var y = t.posY;

		    	if(mouseX >= x && mouseX <= x + tileSize && mouseY >= y && mouseY <= y + tileSize && j!=selection){
		    		for (var i = 0; i < tr2bl.length; i++) {
		    			if(tr2bl[i] == j) {
		    				for (var g = i; g >= 0; g--) {
		    					grid[tr2bl[g]].posSplit = true;
		    					var tu = $.extend({} ,grid[tr2bl[g]]);
		    					tu.default();
		    					linedTiles.push(tu);
		    				}
		    				validLine();
		    				break;
		    			}
		    		}
		    		for (var i = 0; i < tl2br.length; i++) {
		    			if(tl2br[i] == j) {
		    				for (var g = i; g >= 0; g--) {
		    					grid[tl2br[g]].negSplit = true;
		    					var tu = $.extend({} ,grid[tl2br[g]]);
		    					tu.default();
		    					linedTiles.push(tu);
		    				}
		    				validLine();
		    				break;
		    			}
		    		}
		    		for (var i = 0; i < br2tl.length; i++) {
		    			if(br2tl[i] == j) {
		    				for (var g = i; g >= 0; g--) {
		    					grid[br2tl[g]].negSplit = true;
		    					var tu = $.extend({} ,grid[br2tl[g]]);
		    					tu.default();
		    					linedTiles.push(tu);
		    				}
		    				validLine();
		    				break;
		    			}
		    		}
		    		for (var i = 0; i < bl2tr.length; i++) {
		    			if(bl2tr[i] == j) {
		    				for (var g = i; g >= 0; g--) {
		    					grid[bl2tr[g]].posSplit = true;
		    					var tu = $.extend({} ,grid[bl2tr[g]]);
		    					tu.default();
		    					linedTiles.push(tu);
		    				}
		    				validLine();
		    				break;
		    			}
		    		}
		    	}
			}
		}
	}
}

function mouseReleased(){
	noLoop();
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    undo();
  } else if (keyCode === RIGHT_ARROW) {
    redo();
  }
}

function keyTyped() {
	if (key === 'l'){
		changeMode();
	}
}

function createGrid(){
	for (var x = 0; x < gridD; x++) {
		for (var y = 0; y < gridD; y++) {
			var t = new Tile(x,y);
			if (x == y){
				t.negSplit = true;
			}
			if (x == gridD - (y + 1)){
				t.posSplit = true;
			}
			grid.push(t);
		}
	}
}

function createOriginal(){
	for (var x = 0; x < gridD; x++) {
		for (var y = 0; y < gridD; y++) {
			var t = new Tile(x,y);
			if (x == y){
				t.negSplit = true;
			}
			if (x == gridD - (y + 1)){
				t.posSplit = true;
			}
			originalGrid.push(t);
		}
	}
}

function completeLines(){
	line(width - 1, height, width - 1, 0);
	line(width, height - 1, 0, height - 1);
}

function checkWin(){
	for (var i = 3; i < grid.length; i++) {
		//vertical win
		if(grid[i].owner != 0 
			&& grid[i-2].owner == grid[i-3].owner 
			&& grid[i].owner == grid[i-2].owner
			&& grid[i].owner == grid[i-1].owner){
			
			winLineStartX = grid[i-3].posX + tileSize/2;
			winLineStartY = grid[i-3].posY + tileSize/4;
			winLineEndX = grid[i].posX + tileSize /2;
			winLineEndY = grid[i].posY + tileSize * 3/4;
		}
		//horizantal win
		else if(i > gridD * 3 - 1
			&& grid[i].owner != 0
			&& grid[i].owner == grid[i - gridD].owner
			&& grid[i - gridD * 2].owner == grid[i - gridD * 3].owner
			&& grid[i].owner == grid[i - gridD * 2].owner){

			winLineStartX = grid[i- gridD * 3].posX + tileSize/4;
			winLineStartY = grid[i- gridD * 3].posY + tileSize/2;
			winLineEndX = grid[i].posX + tileSize * 3/4;
			winLineEndY = grid[i].posY + tileSize /2;
		}
		//positive diagonal win
		else if(i > gridD * 3 - 1
			&& grid[i].owner != 0
			&& grid[i].owner == grid[i - gridD + 1].owner
			&& grid[i - gridD * 2 + 2].owner == grid[i - gridD * 3 + 3].owner
			&& grid[i].owner == grid[i - gridD * 2 + 2].owner){

			winLineStartX = grid[i- gridD * 3 + 3].posX + tileSize /4;
			winLineStartY = grid[i- gridD * 3 + 3].posY + tileSize * 3/4;
			winLineEndX = grid[i].posX + tileSize * 3/4;
			winLineEndY = grid[i].posY + tileSize /4;
		}
		//negative diaganal win
		else if(i > gridD * 3 + 2
			&& grid[i].owner != 0
			&& grid[i].owner == grid[i - gridD - 1].owner
			&& grid[i - gridD * 2 - 2].owner == grid[i - gridD * 3 - 3].owner
			&& grid[i].owner == grid[i - gridD * 2 - 2].owner){

			winLineStartX = grid[i- gridD * 3 - 3].posX + tileSize /4;
			winLineStartY = grid[i- gridD * 3 - 3].posY + tileSize /4;
			winLineEndX = grid[i].posX + tileSize * 3/4;
			winLineEndY = grid[i].posY + tileSize * 3/4;
		}
	}
}

function restart(){
	turnOwner = 1;
	grid = [];
	originalGrid = [];
	History = [];
	ristory = [];
	selection = -1;
	tr2bl = [];
	tl2br = [];
	br2tl = [];
	bl2tr = [];
	linedTiles = [];
	firstPlay = false;
	tileSize = height / gridD;
	createGrid();
	createOriginal();
	background(100);

	winLineStartX = -5;
	winLineStartY = -5;
	winLineEndX = -5;
	winLineEndY = -5;
	lineMode = false;

	grid.forEach(function(t) {
    	t.render();
	});
	completeLines();

	noLoop();
}

function changeMode(){
	lineMode = !lineMode;
	grid.forEach(function(t) {
		t.change();
	});
	selection = -1;
	tr2bl = [];
	tl2br = [];
	br2tl = [];
	bl2tr = [];
	linedTiles = [];
	loop();
}

function undo(){
	var last = History[History.length - 1]
	var lX = last.gridX;
	var lY = last.gridY;
	var broken = false;
	var gridI = 0;

	if(!(Array.isArray(last))){
		//finding the index number of the tile to undo
		for (var i = 0; i < grid.length; i++) {
			if(grid[i].gridX == lX && grid[i].gridY == lY){
				gridI = i;
				break;
			}
		}

		ristory.push($.extend({}, grid[gridI]));

		for (var j = History.length - 2; j >= 0; j--) {
			if(!(Array.isArray(History[j]))){
				if(History[j].gridX == lX && History[j].gridY == lY){ 
		    		broken = true;
		    		grid[gridI] = History[j];
		    		break;
		    	}	
			} else {
				for (var i = 0; i < History[j].length; i++) {
					if(History[j][i].gridX == lX && History[j][i].gridY == lY){
						broken = true;
						grid[gridI] = History[j][i];
					}
				}
			}    	
		}

		if(!broken) {
			grid[gridI] = originalGrid[gridI];
		}
	} else {
		var tempRist = [];
		console.log(last.length);
		for (var g = 0; g < last.length; g++) {
			console.log(g);
			var arrayLast = last[g];
			var alX = arrayLast.gridX;
			var alY = arrayLast.gridY;
			var aBroken = false;
			var aGridI = 0;

			for (var i = 0; i < grid.length; i++) {
				if(grid[i].gridX == alX && grid[i].gridY == alY){
					aGridI = i;
					break;
				}
			}

			tempRist.push($.extend({}, grid[aGridI]));

			for (var j = History.length - 2; j >= 0; j--) {
				if(!(Array.isArray(History[j]))){
					if(History[j].gridX == alX && History[j].gridY == alY){ 
		    			aBroken = true;
		    			grid[aGridI] = History[j];
		    			break;
		    		}
				} else {
					for (var i = 0; i < History[j].length; i++) {
						var element = History[j][i];
						if(History[j][i].gridX == alX && History[j][i].gridY == alY){ 
			    			aBroken = true;
			    			grid[aGridI] = History[j][i];
			    			break;
			    		}
					}
				}
				if(!aBroken) {
					grid[aGridI] = originalGrid[aGridI];
				}
			}
		}

		ristory.push($.extend([], tempRist));
	}
	
	turnOwner *= -1;
	History.pop();
	loop();
}

function redo(){

	if (ristory.length >= 1) {
		var re = ristory[ristory.length - 1];

		if(!(Array.isArray(re))){
			var rX = re.gridX;
			var rY = re.gridY;

			for (var i = 0; i < grid.length; i++) {
				if(grid[i].gridX == rX && grid[i].gridY == rY){
					grid[i] = re;
					break;
				}
			}
			History.push(re);
			ristory.pop();
			turnOwner *= -1;
			loop();
		} else {
			for (var i = 0; i < re.length; i++) {
				var rX = re[i].gridX;
				var rY = re[i].gridY;

				for (var j = 0; j < grid.length; j++) {
					if(grid[j].gridX == rX && grid[j].gridY == rY){
						grid[j] = re[i];
						break;
					}
				}
			}
			History.push(re);
			ristory.pop();
			turnOwner *= -1;
			loop();
		}
	}
}

function validPlay(tile){
	tile.calculateOwner();
	checkWin();
	turnOwner *= -1;
	
	History.push($.extend({} ,tile));
	ristory = [];

	loop();
}

function selectTile(){
	grid.forEach(function(t) {
		t.default();
	});
	sel = grid[selection];

			//topleft to bottom right
	for (var i = selection; i < grid.length; i+= gridD + 1) {
		t = grid[i];
		if((t.owner != 0 || i % gridD == 0) && i != selection){
			break;
		} else {
			t.line();
			tl2br.push(i);
		}
	}
	//topright to bottom left
	for (var i = selection; i > 0; i-= gridD - 1) {
		t = grid[i];
		if((t.owner != 0 || i % gridD == 0) && i != selection){
			break;
		} else {
			t.line();
			tr2bl.push(i);
		}
	}
	//bottomleft to top right
	for (var i = selection; i < grid.length; i+= gridD - 1) {
		t = grid[i];
		if((t.owner != 0 || i % gridD == gridD - 1) && i != selection){
			break;
		} else {
			t.line();
			bl2tr.push(i);
		}
	}
	//bottomright to top left
	for (var i = selection; i >= 0; i-= gridD + 1) {
		t = grid[i];
		if((t.owner != 0 || i % gridD == gridD - 1) && i != selection){
			break;
		} else {
			t.line();
			br2tl.push(i);
		}
	}


	sel.select();
	loop();
}

function validLine(){
	turnOwner *= -1;
	lineMode = false;
	selection = -1;
	tr2bl = [];
	tl2br = [];
	br2tl = [];
	bl2tr = [];
	grid.forEach(function(t) {
		t.default();
	});
	History.push($.extend([] ,linedTiles));
	linedTiles = [];
	loop();
}

function test(){
	console.log(Array.isArray("a"));
}








