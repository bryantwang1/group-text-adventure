// Coordinates follow a (Y,X) system with positive Y going downward. Use Y to target rows and X target columns.

// Overall game object

function Game() {
  this.rooms = [];
}

// Tile object

function Tile(yCoord, xCoord) {
  this.y = yCoord;
  this.x = xCoord;
  this.canMove = true;
  this.description = "A floor tile";
  this.terrainType = "floor";
  this.symbol = "#";
  this.color = "tiles";
  this.searchable = false;
  this.spawnChance = 10;
  this.monsterHere = false;
  this.drops = [];
  this.occupiedBy = {};
}

Tile.prototype.increaseSpawn = function(percentage) {
  this.spawnChance += percentage;
}

Tile.prototype.resetSpawn = function() {
  this.spawnChance = 8;
}

// Map object, former room object refactored into map object

function Map(roomName) {
  this.name = roomName;
  this.description = "";
  this.displayName = "";
  this.chests = [];
  this.monsters = [];
  this.doors = [];
  this.waters = [];
  this.lavas = [];
  this.spikes = [];
  this.firepits = [];
  this.switches = [];
  this.mapArrays = [];
  this.atmosphericStrings = ["Something furry scurries by your feet.", "You feel a slow and steady dripping of water from the ceiling.", "A musty and unpleasant smell wafts in front of you.", "A bat flies past your head and disappears into the darkness.", "In the far distance your hear something shuffle toward you.", "The stone floor here is slick and slippery.", "Surely there’s a door nearby?", "You note a trickle of liquid on your arm, feel it, and taste your blood.", "A creaking and groaning as of rusty hinges starts from a far area of the room, then stops just as quickly.", "A tendril of mist curls around you.", "The ceiling seems to be closing in, but maybe that’s just you.", "The tile you’re on is loose, and it rattles loudly beneath you.", "A sound of stone scraping against stone reverberates for a short time, then seems to muffle itself."];
}

Map.prototype.createMap(ySize, xSize) {
  this.mapArrays = [];
  for(var row = 0; row < ySize; row++) {
    this.mapArrays[row] = [];
    for(var col = 0; col < xSize; col++) {
      var tempTile = new Tile(row, col);
      this.mapArrays[row].push(tempTile);
    }
  }
}

Map.prototype.displayMap = function() {
  $("#map").empty();
  for(var row = 0; row < this.mapArrays.length; row++) {
    var tempString = "";
    for(var col = 0; col < this.mapArrays[row].length; col++) {
      tempString += "<span id=\"location-" + row + "-" + col + "\" class=\"" + this.mapArrays[row][col].color + "\">" + this.mapArrays[row][col].symbol +"</span>";
    }
    $("#map").append("<p>" + tempString + "</p>");
  }
}

Map.prototype.adjustAllSpawns = function(percentage) {
  for(var row = 0; row < this.mapArrays.length; row++) {
    for(var col = 0; col < this.mapArrays[row].length; col++) {
      this.mapArrays[row][col].increaseSpawn(percentage);
    }
  }
}

Map.prototype.resetAllSpawns = function() {
  for(var row = 0; row < this.mapArrays.length; row++) {
    for(var col = 0; col < this.mapArrays[row].length; col++) {
      this.mapArrays[row][col].resetSpawn();
    }
  }
}

Map.prototype.displayRoomDesc = function() {
  $("#room-name").text(this.displayName);
  $("#room-info").text(this.description);
}

Map.prototype.displayAtmospheric() {
  var coinFlip = Math.floor(Math.random() * 2) + 1;
  if(coinFlip == 1) {
    var randomIdx = Math.floor(Math.random() * this.atmosphericStrings.length);
    $("#atmospheric-display").text(this.atmosphericStrings[randomIdx]);
  } else {
    $("#atmospheric-display").text("");
  }
}

