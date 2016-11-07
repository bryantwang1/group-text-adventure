var mapArrays = [];
var userCommands = [];

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
  this.searchable = false;
  this.spawnChance = 10;
}
// Prototype method that increases spawn chance by the argument
Location.prototype.increaseSpawn = function(percentage) {
  this.spawnChance += percentage;
}
// Prototype method that resets the spawn chance
Location.prototype.resetSpawn = function() {
  this.spawnChance += 10;
}
// Function to apply the adjusted spawn chance to every tile
function adjustSpawn(percentage) {
  for(var idx = 0; idx < mapArrays.length; idx++) {
    for(var idx2 = 0; idx2 < mapArrays[idx].length; idx2++) {
      mapArrays[idx][idx2].increaseSpawn(percentage);
    }
  }
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
      tempString += "<span id=\"location-" + idx + "-" + idx2 + "\" class=\"" + mapArrays[idx][idx2].color + "\">" + mapArrays[idx][idx2].symbol +"</span>";
    }
    $("#map-display").append("<p>" + tempString + "</p>");
  }
}

// Doesn't really do anything yet, but this is how I would check for the properties of the player's surroundings. Of course, this would mean the player need properties called "x" and "y" to show where the player is.
function surroundingChecker(player) {
  var y = player.y - 1;
	var x = player.x - 1;
  userCommands = [];

  for(var idx = y; idx < y+3; idx++) {
  	for(var idx2 = x; idx2 > x+3; idx2++) {
    	// This if statement is how we skip checking the center tile(the one the player is on).
    	if(idx === player.y && idx2 === player.x) {

      } else {
      	var area = mapArrays[idx][idx2];
        if(area.searchable) {
          userCommands.push("search");
        }
        // Add more later
    	}
    }
  }
}

// PLAYER STUFF BELOW THIS LINE

// Possible constructor for player objects
function Player(userName) {
	this.name = userName;
  this.maxHealth = 100;
  this.currentHealth = 100;
  this.minDamage = 10;
  this.maxDamage = 10;
  // We need to update these coordinates everytime the player enters a room or moves.
  this.y = 0;
  this.x = 0;
  this.defense = 0;
  this.symbol = "Δ";
  this.inventory = [];
}

// Prototype method to see how much damage a player will deal.
Player.prototype.whatDamage = function() {
	// Finds and stores the size of the damage range to use as the multiplier in the random number generator.
	var damageRange = this.maxDamage - this.minDamage;
	var damage = Math.floor(Math.random() * damageRange) + this.minDamage;
  // For example: monster deals 35 to 50 damage. damageRange is set to 15. minDamage stays at 35. Generator becomes Math.floor(Math.random() * 15) + 35; which generates a random number from 35 to 50.
}

Player.prototype.takeDamage = function(damageAmount) {
	this.currentHealth -= damageAmount;
  alert("You're attacked with " + damageAmount + ", your health is " + this.currentHealth);
  if(this.currentHealth <= 0) {
    alert("You're dead!"); // end the game
  }
}

Player.prototype.restoreHealth = function(healthAmount) {
  this.currentHealth += healthAmount;
}

function playerDisplayer(player) {
  console.log("#location-" + player.y + "-" + player.x);
  $("#location-" + player.y + "-" + player.x).text(player.symbol);
  $("#location-" + player.y + "-" + player.x).removeClass();
  $("#location-" + player.y + "-" + player.x).addClass("gold");
}


// Front-end below this line

$(function() {
  mapCreator(10,10);
  wallMaker();
  mapDisplayer();

  var testPlayer = new Player("tester");
  testPlayer.y = 5;
  testPlayer.x = 5;
  mapArrays[5][5].playerHere = true;

  playerDisplayer(testPlayer);

  // Example of what would update the map on move.
  function positionUpdater(player, oldY, oldX) {
    mapArrays[player.y + oldY][player.x + oldX].playerHere = false;
    mapArrays[player.y][player.x].playerHere = true;
  }

  // Move Up
  function moveUp(player) {
  	if(mapArrays[player.y-1][player.x].canMove) {
      player.y -= 1;
    	positionUpdater(player,1,0);
      adjustSpawn(2);
      surroundingChecker(player);
      mapDisplayer();
      playerDisplayer(player);
    } else {
    	alert("You can't move there!");
    }
  }

  // Move Down
  function moveDown(player) {
    if(mapArrays[player.y+1][player.x].canMove) {
      player.y += 1;
      positionUpdater(player,-1,0);
      adjustSpawn(2);
      surroundingChecker(player);
      mapDisplayer();
      playerDisplayer(player);
    } else {
      alert("You can't move there!");
    }
  }

  // Move Left
  function moveLeft(player) {
    if(mapArrays[player.y][player.x-1].canMove) {
      player.x -= 1;
      positionUpdater(player,0,1);
      adjustSpawn(2);
      surroundingChecker(player);
      mapDisplayer();
      playerDisplayer(player);
    } else {
      alert("You can't move there!");
    }
  }

  // Move Right
  function moveRight(player) {
    if(mapArrays[player.y][player.x+1].canMove) {
      player.x += 1;
      positionUpdater(player,0,-1);
      adjustSpawn(2);
      surroundingChecker(player);
      mapDisplayer();
      playerDisplayer(player);
    } else {
      alert("You can't move there!");
    }
  }

  // Possible code to make arrow keys work to move
  $(document).on("keydown", function(event) {
  	if(event.which === 37) {
    moveLeft(testPlayer);
    } else if(event.which === 38) {
    moveUp(testPlayer);
    } else if(event.which === 39) {
    moveRight(testPlayer);
  } else if(event.which === 40) {
    moveDown(testPlayer);
    }
  });

})
