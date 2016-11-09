var mapArrays = [];
var userCommands = [];
var playerInCombat = false;
var currentEnemy = {};

// Constructor for rooms
function Room(roomNumber) {
  this.number = roomNumber;
  this.chests = [];
  this.monsters = [];
  this.doors = [];
}
// Constructor for locations, defaults to floor type
function Location(yCoord, xCoord) {
  this.y = yCoord;
  this.x = xCoord;
	this.canMove = true;
  this.description = "A floor tile";
  this.terrainType = "floor";
  this.playerHere = false;
  this.symbol = "#";
  this.color = "tiles";
  this.searchable = false;
  this.spawnChance = 10;
  this.monsterHere = false;
  this.drops = [];
  this.occupiedBy = {};
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
function chestCreator(amount, room) {
  for(var idx = 0; idx < amount; idx++) {
    var chest = new Location(-1, -1);
    chest.canMove = false;
    chest.description = "An old wooden chest";
    chest.terrainType = "chest";
    chest.symbol = "∃";
    chest.color = "purple";
    chest.searchable = true;
    chest.drops = [];
    // New property to help check if the chests array already contains something
    chest.checker = true;

    room.chests.push(chest);
  }
}

function doorCreator(amount) {
  for(var idx = 0; idx < amount; idx++) {
    var chest = new Location(-1, -1);
    chest.canMove = false;
    chest.description = "An old wooden chest";
    chest.terrainType = "chest";
    chest.symbol = "∃";
    chest.color = "purple";
    chest.searchable = true;
    chest.drops = [];

    chests.push(chest);
  }
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
    wallThis.description = "A wall";
  	wallThis.terrainType = "wall";
    wallThis.symbol = "^";
    wallThis.color = "wall";
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
  userCommands = ["equip", "potion", "look"];

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
  commandDisplayer();
}
// Function similar to surroundingChecker, to run when user inputs a look command.
function looker(player) {
  $("#combat-display").empty();
  var y = player.y - 1;
	var x = player.x - 1;
  var descriptions = [];

  for(var idx = y; idx < y+3; idx++) {
  	for(var idx2 = x; idx2 < x+3; idx2++) {
    	// This if statement is how we skip checking the center tile(the one the player is on).
    	if(idx === player.y && idx2 === player.x) {
      } else {
      	var area = mapArrays[idx][idx2];
        descriptions.push(area.description);
    	}
    }
  }
  var detailString = "Northwest: " + descriptions[0] + "; North: " + descriptions[1] + "; Northeast: " + descriptions[2] + "; West: " + descriptions[3] + "; East: " + descriptions[4] + "; Southwest: " + descriptions[5] + "; South: " + descriptions[6] + "; Southeast: " + descriptions[7] + ".";

  $("#combat-display").text(detailString);
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
                  if(area.drops[0].name === "potion") {
                    var potionAmount = Math.floor((Math.random() * 5) + 1);
                    for(var idx4 = 0; idx4 < potionAmount; idx4++) {
                      player.items.push(potion);
                      area.drops.shift();
                    }
                    player.potionCounter();
                    displayText += " \"" + "potion" + "(" + potionAmount + ")" + "\"";
                  } else {
                    player.items.push(area.drops[0]);
                    displayText += " \"" + area.drops[0].name + "\"";
                    area.drops.shift();
                  }
                }
              }
            }
            displayText += ". They have been added to your inventory.";
            // Make this item display later
            $("#combat-display").append("<p>" + displayText + "</p>");
          } else {
            $("#combat-display").text("The surrounding containers are empty.");
          }
        }
      }
    }
  }
}
// Function to run for when a player starts combat
function combatStarter(monster) {
  var monsterName = monster.name.split("");
  monsterName[0] = monsterName[0].toUpperCase();
  monsterName = monsterName.join("");
  $("#combat-display").text("You have entered combat with a " + monster.name + ".");
  $("#monster-description").text(monster.description);
  $("#monster-name").text(monsterName);
  monster.saySomething();
  monster.healthBar();
  playerInCombat = true;
  userCommands = ["attack", "flee", "potion", "equip"];
  commandDisplayer();
}
// Function for the command "fight" which will initiate a fight with a monster on an adjacent tile. If there are multiple monsters for some reason it will initiate a fight with the first monster found.
function fight() {
  var y = player.y - 1;
	var x = player.x - 1;

  for(var idx = y; idx < y+3; idx++) {
  	for(var idx2 = x; idx2 < x+3; idx2++) {
      if(idx === player.y && idx2 === player.x) {
      } else {
        var area = mapArrays[idx][idx2];
        if(area.monsterHere) {
          currentEnemy = area.occupiedBy;
          combatStarter(currentEnemy);
          break;
        }
      }
    }
  }
}
// Function to start random monster encounters.
function monsterEncounter(player) {
  var playerTile = mapArrays[player.y][player.x];
  playerTile.monsterHere = true;
  currentEnemy = getMonster();
  combatStarter(currentEnemy);
}
// Hard coded to use testPlayer y and x for now
function combatEnder() {
  var playerTile = mapArrays[testPlayer.y][testPlayer.x];
  playerTile.monsterHere = false;
  currentEnemy.statReset();
  currentEnemy = {};
  playerInCombat = false;
  $("#monster-description").text("");
  $("#monster-name").text("");
  $("#monster-sounds").text("");
  surroundingChecker(testPlayer);
}
// Function for the flee command
function playerFlee(player) {
  var fleeChance = Math.floor((Math.random() * 10) + 1);
  if(fleeChance > 1) {
    combatEnder(player);
    $("#combat-display").empty();
    $("#combat-display").text("You flee from the monster.");
  } else {
    $("#combat-display").empty();
    $("#combat-display").append("You attempt to flee, but can't get away from the monster.");
    monsterRetaliater(currentEnemy, player);
  }
}
// Function that checks if the player's tile spawns a monster and takes the appropriate actions if it does.
function spawnChecker(player) {
  var playerTile = mapArrays[player.y][player.x];
  var spawner = Math.floor((Math.random() * 100) + 1);
  console.log("run spawnchecker, spawner: " + spawner + "playerTile: " + playerTile.spawnChance);

  if(spawner <= playerTile.spawnChance) {
    monsterEncounter(player);
    spawnResetter();
    // Add the random monster selector here or something
  }
}