// callback function for wall creating methods
function createWall(wallThis) {
  wallThis.canMove = false;
  wallThis.description = "A wall";
  wallThis.terrainType = "wall";
  wallThis.symbol = "^";
  wallThis.color = "wall";
}
// converts borders of map into wall tiles
Map.prototype.makeWalls = function() {
	var height = this.mapArrays.length;
  var width = this.mapArrays[0].length;
  var bottomRowY = this.mapArrays.length - 1;
  var lastColumnX = this.mapArrays[0].length - 1;

  for(var idx = 0; idx < width; idx++) {
  	var toWall = this.mapArrays[0][idx];
    createWall(toWall);
  }
  for(var idx = 0; idx < width; idx++) {
  	var toWall = this.mapArrays[bottomRowY][idx];
    createWall(toWall);
  }
  for(var idx = 1; idx < height-1; idx++) {
  	var toWall1 = this.mapArrays[idx][0];
    var toWall2 = this.mapArrays[idx][lastColumnX];
    createWall(toWall1);
    createWall(toWall2);
  }
}
// Makes individual tiles into walls
Map.prototype.makeAWall = function(yLocation, xLocation) {
  var toWall = this.mapArrays[yLocation][xLocation];
  createWall(toWall);
}

// Tile creation functions for room objects

function createChest(amount, room) {
  for(var idx = 0; idx < amount; idx++) {
    var chest = new Tile(-1, -1);
    chest.canMove = false;
    chest.description = "An old wooden chest";
    chest.terrainType = "chest";
    chest.symbol = "∃";
    chest.color = "purple";
    chest.searchable = true;
    chest.drops = [];

    room.chests.push(chest);
  }
}

function createDoor(amount, room) {
  for(var idx = 0; idx < amount; idx++) {
    var door = new Tile(-1, -1);
    door.canMove = false;
    door.description = "A sturdy door of oak planks with iron strips tying it together";
    door.terrainType = "door";
    door.symbol = "∏";
    door.color = "purple";
    door.locked = false;
    door.leadsTo = "";
    door.firstTime = false;
    door.fromWhere = "";

    room.doors.push(door);
  }
}

function createWater(amount, room) {
  for(var idx = 0; idx < amount; idx++) {
    var water = new Tile(-1, -1);
    water.canMove = true;
    water.description = "Murky water. You can't tell how deep it is.";
    water.terrainType = "water";
    water.symbol = "w";
    water.color = "blue";

    room.waters.push(water);
  }
}

function createLava(amount, room) {
  for(var idx = 0; idx < amount; idx++) {
    var lava = new Tile(-1, -1);
    lava.canMove = true;
    lava.description = "Fiery hot lava";
    lava.terrainType = "lava";
    lava.symbol = "w";
    lava.color = "bright-red";

    room.lavas.push(lava);
  }
}

function createSpike(amount, room) {
  for(var idx = 0; idx < amount; idx++) {
    var spike = new Tile(-1, -1);
    spike.canMove = true;
    spike.description = "Several sharp points stick up from the ground";
    spike.terrainType = "spike";
    spike.symbol = "#";
    spike.color = "spikes";

    room.spikes.push(spike);
  }
}

function createFirepit(amount, room) {
  for(var idx = 0; idx < amount; idx++) {
    var firepit = new Tile(-1, -1);
    firepit.canMove = false;
    firepit.description = "A shallow depression in the ground, filled with ashes. A few embers still glow brightly in the center.";
    firepit.terrainType = "firepit";
    firepit.symbol = "¥";
    firepit.color = "red";

    room.firepits.push(firepit);
  }
}

function createObjectSwitch(amount, room) {
  for(var idx = 0; idx < amount; idx++) {
    var objectSwitch = new Tile(-1, -1);
    objectSwitch.canMove = false;
    objectSwitch.description = "A stone pillar about chest-high, topped with a stone bowl that shows signs of intense heat";
    objectSwitch.terrainType = "objectSwitch";
    objectSwitch.symbol = "/";
    objectSwitch.color = "red";
    objectSwitch.inside = "";

    room.switches.push(objectSwitch);
  }
}

