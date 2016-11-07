var mapArrays = [];

// Constructor for locations, defaults to floor type
function Location(yCoord, xCoord) {
  this.y = yCoord;
  this.x = xCoord;
	this.canMove = true;
  this.description = "A floor tile.";
  this.terrainType = "floor";
  this.playerHere = false;
  this.symbol = "#";
  this.color = "white";
}

// 2d square array creator. Confirmed to work.
function mapCreator(ySize, xSize) {
  mapArrays = [];
	for(var idx = 0; idx < ySize; idx++) {
  	mapArrays[idx] = [];
  	for(var idx2 = 0; idx2 < xSize; idx2++) {
    	// Locations could be pushed here.
      var tempLocation = new Location(idx, idx2);
    	mapArrays[idx].push(tempLocation);
    }
  }
}

// Function that would make all of the borders of a room into walls. Needs to be validated.
function wallMaker() {
	var height = mapArrays.length;
  // Because it's a square we only need to check the length of one line.
  var width = mapArrays[0].length;
  var bottomRowY = mapArrays.length-1;
  var lastColumnX = mapArrays[0].length - 1;
  // A little callback function created inside wallMaker so that we don't have to repeat the same 3 commands.
  function waller(wallThis) {
    wallThis.canMove = false;
    wallThis.description = "A wall.";
  	wallThis.terrainType = "wall";
    wallThis.symbol = "^";
    wallThis.color = "green";
    // Or whatever symbol we want to set it to.
  }
  // Walls the top row.
  for(var idx = 0; idx < width; idx++) {
  	var toWall = mapArrays[0][idx];
    waller(toWall);
  }
  // Walls the bottom row.
  for(var idx = 0; idx < width; idx++) {
  	var toWall = mapArrays[bottomRowY][idx];
    waller(toWall);
  }
  // Walls the sides. Ignores the top and bottom rows since they're already done.
  for(var idx = 1; idx < height-1; idx++) {
  	var toWall1 = mapArrays[idx][0];
    var toWall2 = mapArrays[idx][lastColumnX];
    waller(toWall1);
    waller(toWall2);
  }
}

// Function to display the map in html
function mapDisplayer() {
  $("#map-display").empty();
  for(var idx = 0; idx < mapArrays.length; idx++) {
    var tempString = "";
    for(var idx2 = 0; idx2 < mapArrays[idx].length; idx2++) {
      tempString += "<span id=\"location-" + idx + "," + idx2 + "\" class=\"" + mapArrays[idx][idx2].color + "\">" + mapArrays[idx][idx2].symbol +"</span>";
    }
    $("#map-display").append("<p>" + tempString + "</p>");
  }
}

// Front-end below this line

$(function() {
  mapCreator(10,10);
  wallMaker();
  mapDisplayer();
})