// PLAYER STUFF BELOW THIS LINE

// Possible constructor for player objects
function Player(userName) {
	this.name = userName;
  this.maxHealth = 500;
  this.currentHealth = 500;
  this.minDamage = 10;
  this.maxDamage = 10;
  // We need to update these coordinates everytime the player enters a room or moves.
  this.y = 0;
  this.x = 0;
  this.defense = 1;
  this.symbol = "Δ";
  this.weapons = [];
  this.items = [];
  this.equippedWeapon = {};
  // Not sure if we need to actually keep track of armor or if it would be a permanent upgrade once it's picked up
  this.equippedArmor = {};
  this.revives = 0;
}

Player.prototype.healthBar = function() {
	var percentage = Math.floor((this.currentHealth / this.maxHealth) * 100);
  $("div#hero-health").empty();
  $("div#hero-health").append("<div id=\"player-health-bar-outer\"><div id=\"player-health-bar-inner\"></div></div>");
  $("#player-health-bar-inner").css("width", percentage + "%");

  $("#hero-health-display").text(this.currentHealth + "/" + this.maxHealth);
}

// Prototype method to see how much damage a player will deal.
Player.prototype.whatDamage = function() {
  var minDamage = this.minDamage + this.equippedWeapon.minDamage;
  var maxDamage = this.maxDamage + this.equippedWeapon.maxDamage;
	var damageRange = maxDamage - minDamage;
	var damage = Math.floor(Math.random() * damageRange) + minDamage;

  var critChance = Math.floor(Math.random() * 4) + 1;
  if(critChance === 1) {
    damage += this.equippedWeapon.criticalHit;
  }

  return damage;
}

Player.prototype.reviver = function() {
  if(this.revives > 0) {
    this.restoreHealth(1000);
    this.revives -= 1;
    this.healthBar();
    combatEnder();
    $("#combat-display").text("You have been successfully revived!");
  } else {
    $("#combat-display").empty();
    $("#combat-display").text("You have no revives left!");
  }
}