function createPlacedMonster(type, room) {
  var monster = new Tile(-1, -1);
  monster.canMove = false;
  monster.terrainType = "monster";
  monster.searchable = false;
  monster.color = "yellow";
  monster.monsterType = "";

  if(type === "golem") {
    monster.description = "A golem, much larger than any you've previously seen.";
    monster.symbol = "Ώ";
    monster.monsterType = "super golem";
  } else if(type === "dragon") {
    monster.description = "A massive scaled creature slumbers here. Its wings flap a little everytime it takes a breath. The air around the beast shimmers like the air around an intense fire."
    monster.symbol = "♠";
    monster.monsterType = "dragon";
  } else if(type === "random") {
    var randomMonster = getMonster();
    monster.description = "A monster of indeterminate type.";
    monster.monsterType = "random";
    monster.symbol = "!";
  }

  room.monsters.push(monster);
}

// end of map related code
// player object

function Player(userName) {
	this.name = userName;
  this.type = "player";
  this.alive = true;
  this.inCombat = false;
  this.maxHealth = 500;
  this.currentHealth = 500;
  this.previousHealth = 500;
  this.minDamage = 10;
  this.maxDamage = 10;
  // current location
  this.y = 0;
  this.x = 0;
  this.defense = 1;
  this.symbol = "Δ";
  this.weapons = [];
  this.items = [];
  this.commands = [];
  this.shortcuts = [];
  // crit chance out of 100
  this.critChance = 20;
  this.level = 1;
  this.equippedWeapon = {};
  // this.equippedArmor = {};
}

Player.prototype.setShortcuts = function() {
  this.shortcuts = [];
  for(var idx = 0; idx < this.commands.length ;idx++) {
    if(this.commands[idx] === "attack") {
      this.shortcuts.push("a");
    } else if(this.commands[idx] === "potion") {
      this.shortcuts.push("p");
    } else if(this.commands[idx] === "flee") {
      this.shortcuts.push("f");
    }
  }
}

Player.prototype.calculateDamage = function() {
  var minDamage = this.minDamage + this.equippedWeapon.minDamage;
  var maxDamage = this.maxDamage + this.equippedWeapon.maxDamage;
	var damageRange = maxDamage - minDamage;
	var damage = Math.floor(Math.random() * damageRange) + minDamage;

  var critHit = Math.floor(Math.random() * 100) + 1;
  if(critHit <= (this.critChance + this.equippedWeapon.critChance)) {
    damage += this.equippedWeapon.criticalHit;
  }

  return damage;
}

Player.prototype.healthbar = function() {
  var oldHP = this.previousHealth/this.maxHealth;
  var oldHP2 = Math.floor(oldHP * 240);
	var percentage = (this.currentHealth / this.maxHealth);
  var percentage2 = Math.floor(percentage * 240);
  $("div#hero-health").empty();
  $("div#hero-health").append("<div id=\"player-health-bar-outer\"><div id=\"player-health-bar-inner\"></div></div>");
  $("#player-health-bar-inner").css("width", oldHP2 + "px");
  $("#player-health-bar-inner").animate({width: percentage2 + "px"}, 600);

  $("#hero-health-display").text(this.currentHealth + "/" + this.maxHealth);
}

Player.prototype.kill = function() {
  this.alive = false;
  this.inCombat = false;
  this.commands = ["revive", "restart"];
  this.setShortcuts();
  this.displayCommands();
  $("#hero-image").fadeOut("slow");
  $("#hero-dead").delay(600).fadeIn("slow");
  $("#map").fadeOut("slow");
  $("#death-message").delay(600).fadeIn("slow");
  $("#combat-display").empty();
  $("#combat-display").append("<p>You died. Sorry.</p>")
}
// player inventory status checker and display methods
// potion drinking method is in CombatTracker now
Player.prototype.countPotions = function() {
  var potionAmount = 0;
  for(var idx= 0; idx < this.items.length; idx++) {
    if(this.items[idx].name === "potion") {
      potionAmount++;
    }
  }
  $("span#player-potions").text(potionAmount);
}

Player.prototype.countRevives = function() {
  var reviveAmount = 0;
  for(var idx= 0; idx < this.items.length; idx++) {
    if(this.items[idx].name === "revive") {
      reviveAmount++;
    }
  }
  $("span#player-revives").text(reviveAmount);
}

