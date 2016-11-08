var mapArrays = [];
var userCommands = [];
var chests = [];
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
  this.drops = [];
}
// Prototype method that increases spawn chance by the argument
Location.prototype.increaseSpawn = function(percentage) {
  this.spawnChance += percentage;
}
// Prototype method that resets the spawn chance
Location.prototype.resetSpawn = function() {
  this.spawnChance = 8;
}
// Function for creating a variable number of chests.
function chestCreator(amount) {
  for(var idx = 0; idx < amount; idx++) {
    var chest = new Location(-1, -1);
    chest.canMove = false;
    chest.description = "An old wooden chest.";
    chest.terrainType = "chest";
    chest.symbol = "∃";
    chest.color = "purple";
    chest.searchable = true;
    chest.drops = [];

    chests.push(chest);
  }
}
// Function for resetting amount of chests
function chestResetter() {
  chests = [];
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
  userCommands = ["equip", "drink potion"];

  for(var idx = y; idx < y+3; idx++) {
  	for(var idx2 = x; idx2 < x+3; idx2++) {
    	// This if statement is how we skip checking the center tile(the one the player is on).
    	if(idx === player.y && idx2 === player.x) {
      } else {
      	var area = mapArrays[idx][idx2];
        if(area.searchable) {
          if(userCommands.includes("search")) {
          } else {
          userCommands.push("search");
          }
        }
        if(area.monsterHere) {
          if(userCommands.includes("fight")) {
          } else {
          userCommands.push("fight");
          }
        }
        if(area.terrainType === "door") {
          if(userCommands.includes("open door")) {
          } else {
          userCommands.push("open door");
          }
        }
        // Add more later
    	}
    }
  }
}
// Function similar to surroundingChecker, to run when user inputs a search command.
function searcher(player) {
  // Make this item display later
  $("#combat-display").empty();
  var y = player.y - 1;
	var x = player.x - 1;

  for(var idx = y; idx < y+3; idx++) {
  	for(var idx2 = x; idx2 < x+3; idx2++) {
      if(idx === player.y && idx2 === player.x) {
      } else {
        var area = mapArrays[idx][idx2];
        if(area.searchable) {
          var displayText = "You searched a " + area.terrainType + ", you found";
          var howLong = area.drops.length;
          if(howLong > 0){
            for(var idx3 = 0; idx3 < howLong; idx3++) {
              if(area.drops.length > 0) {
                if(area.drops[0].itemType === "weapon") {
                  player.weapons.push(area.drops[0]);
                  displayText += " \"" + area.drops[0].name + "\"";
                  area.drops.shift();
                } else if(area.drops[0].itemType === "item") {
                  player.items.push(area.drops[0]);
                  displayText += " \"" + area.drops[0].name + "\"";
                  area.drops.shift();
                }
              }
            }
            displayText += ". They have been added to your inventory.";
            // Make this item display later
            $("#combat-display").append("<p>" + displayText + "</p>");
          }
        }
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

Player.prototype.healthBar = function() {
	var percentage = Math.floor((this.currentHealth / this.maxHealth) * 100);
  $("div#hero-health").empty();
  $("div#hero-health").append("<div id=\"health-bar-outer\"><div id=\"health-bar-inner\"></div></div>");
  $("#health-bar-inner").css("width", percentage + "%");
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
  if(this.currentHealth > this.maxHealth) {
    this.currentHealth = this.maxHealth;
  }
}
// Allows users to drink a potion from their inventory, removing it upon use.
Player.prototype.drinkPotion = function() {
  $("#combat-display").text("You have no potions to drink!");
  for(var idx = 0; idx < this.items.length; idx++) {
    if(this.items[idx].name === "potion") {
      this.restoreHealth(this.items[idx].addHealth);
      $("#combat-display").text("You drank a potion.");
      this.healthBar();
      this.items.splice(idx, idx+1);
      idx--;
      break;
    }
  }
}

Player.prototype.equipWeapon = function(string) {
  var haveWeapon = false;
  for(var idx = 0; idx < this.weapons.length; idx++) {
    if(this.weapons[idx] != string) {
      haveWeapon = false;
    }

    if(this.equippedWeapon.name === string) {
      $("#combat-display").text("You already have this weapon equipped!");
      haveWeapon = true;
    } else {
      if(this.weapons[idx].name === string) {
        this.equippedWeapon = this.weapons[idx];
        $("#combat-display").text("You have equipped " + this.weapons[idx].name + "!");
        haveWeapon = true;
        break;
      }
    }
  }
  if(haveWeapon === false) {
    $("#combat-display").text("You don't have this weapon!");
  }
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
  // spawnChecker(player);
  spawnAdjuster(spawnPercentage);
  surroundingChecker(player);
  mapDisplayer();
  playerDisplayer(player);
  $("#combat-display").empty();
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
  $("div#monster-health").empty();
  $("div#monster-health").append("<div id=\"health-bar-outer\"><div id=\"health-bar-inner\"></div></div>");
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
  if(this.currentHealth > this.maxHealth) {
    this.currentHealth = this.maxHealth;
  }
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
function Weapon(name, minDamage, maxDamage, criticalHit) {
 this.name = name;
 this.minDamage = minDamage;
 this.maxDamage = maxDamage;
 this.criticalHit = criticalHit;
 this.description = "";
 this.symbol = "";
 this.image = "";
 this.itemType = "weapon";
}

//Weapons
var bareHands = new Weapon("bare hands", 0, 0, 5);
bareHands.description = "Your bare fists. Nice and simple.";
this.image = "images/###.jpg";

var woodSword = new Weapon("wood sword", 10, 15, 20);
woodSword.description = "A warrior's first weapon.";
this.image = "images/###.jpg";

var metalSword = new Weapon("metal sword", 26, 34, 30);
metalSword.description = "Sharp, Brutal, and Highly Effective.";
this.image = "images/###.jpg";

var warHammer = new Weapon("war hammer", 15, 25, 60);
warHammer.description = "Blunt edge with crushing power.";
this.image = "images/###.jpg";

var mysticBow = new Weapon("mystic bow", 26, 28, 40);
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
 this.itemType = "item";
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
// Generates the chests for our dev room
function chestTester() {
  chestResetter();
  chestCreator(3);
  chests[0].y = 1;
  chests[0].x = 8;
  chests[1].y = 5;
  chests[1].x = 6;
  chests[2].y = 6;
  chests[2].x = 6;

  chests[0].drops.push(mysticBow);
  chests[1].drops.push(woodSword, potion);
  chests[2].drops.push(key)

  mapArrays[chests[0].y][chests[0].x] = chests[0];
  mapArrays[chests[1].y][chests[1].x] = chests[1];
  mapArrays[chests[2].y][chests[2].x] = chests[2];
}
  var testPlayer = new Player("tester");
// Front-end below this line

$(function() {
  var equipTyped = false;

  mapCreator(10,10);
  wallMaker();
  chestTester();
  mapDisplayer();


  testPlayer.y = 5;
  testPlayer.x = 5;
  mapArrays[5][5].playerHere = true;
  testPlayer.healthBar()
  testPlayer.weapons.push(bareHands);
  testPlayer.equippedWeapon = bareHands;

  playerDisplayer(testPlayer);
  surroundingChecker(testPlayer);

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

  $("form#input-form").submit(function(event) {
      event.preventDefault();

      var userInput = $("#user-input").val().toLowerCase();

      if(equipTyped) {
        console.log("Enter equipTyped if");
        testPlayer.equipWeapon(userInput);
        equipTyped = false;
      } else {
        if(userCommands.includes(userInput)) {

          if(userInput === "search") {
            searcher(testPlayer);
          } else if(userInput === "drink potion") {
            testPlayer.drinkPotion();
          } else if(userInput === "equip") {
            var weaponNames = [];
            for(var idx = 0; idx < testPlayer.weapons.length; idx++) {
              weaponNames.push(testPlayer.weapons[idx].name);
            }
            $("#combat-display").text("What would you like to equip? Type its name the command space. Available weapons: " + "| " + weaponNames.join(" | ") + " |");
            equipTyped = true;
          } else {
            $("#combat-display").text("You can't do that.");
          }
        } else {
          $("#combat-display").text("You can't do that.");
        }
      }

      console.log("equipTyped: " + equipTyped);
      $("#user-input").val("");
  });
});