Player.prototype.takeDamage = function(damageAmount) {
	this.currentHealth -= damageAmount;
  this.healthBar();
  $("#combat-display").append("<p>You're attacked with " + damageAmount + " damage, your health is " + this.currentHealth + ".</p>");
  if(this.currentHealth <= 0) {
    this.currentHealth = 0;
    this.healthBar();
    userCommands = ["revive"];
    commandDisplayer();
    $("#combat-display").empty();
    $("#combat-display").append("<p>You died. You suck.</p>")
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
      this.items.splice(idx, 1);
      idx--;
      break;
    }
  }
  this.potionCounter();
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
        function unwrapper() {
          $(".equipped").children().unwrap();
        }

        if(this.weapons[idx].name === "bare hands") {
          unwrapper();
        } else if (this.weapons[idx].name === "wood sword") {
          unwrapper();
          $("#woodSword p").wrap("<div class=\"equipped\"></div>");
        } else if (this.weapons[idx].name === "metal sword") {
          unwrapper();
          $("#metalSword p").wrap("<div class=\"equipped\"></div>");
        } else if (this.weapons[idx].name === "mystic bow") {
          unwrapper();
          $("#bow p").wrap("<div class=\"equipped\"></div>");
        } else if (this.weapons[idx].name === "war hammer") {
          unwrapper();
          $("#warHammer p").wrap("<div class=\"equipped\"></div>");
        }
        break;
      }
    }
  }
  if(haveWeapon === false) {
    $("#combat-display").text("You don't have this weapon!");
  }
}

Player.prototype.potionCounter = function() {
  var potionAmount = 0;
  for(var idx= 0; idx < this.items.length; idx++) {
    if(this.items[idx].name === "potion") {
      potionAmount++;
    }
  }
  $("span#player-potions").text(potionAmount);
}

function playerDisplayer(player) {
  console.log("#location-" + player.y + "-" + player.x);
  $("#location-" + player.y + "-" + player.x).text(player.symbol);
  $("#location-" + player.y + "-" + player.x).removeClass();
  $("#location-" + player.y + "-" + player.x).addClass("character");
}

// PLAYER STUFF ABOVE THIS LINE. MOVEMENT STUFF BELOW.

// Example of what would update the map on move.
function positionUpdater(player, oldY, oldX) {
  mapArrays[player.y + oldY][player.x + oldX].playerHere = false;
  mapArrays[player.y][player.x].playerHere = true;
}
//
function moveChecklist(player, spawnPercentage) {
  $("#combat-display").empty();
  surroundingChecker(player);
  spawnChecker(player);
  spawnAdjuster(spawnPercentage);
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
  var monsterName = this.name.split("");
  monsterName[0] = monsterName[0].toUpperCase();
  monsterName = monsterName.join("");

  $("#monster-sounds").text(monsterName + " says: " + this.vocalizations[whichSound-1]);
}

// Prototype method for generating a health bar based on current and max health. Needs to be tested. Should update the health bar everytime it's run as well. Don't forget the accompanying css.
Monster.prototype.healthBar = function() {
	var percentage = Math.floor((this.currentHealth / this.maxHealth) * 100);
  $("div#monster-health").empty();
  $("div#monster-health").append("<div id=\"monster-health-bar-outer\"><div id=\"monster-health-bar-inner\"></div></div>");
  $("#monster-health-bar-inner").css("width", percentage + "%");

  $("#monster-health-display").text(this.currentHealth + "/" + this.maxHealth);
}

Monster.prototype.statReset = function() {
  this.alive = true;
  this.currentHealth = this.maxHealth;
  this.healthBar();
}

// Prototype method for monsters to take damage. Changes alive property to false if their currentHealth falls to 0 or below. Hard coded testPlayer in for potions.
Monster.prototype.takeDamage = function(damageAmount) {
	this.currentHealth -= damageAmount;
  this.healthBar();
  $("#combat-display").append("<p>You attack with " + damageAmount + " damage, the monster's health is " + this.currentHealth + ".</p>");
  if(this.currentHealth <= 0) {
  	this.alive = false;
    combatEnder();
    $("#combat-display").empty();
    var potionDropChance = Math.floor((Math.random() * 3) + 1);
    if(potionDropChance === 1) {
      testPlayer.items.push(potion);
      testPlayer.potionCounter();
      $("#combat-display").text("The monster is dead! You find a potion on its mangled corpse.");
    } else {
      $("#combat-display").text("The monster is dead!");
    }
  }
}

Monster.prototype.restoreHealth = function(healthAmount) {
  this.currentHealth += healthAmount;
  if(this.currentHealth > this.maxHealth) {
    this.currentHealth = this.maxHealth;
  }
  this.healthBar();
}