Player.prototype.countKeys = function() {
  var keyAmount = 0;
  for(var idx= 0; idx < this.items.length; idx++) {
    if(this.items[idx].name === "key") {
      keyAmount++;
    }
  }
  $("span#player-keys").text(keyAmount);
}

Player.prototype.displayWeapons = function() {
  for(var idx= 0; idx < this.weapons.length; idx++) {
    if(this.weapons[idx].name === "wood sword") {
      $("#woodSword").fadeIn("slow");
    } else if(this.weapons[idx].name === "metal sword") {
      $("#metalSword").fadeIn("slow");
    } else if(this.weapons[idx].name === "war hammer") {
      $("#warHammer").fadeIn("slow");
    } else if(this.weapons[idx].name === "mystic bow") {
      $("#bow").fadeIn("slow");
    } else {
      alert("something has gone very wrong!");
    }
  }
}

Player.prototype.displayPlayer = function() {
  console.log("#location-" + this.y + "-" + this.x);
  $("#location-" + this.y + "-" + this.x).text(this.symbol);
  $("#location-" + this.y + "-" + this.x).removeClass();
  $("#location-" + this.y + "-" + this.x).addClass("character");
}

Player.prototype.checkTorch = function() {
  var torchType = "none";
  for(var idx = 0; idx < this.items.length; idx++) {
    if(this.items[idx].name !== "torch" && this.items[idx].name !== "unlitTorch") {
    } else if(this.items[idx].name === "torch") {
      torchType = "lit";
    } else if(this.items[idx].name === "unlitTorch") {
      torchType = "unlit";
    }
  }
  return torchType;
}
// inventory management

Player.prototype.revive = function(currentMap) {
  $("#combat-display").text("You have no revives left!");
  for(var idx = 0; idx < this.items.length; idx++) {
    if(this.items[idx].name === "revive") {
      this.revives--;
      this.alive = true;
      this.currentHealth = this.maxHealth;
      this.healthbar();
      if(this.InCombat) {
        this.commands = ["attack", "flee", "potion", "equip"];
        this.setShortcuts();
        this.displayCommands();
      } else {
        var newEnvironment = new Environment(this);
        newEnvironment.recordTiles();
        newEnvironment.updateCommands();
      }
      $("#combat-display").text("Before you breathe no more you manage to empty your revival potion into your throat. As the darkness of death lifts, you are comforted by the knowledge that death’s door will not shut on you…this time. ");
      $("#death-message").fadeOut("slow");
      $("#map").delay(600).fadeIn("slow");
      $("#hero-dead").fadeOut("slow");
      $("#hero-image").delay(600).fadeIn("slow");
      currentMap.displayMap();
      this.displayPlayer();
      this.items.splice(idx, 1);
      idx--;
      break;
    }
  }
  this.countRevives();
}

Player.prototype.equipWeapon = function(weaponString) {
  var haveWeapon = false;
  for(var idx = 0; idx < this.weapons.length; idx++) {
    if(this.weapons[idx] != weaponString) {
      haveWeapon = false;
    }

    if(this.equippedWeapon.name === weaponString) {
      $("#combat-display").text("You already have this weapon equipped!");
      haveWeapon = true;
    } else {
      if(this.weapons[idx].name === weaponString) {
        this.equippedWeapon = this.weapons[idx];
        $("#combat-display").text("You have equipped " + this.weapons[idx].name + "!");
        $("#weapon-descriptions").text(this.weapons[idx].description);
        haveWeapon = true;
        $(".equipped").children().unwrap();

        if(this.weapons[idx].name === "bare hands") {
        } else if (this.weapons[idx].name === "wood sword") {
          $("#woodSword p").wrap("<div class=\"equipped\"></div>");
        } else if (this.weapons[idx].name === "metal sword") {
          $("#metalSword p").wrap("<div class=\"equipped\"></div>");
        } else if (this.weapons[idx].name === "mystic bow") {
          $("#bow p").wrap("<div class=\"equipped\"></div>");
        } else if (this.weapons[idx].name === "war hammer") {
          $("#warHammer p").wrap("<div class=\"equipped\"></div>");
        }
        break;
      }
    }
  }
  if(!haveWeapon) {
    $("#combat-display").text("You don't have this weapon!");
  }
}

