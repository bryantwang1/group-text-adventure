var mapArrays = [];
var userCommands = [];
var playerInCombat = false;

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
  this.monsterHere = false;
}
// Prototype method that increases spawn chance by the argument
Location.prototype.increaseSpawn = function(percentage) {
  this.spawnChance += percentage;
}
// Prototype method that resets the spawn chance
Location.prototype.resetSpawn = function() {
  this.spawnChance = 8;
}
// Function to apply the adjusted spawn chance to every tile
function spawnAdjuster(percentage) {
  for(var idx = 0; idx < mapArrays.length; idx++) {
    for(var idx2 = 0; idx2 < mapArrays[idx].length; idx2++) {
      mapArrays[idx][idx2].increaseSpawn(percentage);
    }
  }
}
// Function to apply the resetted spawn chance to every tile
function spawnResetter() {
  for(var idx = 0; idx < mapArrays.length; idx++) {
    for(var idx2 = 0; idx2 < mapArrays[idx].length; idx2++) {
      mapArrays[idx][idx2].resetSpawn();
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
  $("#map").empty();
  for(var idx = 0; idx < mapArrays.length; idx++) {
    var tempString = "";
    for(var idx2 = 0; idx2 < mapArrays[idx].length; idx2++) {
      tempString += "<span id=\"location-" + idx + "-" + idx2 + "\" class=\"" + mapArrays[idx][idx2].color + "\">" + mapArrays[idx][idx2].symbol +"</span>";
    }
    $("#map").append("<p>" + tempString + "</p>");
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
        if(area.monsterHere) {
          userCommands.push("fight");
        }
        // Add more later
    	}
    }
  }
}
// Function to start monster encounters.
function monsterEncounter(player) {
  var playerTile = mapArrays[player.y][player.x];
  playerTile.monsterHere = true;
  playerInCombat = true;

  var newEnemy = getMonster();

  console.log(newEnemy);
  $("#monster-description").text(newEnemy.description);
  $("#monster-name").text(newEnemy.name);
  newEnemy.healthBar();
}
// Function that checks if the player's tile spawns a monster and takes the appropriate actions if it does.
function spawnChecker(player) {
  var playerTile = mapArrays[player.y][player.x];
  var spawner = Math.floor((Math.random() * 100) + 1);
  console.log("run spawnchecker, spawner: " + spawner + "playerTile: " + playerTile.spawnChance);

  if(spawner <= playerTile.spawnChance) {
    $("#combat-display").text("You have entered combat.");
    monsterEncounter(player);
    spawnResetter();
    // Add the random monster selector here or something
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
  this.weapons = [];
  this.items = [];
  this.equippedWeapon = {};
  // Not sure if we need to actually keep track of armor or if it would be a permanent upgrade once it's picked up
  this.equippedArmor = {};
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

// PLAYER STUFF ABOVE THIS LINE. MOVEMENT STUFF BELOW.

// Example of what would update the map on move.
function positionUpdater(player, oldY, oldX) {
  mapArrays[player.y + oldY][player.x + oldX].playerHere = false;
  mapArrays[player.y][player.x].playerHere = true;
}
//
function moveChecklist(player, spawnPercentage) {
  spawnChecker(player);
  spawnAdjuster(spawnPercentage);
  surroundingChecker(player);
  mapDisplayer();
  playerDisplayer(player);
}

// Move Up
function moveUp(player) {
  if(mapArrays[player.y-1][player.x].canMove) {
    player.y -= 1;
    positionUpdater(player,1,0);
    moveChecklist(player, 2);
  } else {
    alert("You can't move there!");
  }
}

// Move Down
function moveDown(player) {
  if(mapArrays[player.y+1][player.x].canMove) {
    player.y += 1;
    positionUpdater(player,-1,0);
    moveChecklist(player, 2);
  } else {
    alert("You can't move there!");
  }
}

// Move Left
function moveLeft(player) {
  if(mapArrays[player.y][player.x-1].canMove) {
    player.x -= 1;
    positionUpdater(player,0,1);
    moveChecklist(player, 2);
  } else {
    alert("You can't move there!");
  }
}

// Move Right
function moveRight(player) {
  if(mapArrays[player.y][player.x+1].canMove) {
    player.x += 1;
    positionUpdater(player,0,-1);
    moveChecklist(player, 2);
  } else {
    alert("You can't move there!");
  }
}

// MONSTER STUFF BELOW THIS LINE

// Constructor for monsters
function Monster(name, health, minDamage, maxDamage) {
 this.name = name;
 this.alive = true;
 this.maxHealth = health;
 this.currentHealth = health;
 this.minDamage = minDamage;
 this.maxDamage = maxDamage;
 this.defense = 0;
 this.description = "";
 this.symbol = "";
 this.drops = [];
 // The vocalizations property could hold an array of strings with sounds the monster could say to the player. See example prototype method below.
 this.vocalizations = [];
}

// Prototype method for monster to emit a random vocalization from its library.
Monster.prototype.saySomething = function() {
	var howMany = this.vocalizations.length;
  var whichSound = Math.floor(Math.random() * howMany) + 1;

  $("span#someID").text(this.vocalizations[whichSound]);
}

// Prototype method for generating a health bar based on current and max health. Needs to be tested. Should update the health bar everytime it's run as well. Don't forget the accompanying css.
Monster.prototype.healthBar = function() {
	var percentage = Math.floor((this.currentHealth / this.maxHealth) * 100);
  console.log("percentage: " + percentage);
  // Need jQuery here
  $("div#monster-health-bar").empty();
  $("div#monster-health-bar").append("<div id=\"health-bar-outer\"><div id=\"health-bar-inner\"></div></div>");
  $("#health-bar-inner").css("width", percentage + "%");
}

Monster.prototype.statReset = function() {
  this.alive = true;
  this.currentHealth = this.maxHealth;
}

// Prototype method for monsters to take damage. Changes alive property to false if their currentHealth falls to 0 or below.
Monster.prototype.takeDamage = function(damageAmount) {
	this.currentHealth -= damageAmount;
  this.healthBar();
  alert("You attack with " + damageAmount + ", the monster's health is " + this.currentHealth);
  if(this.currentHealth <= 0) {
  	this.alive = false;
    playerInCombat = false;
    alert("The monster is dead!");
  }
}

Monster.prototype.restoreHealth = function(healthAmount) {
  this.currentHealth += healthAmount;
}

// Example of a function for a chance to hit a monster instead of a sure hit.
function attack(damage, target) {
	// Generates and stores a random number from 1 to 10.
	var hitChance = Math.floor(Math.random() * 10) + 1;
  console.log("The hit chance was: " +hitChance);
  var defense = target.defense;

  if(hitChance <= defense) {
    alert("Monster defended, no damage.");
  } else if(hitChance >= 1 && hitChance <= 10) {
  	target.takeDamage(damage);
    // Doesn't need to be an else if, but made it one to illustrate 	the concept.
  }
}

// Prototype method to see how much damage a monster will deal.
Monster.prototype.whatDamage = function() {
	// Finds and stores the size of the damage range to use as the multiplier in the random number generator.
	var damageRange = this.maxDamage - this.minDamage;
	var damage = Math.floor(Math.random() * damageRange) + this.minDamage;
  // For example: monster deals 35 to 50 damage. damageRange is set to 15. minDamage stays at 35. Generator becomes Math.floor(Math.random() * 15) + 35; which generates a random number from 35 to 50.
}

// CONTENT BELOW THIS LINE (MONSTERS)

var goblin = new Monster("goblin", 100, 10, 25);
goblin.description = "A small minion with quick reflexes and an affinity for gold. It will attack anything shiny.";
this.defense = 3;
this.drops = ["potion"];
this.vocalizations = ["Grunt", "Yargh!", "I eat you!", "Give me gold!", "Hold still!", "You're going to regret this...", "Such violence!"];

var wizard = new Monster("wizard", 200, 20, 50);
wizard.description = "A dark mage appears before you with a crackle of elemental magic.";
this.defense = 2;
this.drops = ["key", "potion"];
this.vocalizations = ["Behold!", "This is your end!", "You are mine!", "Ow! That tickles!", "You sword's a little short.", "This is my domain. You won't leave alive."];

var dragon = new Monster("dragon", 1000, 75, 125);
dragon.description = "A monsterous beast with a wicked temper and fiery breath unfurls before you. Its sheer maginitude is astonishing and hard to believe.";
this.defense = 0;
this.drops = ["artifact"];
this.vocalizations = ["Have some fire!", "ROOOOAAAARRRRRR!!", "I shall crush you like a bug!", "You tasty little morsel!", "This is your end!", "You'll never defeat me...", "I've been here since the beginning of this age..."];

var spider = new Monster("spider", 80, 10, 15);
spider.description = "A creepy and stealthy hunter that stalks its prey from the shadows. Its prey is you.";
this.defense = 3;
this.drops = ["potion"];
this.vocalizations = ["Squeal!", "Eek!", "Hiss!", "You look delicious!"];

var golem = new Monster("golem", 300, 5, 50);
golem.description = "A giant rock monster that is brooding and slow blocks your path.";
this.defense = 0;
this.drops = ["puzzle item", "armor", "potion"];
this.vocalizations = ["Rock crush you...", "Ugh!", "I slow. Hold still!", "Rock mad!", "Leave me alone...", "Oof!"];

var skeleton = new Monster("skeleton", 120, 15, 40);
skeleton.description = "A member of the undead legions approaches you with malice in the very marrow of its bones.";
this.defense = 2;
this.drops = ["potion"];
this.vocalizations = ["[Bones clanking]", "Arg!", "Die!", "I'll hurt you...", "Do you feel pain?", "Take this!"];

var mobMonsters = [goblin, spider, skeleton];
var toughMonsters = [wizard, golem];

// Function to possibly grab a random monster out of 6.
function getMonster() {
  var mobOrTough = Math.floor((Math.random() * 99) + 1);

  if(mobOrTough <= 66) {
    var number = Math.floor(Math.random() * mobMonsters.length);
    return mobMonsters[number];
  } else {
    var number = Math.floor(Math.random() * toughMonsters.length);
    return toughMonsters[number];
  }
}

// CONTENT BELOW THIS LINE (ITEMS)

// Constructor for weapons
function Weapon(name, damage, criticalHit) {
 this.name = name;
 this.damage = damage;
 this.criticalHit = criticalHit;
 this.description = "";
 this.symbol = "";
 this.image = "";
}

//Weapons
var woodSword = new Weapon("wood sword", 10, 20);
woodSword.description = "A warrior's first weapon.";
this.image = "images/###.jpg";

var metalSword = new Weapon("metal sword", 30, 60);
metalSword.description = "Sharp, Brutal, and Highly Effective.";
this.image = "images/###.jpg";

var warHammer = new Weapon("war hammer", 15, 25);
warHammer.description = "Blunt edge with crushing power.";
this.image = "images/###.jpg";

var mysticBow = new Weapon("mystic bow", 20, 30);
warHammer.description = "Long range weapon delivers blows with precision.";
this.image = "images/###.jpg";

// Constructor for items
function Item(name, addHealth, addShield, openDoor) {
 this.name = name;
 this.openDoor = openDoor;
 this.addHealth = addHealth;
 this.addShield = addShield;
 this.description = "";
 this.symbol = "";
 this.image = "";
}

//items
var key = new Item("key", 0, 0, true);
key.description = "Opens Doors";
this.image = "images/###.jpg";

var potion = new Item("potion", 250, 0, false);
potion.description = "Restores 250 HP";
this.image = "images/###.jpg";

var shield = new Item("shield", 0, 100, false);
potion.description = "Increases Defense chance";
this.image = "images/###.jpg";

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

  // Code to make arrow keys work to move
  $(document).on("keydown", function(event) {
    if(event.which === 37) {
      if(playerInCombat === false) {
        moveLeft(testPlayer);
      } else {
        alert("You can't move while in combat!");
      }
    } else if(event.which === 38) {
      if(playerInCombat === false) {
        moveUp(testPlayer);
      } else {
        alert("You can't move while in combat!");
      }
    } else if(event.which === 39) {
      if(playerInCombat === false) {
        moveRight(testPlayer);
      } else {
        alert("You can't move while in combat!");
      }
    } else if(event.which === 40) {
      if(playerInCombat === false) {
        moveDown(testPlayer);
      } else {
        alert("You can't move while in combat!");
      }
    }
  });
})