// Example of a function for a chance to hit a monster instead of a sure hit.
function attack(damage, target) {
	// Generates and stores a random number from 1 to 10.
	var hitChance = Math.floor(Math.random() * 10) + 1;
  console.log("The hit chance was: " +hitChance);
  var defense = target.defense;

  if(hitChance <= defense) {
    $("#combat-display").append("<p>" + target.name + " defended, no damage.</p>");
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
  return damage;
  // For example: monster deals 35 to 50 damage. damageRange is set to 15. minDamage stays at 35. Generator becomes Math.floor(Math.random() * 15) + 35; which generates a random number from 35 to 50.
}
// Function for monsters to react after player turn
function monsterRetaliater(monster, player) {
  var retaliationDamage = monster.whatDamage();
  console.log("run retaliater")
  attack(retaliationDamage, player);
  monster.saySomething();
}
// Displays currently available commands to the user
function commandDisplayer() {
  $("#available-options").empty();
  $("#available-options").append("<li>Possible Commands:</li>")
  for(var idx = 0; idx < userCommands.length; idx++) {
    $("#available-options").append("<li>" + userCommands[idx] + "</li>")
  }
}

// CONTENT BELOW THIS LINE (MONSTERS)

var goblin = new Monster("goblin", 100, 10, 25);
goblin.description = "A small minion with quick reflexes and an affinity for gold. It will attack anything shiny.";
goblin.defense = 3;
goblin.drops = ["potion"];
goblin.vocalizations = ["Grunt", "Yargh!", "I eat you!", "Give me gold!", "Hold still!", "You're going to regret this...", "Such violence!"];

var wizard = new Monster("wizard", 200, 20, 50);
wizard.description = "A dark mage appears before you with a crackle of elemental magic.";
wizard.defense = 2;
wizard.drops = ["key", "potion"];
wizard.vocalizations = ["Behold!", "This is your end!", "You are mine!", "Ow! That tickles!", "Your sword's a little short.", "This is my domain. You won't leave alive."];

var dragon = new Monster("dragon", 1000, 75, 125);
dragon.description = "A monsterous beast with a wicked temper and fiery breath unfurls before you. Its sheer maginitude is astonishing and hard to believe.";
dragon.defense = 0;
dragon.drops = ["artifact"];
dragon.vocalizations = ["Have some fire!", "ROOOOAAAARRRRRR!!", "I shall crush you like a bug!", "You tasty little morsel!", "This is your end!", "You'll never defeat me...", "I've been here since the beginning of this age..."];

var spider = new Monster("spider", 80, 10, 15);
spider.description = "A creepy and stealthy hunter that stalks its prey from the shadows. Its prey is you.";
spider.defense = 3;
spider.drops = ["potion"];
spider.vocalizations = ["Squeal!", "Eek!", "Hiss!", "You look delicious!"];

var golem = new Monster("golem", 300, 5, 50);
golem.description = "A giant rock monster that is brooding and slow blocks your path.";
golem.defense = 0;
golem.drops = ["puzzle item", "armor", "potion"];
golem.vocalizations = ["Rock crush you...", "Ugh!", "I slow. Hold still!", "Rock mad!", "Leave me alone...", "Oof!"];

var skeleton = new Monster("skeleton", 120, 15, 40);
skeleton.description = "A member of the undead legions approaches you with malice in the very marrow of its bones.";
skeleton.defense = 2;
skeleton.drops = ["potion"];
skeleton.vocalizations = ["[Bones clanking]", "Arg!", "Die!", "I'll hurt you...", "Do you feel pain?", "Take this!"];

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

var metalSword = new Weapon("metal sword", 24, 34, 30);
metalSword.description = "Sharp, Brutal, and Highly Effective.";
this.image = "images/###.jpg";

var warHammer = new Weapon("war hammer", 15, 25, 70);
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
function room1ChestPlacer(room) {
  chestCreator(3, room);
  room.chests[0].y = 1;
  room.chests[0].x = 8;
  room.chests[1].y = 5;
  room.chests[1].x = 6;
  room.chests[2].y = 6;
  room.chests[2].x = 6;

  mapArrays[room.chests[0].y][room.chests[0].x] = room.chests[0];
  mapArrays[room.chests[1].y][room.chests[1].x] = room.chests[1];
  mapArrays[room.chests[2].y][room.chests[2].x] = room.chests[2];
}
// Don't run chest fillers more than once
function room1ChestFiller(room) {
  room.chests[0].drops.push(mysticBow);
  room.chests[1].drops.push(woodSword, potion);
  room.chests[2].drops.push(key);
}
// This function should be run to generate room1 at the beginning and when players pass back in through a door, provide true for createdBefore if it's the first time you're running it, otherwise leave it empty or provide false.
function room1Generator(room, player, createdBefore) {
  var created = createdBefore;
  mapCreator(10,10);
  wallMaker();
  room1ChestPlacer(room);
  if(createdBefore){
    room1ChestFiller(room);
  }
  mapDisplayer();

  player.y = 5;
  player.x = 5;
  mapArrays[5][5].playerHere = true;
}

// Only in back-end for testing purposes
var testPlayer = new Player("You");
// Front-end below this line

$(function() {
  var equipTyped = false;
  var room1 = new Room(1);
  room1Generator(room1, testPlayer, true);
  testPlayer.healthBar()
  testPlayer.weapons.push(bareHands);
  testPlayer.equippedWeapon = bareHands;
  testPlayer.potionCounter();

  playerDisplayer(testPlayer);
  surroundingChecker(testPlayer);

  // Code to make arrow keys work to move
  $(document).on("keydown", function(event) {
    if(event.which === 37) {
      if(playerInCombat === false) {
        moveLeft(testPlayer);
      } else {
        $("#combat-display").text("You can't move while in combat!");
      }
    } else if(event.which === 38) {
      if(playerInCombat === false) {
        moveUp(testPlayer);
      } else {
        $("#combat-display").text("You can't move while in combat!");
      }
    } else if(event.which === 39) {
      if(playerInCombat === false) {
        moveRight(testPlayer);
      } else {
        $("#combat-display").text("You can't move while in combat!");
      }
    } else if(event.which === 40) {
      if(playerInCombat === false) {
        moveDown(testPlayer);
      } else {
        $("#combat-display").text("You can't move while in combat!");
      }
    }
  });

  $("form#input-form").submit(function(event) {
      event.preventDefault();

      var userInput = $("#user-input").val().toLowerCase();

      if(playerInCombat) {
        if(equipTyped) {
          console.log("Enter equipTyped if");
          testPlayer.equipWeapon(userInput);
          equipTyped = false;
        } else {
          if(userCommands.includes(userInput)) {
            if(userInput === "attack") {
              $("#combat-display").empty();
              var attackDamage = testPlayer.whatDamage()
              console.log("player attacks")
              attack(attackDamage, currentEnemy);

              if(playerInCombat) {
                monsterRetaliater(currentEnemy, testPlayer);
              }
            } else if(userInput === "flee") {
              playerFlee(testPlayer);
            } else if(userInput === "potion") {
              testPlayer.drinkPotion();
            } else if(userInput === "equip") {
              var weaponNames = [];
              for(var idx = 0; idx < testPlayer.weapons.length; idx++) {
                weaponNames.push(testPlayer.weapons[idx].name);
              }
              $("#combat-display").text("What would you like to equip? Type its name in the command space and hit enter. Available weapons: " + "| " + weaponNames.join(" | ") + " |");
              equipTyped = true;
            } else if(userInput === "revive") {
              testPlayer.reviver();
            } else {
              $("#combat-display").text("You can't do that.");
            }
          } else {
            $("#combat-display").text("You can't do that.");
          }
        }
      } else {
        if(equipTyped) {
          console.log("Enter equipTyped if");
          testPlayer.equipWeapon(userInput);
          equipTyped = false;
        } else {
          if(userCommands.includes(userInput)) {
            if(userInput === "search") {
              searcher(testPlayer);
            } else if(userInput === "potion") {
              testPlayer.drinkPotion();
            } else if(userInput === "equip") {
              var weaponNames = [];
              for(var idx = 0; idx < testPlayer.weapons.length; idx++) {
                weaponNames.push(testPlayer.weapons[idx].name);
              }
              $("#combat-display").text("What would you like to equip? Type its name the command space. Available weapons: " + "| " + weaponNames.join(" | ") + " |");
              equipTyped = true;
            } else if(userInput === "look") {
              looker(testPlayer);
            } else {
              $("#combat-display").text("You can't do that.");
            }
          } else {
            $("#combat-display").text("You can't do that.");
          }
        }
      }

      console.log("equipTyped: " + equipTyped);
      $("#user-input").val("");
  });
});