// player-environment interaction, environment object
// Environment holds an array of the 8 tiles surrounding the player:
// [1,2,3
//  4,P,5
//  6,7,8]
// Environments should probably be generated once a turn, so that all the functions that check the surrounding tiles can just refer to it instead of doing the check themselves
function Environment(trackedPlayer) {
  this.surroundings = [];
  this.player = trackedPlayer;
}

Environment.prototype.recordTiles = function(currentMap) {
  var yStart = this.player.y - 1;
  var xStart = this.player.x - 1;
  this.surroundings = [];

  for(var row = yStart; row < yStart+3; row++) {
    for(var col = xStart; col < xStart+3; col++) {
      if(row != this.player.y && col != this.player.x) {
        this.surroundings.push(currentMap.mapArrays[row][col]);
      }
    }
  }
}
// formerly surroundingChecker
Environment.prototype.updateCommands = function() {
  var chestFound = false;
  var doorFound = false;
  var commands = ["equip", "potion", "look"];

  function addCommand(command) {
    if(!commands.includes(command)) {
      commands.push(command);
    }
  }

  this.surroundings.forEach(function(tile) {
    if(tile.searchable) {
      chestFound = true;
      addCommand("search");
    }
    if(tile.terrainType == "monster") {
      addCommand("fight");
    }
    if(tile.terrainType == "door") {
      doorFound = true;
      addCommand("open door");
    }
    if(tile.terrainType == "firepit" || area.terrainType == "objectSwitch") {
      addCommand("use");
    }
  });
  if(chestFound) {
    $("#door-image").stop().hide();
    $("#chest-image").delay(300).fadeIn(300);
  } else if(doorFound) {
    $("#chest-image").stop().hide();
    $("#door-image").delay(300).fadeIn(300);
  } else {
    $("#door-image").fadeOut(300);
    $("#chest-image").fadeOut(300);
  }
  this.player.commands = commands;
  this.player.setShortcuts();
  this.player.displayCommands();
}
//for when a player uses the "look" command
Environment.prototype.lookAround = function() {
  var descs = [];
  this.surroundings.forEach(function(tile) {
    descs.push(tile);
  });
  var detailString = "Northwest: " + descs[0] + "; North: " + descs[1] + "; Northeast: " + descs[2] + "; West: " + descs[3] + "; East: " + descs[4] + "; Southwest: " + descs[5] + "; South: " + descs[6] + "; Southeast: " + descs[7] + ".";

  $("#combat-display").text(detailString);
}

// combat object (combat-tracker) to handle all combat functions

function CombatTracker(trackedPlayer, otherObject) {
  this.player = trackedPlayer;
  this.opponent = otherObject || {};
}

CombatTracker.prototype.takeDamage = function(target, damageAmount) {
  target.previousHealth = target.currentHealth;
  target.currentHealth -= damageAmount;
  var targetString = (target.type == "player") ? "You take" : "The monster takes";
  $("#combat-display").append("<p>" + targetString + damageAmount + " damage, you have " + target.currentHealth + " health left.</p>");
  if(target.currentHealth <= 0) {
    target.kill();
    target.currentHealth = 0;
  }
  target.healthbar();
}

CombatTracker.prototype.healTarget = function(target, healAmount) {
  target.previousHealth = target.currentHealth;
  target.currentHealth += healthAmount;
  target.currentHealth = (target.currentHealth > target.maxHealth) ? target.maxHealth : target.currentHealth;
}

CombatTracker.prototype.playerPotion = function() {
  $("#combat-display").text("You have no potions to drink!");
  for(var idx = 0; idx < this.player.items.length; idx++) {
    if(this.player.items[idx].name === "potion") {
      this.healTarget(this.player, this.player.items[idx].addHealth);
      $("#combat-display").text("You drank a potion.");
      this.player.healthbar();
      this.player.items.splice(idx, 1);
      idx--;
      break;
    }
  }
  this.player.countPotions();
}
