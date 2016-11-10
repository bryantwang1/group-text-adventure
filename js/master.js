var mapArrays = [];
var userCommands = [];
var playerInCombat = false;
var playerDead = false;
var currentEnemy = {};
var currentEnemyY = 0;
var currentEnemyX = 0;
var placedMonsterCombat = false;
var playerStart = true;
var rooms = [];
var atmosphericStrings = ["Something furry scurries by your feet.", "You feel a slow and steady dripping of water from the ceiling.", "A musty and unpleasant smell wafts in front of you.", "A bat flies past your head and disappears into the darkness.", "In the far distance your hear something shuffle toward you.", "The stone floor here is slick and slippery.", "Surely there’s a door nearby?", "You note a trickle of liquid on your arm, feel it, and taste your blood.", "A creaking and groaning as of rusty hinges starts from a far area of the room, then stops just as quickly.", "A tendril of mist curls around you.", "The ceiling seems to be closing in, but maybe that’s just you.", "The tile you’re on is loose, and it rattles loudly beneath you.", "A sound of stone scraping against stone reverberates for a short time, then seems to muffle itself."];

// Constructor for rooms
function Room(roomName) {
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
}

Room.prototype.displayer = function() {
  $("#room-name").text(this.displayName);
  $("#room-info").text(this.description);
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

    room.chests.push(chest);
  }
}
// Function similar to chestCreator but for doors
function doorCreator(amount, room) {
  for(var idx = 0; idx < amount; idx++) {
    var door = new Location(-1, -1);
    door.canMove = false;
    door.description = "A sturdy door of oak planks with iron strips tying it together";
    door.terrainType = "door";
    door.symbol = "∏";
    door.color = "purple";
    door.searchable = false;
    door.drops = [];
    door.locked = false;
    door.leadsTo = "";
    door.firstTime = false;
    door.fromWhere = "";

    room.doors.push(door);
  }
}
// Function similar to chestCreator but for water
function waterCreator(amount, room) {
  for(var idx = 0; idx < amount; idx++) {
    var water = new Location(-1, -1);
    water.canMove = true;
    water.description = "Murky water. You can't tell how deep it is.";
    water.terrainType = "water";
    water.symbol = "w";
    water.color = "blue";
    water.searchable = false;
    water.drops = [];

    room.waters.push(water);
  }
}
// Function similar to chestCreator but for lava
function lavaCreator(amount, room) {
  for(var idx = 0; idx < amount; idx++) {
    var lava = new Location(-1, -1);
    lava.canMove = true;
    lava.description = "Fiery hot lava";
    lava.terrainType = "lava";
    lava.symbol = "w";
    lava.color = "bright-red";
    lava.searchable = false;
    lava.drops = [];

    room.lavas.push(lava);
  }
}
// Function similar to chestCreator but for spikes
function spikeCreator(amount, room) {
  for(var idx = 0; idx < amount; idx++) {
    var spike = new Location(-1, -1);
    spike.canMove = true;
    spike.description = "Several sharp points stick up from the ground";
    spike.terrainType = "spike";
    spike.symbol = "#";
    spike.color = "spikes";
    spike.searchable = false;
    spike.drops = [];

    room.spikes.push(spike);
  }
}
// Function similar to chestCreator but for firepits
function firepitCreator(amount, room) {
  for(var idx = 0; idx < amount; idx++) {
    var firepit = new Location(-1, -1);
    firepit.canMove = false;
    firepit.description = "A shallow depression in the ground, filled with ashes. A few embers still glow brightly in the center.";
    firepit.terrainType = "firepit";
    firepit.symbol = "¥";
    firepit.color = "red";
    firepit.searchable = false;
    firepit.drops = [];

    room.firepits.push(firepit);
  }
}
// function similar to chestCreator but for switch objects
function objectSwitchCreator(amount, room) {
  for(var idx = 0; idx < amount; idx++) {
    var objectSwitch = new Location(-1, -1);
    objectSwitch.canMove = false;
    objectSwitch.description = "A stone pillar about chest-high, topped with a stone bowl that shows signs of intense heat";
    objectSwitch.terrainType = "objectSwitch";
    objectSwitch.symbol = "/";
    objectSwitch.color = "red";
    objectSwitch.searchable = false;
    objectSwitch.drops = [];
    objectSwitch.inside = "";

    room.switches.push(objectSwitch);
  }
}
// Function similar to chestCreator but for placed monsters
function placedMonsterCreator(type, room) {
  var monster = new Location(-1, -1);
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
// Makes individual tiles into walls
function miniWallMaker(yLocation, xLocation) {
  function waller(wallThis) {
    wallThis.canMove = false;
    wallThis.description = "A wall";
  	wallThis.terrainType = "wall";
    wallThis.symbol = "^";
    wallThis.color = "wall";
  }

  var toWall = mapArrays[yLocation][xLocation];
  waller(toWall);
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
  var chestFound = false;
  var doorFound = false;

  for(var idx = y; idx < y+3; idx++) {
  	for(var idx2 = x; idx2 < x+3; idx2++) {
    	// This if statement is how we skip checking the center tile(the one the player is on).
    	if(idx === player.y && idx2 === player.x) {
      } else {
      	var area = mapArrays[idx][idx2];
        if(area.searchable) {
          chestFound = true;
          if(userCommands.includes("search")) {
          } else {
          userCommands.push("search");
          }
        }
        if(area.terrainType === "monster") {
          if(userCommands.includes("fight")) {
          } else {
          userCommands.push("fight");
          }
        }
        if(area.terrainType === "door") {
          doorFound = true;
          if(userCommands.includes("open door")) {
          } else {
          userCommands.push("open door");
          }
        }
        if(area.terrainType === "firepit" || area.terrainType === "objectSwitch") {
          if(userCommands.includes("use")) {
          } else {
          userCommands.push("use");
          }
        }
        // Add more later
    	}
    }
  }
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
// function similar to surroundingChecker, to run when user inputs a use command
function objectUser(player) {
  var y = player.y - 1;
  var x = player.x - 1;
  var whichTorch = player.torchChecker();

  objectLoopBreaker: {
    for(var idx = y; idx < y+3; idx++) {
      for(var idx2 = x; idx2 < x+3; idx2++) {
        if(idx === player.y && idx2 === player.x) {
        } else {
          var area = mapArrays[idx][idx2];
          if(area.terrainType === "firepit") {
            if(whichTorch === "none") {
              $("#combat-display").text("You reach a hand toward the center of the firepit... Ouch! The faint embers were hotter than they looked. You pull your hand back toward your chest quickly.");
            } else if(whichTorch === "unlit") {
              for(var torchIdx = 0; torchIdx < player.items.length; torchIdx++) {
                if(player.items[torchIdx].name === "unlitTorch") {
                  player.items[torchIdx] = torch;
                  $("#which-torch").text("Lit Torch");
                }
              }
              $("#combat-display").text("You touch your unlit torch to the embers...your previously unlit torch springs to life with a whoosh.");
            } else if(whichTorch === "lit") {
              $("#combat-display").text("You thrust your lit torch at the firepit, but nothing happens.");
            } else {
              $("#combat-display").text("You shouldn't be seeing this message.");
            }
          } else if(area.terrainType === "objectSwitch") {
            if(whichTorch === "none") {
              $("#combat-display").text("You nudge the stone pillar, climb into the bowl on top, push it with all your might. Nothing happens. You sigh and brush the ashes off your clothing.");
            } else if(whichTorch === "unlit") {
              $("#combat-display").text("You prod the stone pillar with your unlit torch, nothing happens. It feels like you're onto something, though.");
            } else if(whichTorch === "lit") {
              $("#combat-display").text("You touch your torch's flame to the stone bowl atop the pillar. A groaning sound echoes through the room as somewhere some hidden mechanism activates.");
              var switchRoom = "";
              if(area.inside === "room3") {
                switchRoom = "room3";
              } else if(area.inside === "room4") {
                switchRoom = "room4";
              }
              console.log("about to run room manipulator: " + switchRoom);
              roomManipulator(player, switchRoom);
            } else {
              $("#combat-display").text("You shouldn't be seeing this message, bro.");
            }
          }
        }
      }
    }
  }
}
// Function similar to surroundingChecker, to run when user inputs an open door command
function doorOpener(player) {
  $("#combat-display").empty();
  var y = player.y - 1;
	var x = player.x - 1;
  function keyChecker() {
    for(var keyIdx = 0; keyIdx < player.items.length; keyIdx++) {
      if(player.items[keyIdx].name === "key") {
        return true;
        break;
      }
    }
  }
doorOpenerLoops: {
    for(var idx = y; idx < y+3; idx++) {
    	for(var idx2 = x; idx2 < x+3; idx2++) {
        if(idx === player.y && idx2 === player.x) {
        } else {
          var area = mapArrays[idx][idx2];
          if(area.terrainType === "door") {
            if(area.locked) {
              if(keyChecker()) {
                area.locked = false;
                area.firstTime = false;

                for(var itemsIdx = 0; itemsIdx < player.items.length; itemsIdx++) {
                  if(player.items[itemsIdx].name === "key") {
                    player.items.splice(itemsIdx, 1);
                    player.keyCounter();
                    break;
                  }
                }

                roomMover(player, area, true);

                break doorOpenerLoops;
              } else {
                $("#combat-display").text("You don't have a key to unlock this door.");
              }
            } else if(area.locked === false) {
              if(area.firstTime) {
                area.firstTime = false;
                roomMover(player, area, true);
              } else if (area.firstTime === false) {
                roomMover(player, area, false);
                break doorOpenerLoops;
              }
            }
          }
        }
      }
    }
  }
}
//
function roomMover(player, doorLocation, firstTime) {
  var playerTile = mapArrays[player.y][player.x];
  playerTile.playerHere = false;
  var whereToGo = doorLocation.leadsTo;
  var whereComeFrom = doorLocation.fromWhere;
  var roomNames = [];
  for(var roomIdx = 0; roomIdx < rooms.length; roomIdx++) {
    roomNames.push(rooms[roomIdx].name);
  }

  function whichRoom(element) {
        return element === whereToGo;
  }

  var whichRoomIndex = roomNames.findIndex(whichRoom);
  $("#map").fadeOut("fast");
  $("#map").fadeIn("fast");

  if(firstTime) {
    rooms[whichRoomIndex].generator(player, true);
  } else {
    rooms[whichRoomIndex].generator(player, false, whereComeFrom);
  }

  $("#combat-display").empty();
  atmosphericDisplayer();
  $("#combat-display").text("You enter another room.");
}
// Function similar to surroundingChecker, to run when user inputs a search command.
function searcher(player) {
  // Make this item display later
  searcherBreaker: {
    $("#combat-display").empty();
    var y = player.y - 1;
    var x = player.x - 1;

    for(var idx = y; idx < y+3; idx++) {
      for(var idx2 = x; idx2 < x+3; idx2++) {
        if(idx === player.y && idx2 === player.x) {
        } else {
          var area = mapArrays[idx][idx2];
          if(area.searchable) {
            if(area.trapped) {
              area.trapped = false;
              $("#chest-image").hide();
              $("#search-image").hide();
              currentEnemy = dragon;
              combatStarter(currentEnemy);
              userCommands = ["attack", "potion", "equip"];
              commandDisplayer();
              placedMonsterCombat = true;
              currentEnemyY = 2;
              currentEnemyX = 4;
              break searcherBreaker;
            } else {
              var displayText = "You searched a " + area.terrainType + ", you found";
              if(area.drops.length > 0){
                for(var idx3 = 0; idx3 < area.drops.length; idx3++) {
                  if(area.drops.length > 0) {
                    if(area.drops[0].itemType === "weapon") {
                      player.weapons.push(area.drops[0]);
                      $("#weapon-descriptions").text(area.drops[0].description);
                      displayText += " \"" + area.drops[0].name + "\"";
                      area.drops.shift();
                      idx3--;
                    } else if(area.drops[0].itemType === "item") {
                      if(area.drops[0].name === "torch" || area.drops[0].name === "unlitTorch") {
                        $("#torch").fadeIn("slow");
                        $("#which-torch").text("Unlit Torch")
                      }
                      if(area.drops[0].name === "potion") {
                        var potionAmount = Math.floor((Math.random() * 5) + 1);
                        for(var idx4 = 0; idx4 < potionAmount; idx4++) {
                          player.items.push(potion);
                        }
                        area.drops.shift();
                        idx3--;
                        player.potionCounter();
                        displayText += " \"" + "potion" + "(" + potionAmount + ")" + "\"";
                      } else {
                        player.items.push(area.drops[0]);
                        displayText += " \"" + area.drops[0].name + "\"";
                        area.drops.shift();
                        idx3--;
                      }
                    }
                  }
                }
                displayText += ". They have been added to your inventory.";
                player.reviveCounter();
                player.keyCounter();
                player.weaponDisplayer();
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
    $("#chest-image").fadeOut("fast");
    $("#search-image").delay(200).fadeIn("fast");
    $("#search-image").delay(200).fadeOut("fast");
    $("#chest-image").delay(600).fadeIn("fast");

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
  $("#room-hider").hide();
  $("#chest-image").stop().hide();
  $("#door-image").stop().hide();
  $("#search-image").stop().hide();
  $("#searcher-images").hide();
  $("#monster-health").show();
  $("#monster-health-number").show();
  if(monster.name === "dragon") {
    $("#map").empty();
    $("#map").append("<div id=\"dragon-onMap-image\"><img src=\"img/dragon-onMap.jpg\"></div>")
    $("#dragon-onMap-image").fadeIn(1000);
  }
  $("#" + monster.name + "-image").show();
  monster.saySomething();
  monster.healthBar();
  playerInCombat = true;
  userCommands = ["attack", "flee", "potion", "equip"];
  commandDisplayer();
}
// Function for the command "fight" which will initiate a fight with a monster on an adjacent tile. If there are multiple monsters for some reason it will initiate a fight with the first monster found.
function fighter(player) {
  var y = player.y - 1;
	var x = player.x - 1;

  for(var idx = y; idx < y+3; idx++) {
  	for(var idx2 = x; idx2 < x+3; idx2++) {
      if(idx === player.y && idx2 === player.x) {
      } else {
        var area = mapArrays[idx][idx2];
        if(area.terrainType === "monster") {
          if(area.monsterType === "super golem") {
            currentEnemy = superGolem;
          } else if(area.monsterType === "dragon") {
            currentEnemy = dragon;
          } else if(area.monsterType === "random") {
            currentEnemy = getMonster();
          }
          combatStarter(currentEnemy);
          if(area.monsterType === "dragon") {
            userCommands = ["attack", "potion", "equip"];
            commandDisplayer();
          }
          placedMonsterCombat = true;
          currentEnemyY = area.y;
          currentEnemyX = area.x;
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
  $("#" + currentEnemy.name + "-image").fadeOut("slow");;
  currentEnemy = {};
  playerInCombat = false;
  $("#monster-description").text("");
  $("#monster-name").text("");
  $("#monster-sounds").text("");
  $("#monster-health-number").hide();
  $("#monster-health").hide();
  $("#room-hider").delay(600).fadeIn(100);
  $("#room-description").delay(600).fadeIn("slow")
  $("#searcher-images").delay(600).fadeIn("slow");
  surroundingChecker(testPlayer);
}
// Function for the flee command
function playerFlee(player) {
  var fleeChance = Math.floor((Math.random() * 10) + 1);
  if(fleeChance > 6) {
    combatEnder(player);
    $("#combat-display").empty();
    $("#combat-display").text("You flee from the monster.");
    if(placedMonsterCombat) {
      placedMonsterCombat = false;
    }
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
  this.previousHealth = 500;
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
}

Player.prototype.healthBar = function() {
  console.log(this.previousHealth);
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
  $("#combat-display").text("You have no revives left!");
  for(var idx = 0; idx < this.items.length; idx++) {
    if(this.items[idx].name === "revive") {
      playerDead = false;
      this.restoreHealth(1000);
      this.revives -= 1;
      this.healthBar();
      if(currentEnemy !== dragon && currentEnemy !== superGolem) {
        combatEnder();
      }
      userCommands = ["attack", "flee", "potion", "equip"];
      commandDisplayer();
      $("#combat-display").text("Before you breathe no more you manage to empty your revival potion into your throat. As the darkness of death lifts, you are comforted by the knowledge that death’s door will not shut on you…this time. ");
      $("#death-message").fadeOut("slow");
      $("#map").delay(600).fadeIn("slow");
      $("#hero-dead").fadeOut("slow");
      $("#hero-image").delay(600).fadeIn("slow");
      this.items.splice(idx, 1);
      idx--;
      break;
    }
  }
  this.reviveCounter();
}

Player.prototype.takeDamage = function(damageAmount) {
  this.previousHealth = this.currentHealth;
	this.currentHealth -= damageAmount;
  this.healthBar();
  $("#combat-display").append("<p>You're attacked with " + damageAmount + " damage, your health is " + this.currentHealth + ".</p>");
  if(this.currentHealth <= 0) {
    this.currentHealth = 0;
    this.healthBar();
    playerDead = true;
    userCommands = ["revive"];
    commandDisplayer();
    $("#hero-image").fadeOut("slow");
    $("#hero-dead").delay(600).fadeIn("slow");
    $("#map").fadeOut("slow");
    $("#death-message").delay(600).fadeIn("slow");
    $("#combat-display").empty();
    $("#combat-display").append("<p>You died. Sorry.</p>")
  }
}

Player.prototype.restoreHealth = function(healthAmount) {
  this.previousHealth = this.currentHealth;
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
        $("#weapon-descriptions").text(this.weapons[idx].description);
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

Player.prototype.torchChecker = function() {
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

Player.prototype.potionCounter = function() {
  var potionAmount = 0;
  for(var idx= 0; idx < this.items.length; idx++) {
    if(this.items[idx].name === "potion") {
      potionAmount++;
    }
  }
  $("span#player-potions").text(potionAmount);
}

Player.prototype.reviveCounter = function() {
  var reviveAmount = 0;
  for(var idx= 0; idx < this.items.length; idx++) {
    if(this.items[idx].name === "revive") {
      reviveAmount++;
    }
  }
  $("span#player-revives").text(reviveAmount);
}

Player.prototype.keyCounter = function() {
  var keyAmount = 0;
  for(var idx= 0; idx < this.items.length; idx++) {
    if(this.items[idx].name === "key") {
      keyAmount++;
    }
  }
  $("span#player-keys").text(keyAmount);
}

Player.prototype.weaponDisplayer = function() {
  for(var idx= 0; idx < this.weapons.length; idx++) {
    if(this.weapons[idx].name === "wood sword") {
      $("#woodSword").fadeIn("slow");
    } else if(this.weapons[idx].name === "metal sword") {
      $("#metalSword").fadeIn("slow");
    } else if(this.weapons[idx].name === "war hammer") {
      $("#warHammer").fadeIn("slow");
    } else if(this.weapons[idx].name === "mystic bow") {
      $("#bow").fadeIn("slow");
    }
  }
}

function playerDisplayer(player) {
  console.log("#location-" + player.y + "-" + player.x);
  $("#location-" + player.y + "-" + player.x).text(player.symbol);
  $("#location-" + player.y + "-" + player.x).removeClass();
  $("#location-" + player.y + "-" + player.x).addClass("character");
}

// PLAYER STUFF ABOVE THIS LINE. MOVEMENT STUFF BELOW.

// Function to display random atmospheric strings or none at all.
function atmosphericDisplayer() {
  var atmosphericOrNot = Math.floor(Math.random() * 2) + 1;

  if(atmosphericOrNot === 1) {
    var whichAtmospheric = Math.floor(Math.random() * atmosphericStrings.length);
    $("#atmospheric-display").text(atmosphericStrings[whichAtmospheric]);
  } else {
    $("#atmospheric-display").text("");
  }
}
// Example of what would update the map on move.
function positionUpdater(player, oldY, oldX) {
  mapArrays[player.y + oldY][player.x + oldX].playerHere = false;
  mapArrays[player.y][player.x].playerHere = true;
}
//
function moveChecklist(player, spawnPercentage) {
  $("#combat-display").empty();
  $("#weapon-descriptions").text("");
  surroundingChecker(player);
  spawnChecker(player);
  var checkTile = mapArrays[player.y][player.x];
  if(checkTile.terrainType === "water") {
    player.takeDamage(50);
    $("#combat-display").text("The water contains leeches! They drain 50 points of health from your body.");
    if(playerInCombat) {
      $("#combat-display").append("<p>You have entered combat with a " + currentEnemy.name + ".</p>");
    }
  } else if(checkTile.terrainType === "spike") {
    player.takeDamage(250);
    $("#combat-display").text("You stumble into a pit of carefully sharpened spikes, and are unable to dodge all of them. You are still alive, but sport a few deep wounds reminding you to be wary of such traps in the future.");
    if(playerInCombat) {
      $("#combat-display").append("<p>You have entered combat with a " + currentEnemy.name + ".</p>");
    }
  } else if(checkTile.terrainType === "lava") {
    if(playerInCombat) {
      combatEnder();
    }
    player.takeDamage(1000);
    userCommands = [];
    commandDisplayer();
    $("#combat-display").prepend("<p>You walked on lava.</p>")
  }
  spawnAdjuster(spawnPercentage);
  mapDisplayer();
  playerDisplayer(player);
  atmosphericDisplayer();
}

// Move Up
function moveUp(player) {
  if(mapArrays[player.y-1][player.x].canMove) {
    player.y -= 1;
    positionUpdater(player,1,0);
    moveChecklist(player, 2);
  } else {
    $("#combat-display").empty();
    $("#combat-display").text("You can't move north from here!");
  }
}

// Move Down
function moveDown(player) {
  if(mapArrays[player.y+1][player.x].canMove) {
    player.y += 1;
    positionUpdater(player,-1,0);
    moveChecklist(player, 2);
  } else {
    $("#combat-display").empty();
    $("#combat-display").text("You can't move south from here!");
  }
}

// Move Left
function moveLeft(player) {
  if(mapArrays[player.y][player.x-1].canMove) {
    player.x -= 1;
    positionUpdater(player,0,1);
    moveChecklist(player, 2);
  } else {
    $("#combat-display").empty();
    $("#combat-display").text("You can't move west from here!");
  }
}

// Move Right
function moveRight(player) {
  if(mapArrays[player.y][player.x+1].canMove) {
    player.x += 1;
    positionUpdater(player,0,-1);
    moveChecklist(player, 2);
  } else {
    $("#combat-display").empty();
    $("#combat-display").text("You can't move east from here!");
  }
}

// MONSTER STUFF BELOW THIS LINE

// Constructor for monsters
function Monster(name, health, minDamage, maxDamage) {
 this.name = name;
 this.alive = true;
 this.maxHealth = health;
 this.currentHealth = health;
 this.previousHealth = health;
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

// Prototype method for generating a health bar based on current and max health. Needs to be tested. Should update the health bar everytime it's run as well. Don't forget the accompanying css. Animated a slightly different way from player healthbar just for experimentation.
Monster.prototype.healthBar = function() {
  var oldHP = Math.floor((this.previousHealth/this.maxHealth) * 100);
	var percentage = Math.floor((this.currentHealth / this.maxHealth) * 100);
  $("div#monster-health").empty();
  $("div#monster-health").append("<div id=\"monster-health-bar-outer\"><div id=\"monster-health-bar-inner\"></div></div>");
  $("#monster-health-bar-inner").css("width", oldHP + "%");
  $("#monster-health-bar-inner").animate({width: percentage + "%"}, 600);

  $("#monster-health-display").text(this.currentHealth + "/" + this.maxHealth);
}

Monster.prototype.statReset = function() {
  this.alive = true;
  this.currentHealth = this.maxHealth;
  this.healthBar();
}

// Prototype method for monsters to take damage. Changes alive property to false if their currentHealth falls to 0 or below. Hard coded testPlayer in for potions.
Monster.prototype.takeDamage = function(damageAmount) {
  var dragonSaver = currentEnemy;
  this.previousHealth = this.currentHealth;
	this.currentHealth -= damageAmount;
  this.healthBar();
  $("#combat-display").append("<p>You attack with " + damageAmount + " damage, the monster's health is " + this.currentHealth + ".</p>");
  if(this.currentHealth <= 0) {
  	this.alive = false;
    if(placedMonsterCombat) {
      var enemyTile = mapArrays[currentEnemyY][currentEnemyX];
      enemyTile.canMove = true;
      enemyTile.description = "A floor tile";
      enemyTile.terrainType = "floor";
      enemyTile.playerHere = false;
      enemyTile.symbol = "#";
      enemyTile.color = "tiles";
      enemyTile.monsterType = "";

      placedMonsterCombat = false;
      mapDisplayer();
      // hardcoding testPlayer in for now
      playerDisplayer(testPlayer);
    }
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
    if(dragonSaver.name === "dragon") {
      gameEnder();
    }
  }
}

Monster.prototype.restoreHealth = function(healthAmount) {
  this.previousHealth = this.currentHealth;
  this.currentHealth += healthAmount;
  if(this.currentHealth > this.maxHealth) {
    this.currentHealth = this.maxHealth;
  }
  this.healthBar();
}

// Example of a function for a chance to hit a monster instead of a sure hit.
function attack(damage, target) {
	// Generates and stores a random number from 1 to 10.
  $("#room-hider").hide();
  $("#searcher-images").hide();
  // hide room description on attack in case it bugs out and is showing
	var hitChance = Math.floor(Math.random() * 10) + 1;
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
  attack(retaliationDamage, player);
  monster.saySomething();
}
// Displays currently available commands to the user
function commandDisplayer() {
  $("#available-options").empty();
  $("#available-options").append("<li>Possible Commands:</li>")
  if(userCommands.length > 0) {
    for(var idx = 0; idx < userCommands.length; idx++) {
      $("#available-options").append("<li>" + userCommands[idx] + "</li>")
    }
  }
}

// CONTENT BELOW THIS LINE (MONSTERS)

var goblin = new Monster("goblin", 110, 10, 25);
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
golem.defense = 1;
golem.drops = ["puzzle item", "armor", "potion"];
golem.vocalizations = ["Rock crush you...", "Ugh!", "I slow. Hold still!", "Rock mad!", "Leave me alone...", "Oof!"];

var superGolem = new Monster("mega-golem", 660, 25, 50);
superGolem.description = "A massive rock monster, every time it moves the ground quakes.";
superGolem.defense = 3;
superGolem.drops = ["puzzle item", "armor", "potion"];
superGolem.vocalizations = ["Rock crush you...", "Ugh!", "I slow. Hold still!", "Rock mad!", "Leave me alone...", "Oof!"];

var skeleton = new Monster("skeleton", 120, 20, 40);
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
bareHands.description = "Bare hands description: Your bare fists. Nice and simple.";
this.image = "images/###.jpg";

var woodSword = new Weapon("wood sword", 10, 15, 20);
woodSword.description = "Wood sword description: A short, sturdy, and well-used wooden sword balances itself well in your hand. A warrior's first weapon. Deals alright damage.";
this.image = "images/###.jpg";

var metalSword = new Weapon("metal sword", 20, 34, 30);
metalSword.description = "Metal sword description: You’ve obtained a sharp and surprisingly light metal sword engraved with a series of mysterious symbols. Sharp, Brutal, and Highly Effective. Deals a good amount of damage per attack but can be inconsistent.";
this.image = "images/###.jpg";

var warHammer = new Weapon("war hammer", 15, 25, 70);
warHammer.description = "War hammer description: A well-weighted and scratched war hammer. Difficult to wield, and with an inexperienced user such as yourself, it regularly deals less damage per attack than the metal sword. However, when you get a good swing in, it has the potential to deal heavy damage in a single strike.";
this.image = "images/###.jpg";

var mysticBow = new Weapon("mystic bow", 26, 28, 40);
mysticBow.description = "This mystic bow seems to be strung with something valuable as gold but strong as iron. A long range weapon that delivers blows with precision. Slightly less damage potential than the metal sword but much more consistent. A well aimed shot can ultimately be more effective than the slash from a sword.";
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
shield.description = "Increases Defense chance";
this.image = "images/###.jpg";

var revive = new Item("revive", 0, 0, false);
revive.description = "Brings you back from the dead";

var unlitTorch = new Item("unlitTorch", 0, 0, false);
unlitTorch.description = "An unlit torch";

var torch = new Item("torch", 0, 0, false);
torch.description = "A lit torch";

// ROOM GENERATION BELOW THIS LINE
function roomManipulator(player, roomName) {
  console.log("running room manip");
  var savedPlayerY = player.y;
  var savedPlayerX = player.x;
  if(roomName === "room3") {
    room3.switched = true;
    room3.generator(player, false);
    mapArrays[player.y][player.x].playerHere = false;
    player.y = savedPlayerY;
    player.x = savedPlayerX;
    mapDisplayer();
    playerDisplayer(player);
    surroundingChecker(player);
  } else if(roomName === "room4") {
    room4.switched = true;
    room4.generator(player, false);
    mapArrays[player.y][player.x].playerHere = false;
    player.y = savedPlayerY;
    player.x = savedPlayerX;
    mapDisplayer();
    playerDisplayer(player);
    surroundingChecker(player);
  }
}
// Hard coded to use testPlayer y and x for now
function gameEnder() {
  $("#audio").empty();
  $("#audio").append("<audio autoplay loop src=\"music/victory.mp3\" type=\"audio/mpeg\"></audio>");
  $("#room-description").hide();
  $("#dragon-onMap-image").fadeOut("slow");
  $("#map").fadeOut("slow");
  $("#map").empty();
  $("#victory-image").delay(600).fadeIn("slow");
  userCommands = ["continue", "restart"];
  commandDisplayer();
  $("#combat-display").text("Congratulations, you finished the game! Would you like to continue playing with this character or restart the game?");
}

function gameStarter(player) {
  $("#starting-image").fadeOut("slow");
  $("#room-description").delay(750).fadeIn("slow");
  $("#help").delay(950).fadeIn(950);
  $("#map").delay(600).fadeIn("slow");
  $("#hero-image").delay(600).fadeIn("slow");
  $("#hero-health-number").delay(750).fadeIn("slow");
  $("#hero-health").delay(750).fadeIn("slow");
  $("#weapons-label").delay(900).fadeIn("slow");
  $("#weapons").delay(900).fadeIn("slow");
  $("#items-label").delay(1000).fadeIn("slow");
  $("#items").delay(1000).fadeIn("slow");
  surroundingChecker(player);
  $("#combat-display").text("Move with the arrow keys. The commands you can use at any given time (besides movement) are listed in the black box immediately above this one, labeled as Possible Commands.");
  playerStart = false;
}

var room1 = new Room("room1");
room1.displayName = "Entry Hall";
room1.description = "You're standing in a large, dark room. The stone floor and walls vanish into the gloom. Next to you rests an old chest, and unless you’re mistaken something behind you is radiating warmth. You can barely make out something else in the distance. Did it just move?";
rooms.push(room1);
// This function should be run to generate room1 at the beginning and when players pass back in through a door, provide true for createdBefore if it's the first time you're running it, otherwise leave it empty or provide true.
room1.generator = function(player, createdBefore, whereFrom) {
  $("#audio").empty();
  $("#audio").append("<audio autoplay loop src=\"music/first.mp3\" type=\"audio/mpeg\"></audio>");
  var room = this;
  // Generates the items for the room
  function itemPlacer(runCreator) {
    if(runCreator) {
      doorCreator(1, room);
      chestCreator(3, room);
      waterCreator(5, room);
      lavaCreator(4, room);
      spikeCreator(2, room);
      placedMonsterCreator("random", room);
    }
    room.doors[0].y = 0;
    room.doors[0].x = 5;
    room.chests[0].y = 3;
    room.chests[0].x = 1;
    room.chests[1].y = 5;
    room.chests[1].x = 7;
    room.chests[2].y = 8;
    room.chests[2].x = 3;
    room.waters[0].y = 1;
    room.waters[0].x = 1;
    room.waters[1].y = 2;
    room.waters[1].x = 1;
    room.waters[2].y = 2;
    room.waters[2].x = 2;
    room.waters[3].y = 4;
    room.waters[3].x = 1;
    room.waters[4].y = 4;
    room.waters[4].x = 2;
    room.lavas[0].y = 7;
    room.lavas[0].x = 5;
    room.lavas[1].y = 7;
    room.lavas[1].x = 4;
    room.lavas[2].y = 8;
    room.lavas[2].x = 5;
    room.lavas[3].y = 8;
    room.lavas[3].x = 4;
    room.monsters[0].y = 1;
    room.monsters[0].x = 5;
    room.spikes[0].y = 2;
    room.spikes[0].x = 4;
    room.spikes[1].y = 2;
    room.spikes[1].x = 6;

    mapArrays[room.doors[0].y][room.doors[0].x] = room.doors[0];
    mapArrays[room.chests[0].y][room.chests[0].x] = room.chests[0];
    mapArrays[room.chests[1].y][room.chests[1].x] = room.chests[1];
    mapArrays[room.chests[2].y][room.chests[2].x] = room.chests[2];
    mapArrays[room.waters[0].y][room.waters[0].x] = room.waters[0];
    mapArrays[room.waters[1].y][room.waters[1].x] = room.waters[1];
    mapArrays[room.waters[2].y][room.waters[2].x] = room.waters[2];
    mapArrays[room.waters[3].y][room.waters[3].x] = room.waters[3];
    mapArrays[room.waters[4].y][room.waters[4].x] = room.waters[4];
    mapArrays[room.lavas[0].y][room.lavas[0].x] = room.lavas[0];
    mapArrays[room.lavas[1].y][room.lavas[1].x] = room.lavas[1];
    mapArrays[room.lavas[2].y][room.lavas[2].x] = room.lavas[2];
    mapArrays[room.lavas[3].y][room.lavas[3].x] = room.lavas[3];
    mapArrays[room.monsters[0].y][room.monsters[0].x] = room.monsters[0];
    mapArrays[room.spikes[0].y][room.spikes[0].x] = room.spikes[0];
    mapArrays[room.spikes[1].y][room.spikes[1].x] = room.spikes[1];

    miniWallMaker(1,4);
    miniWallMaker(1,6);
  }
  // Don't run item fillers after the first time
  function itemFiller() {
    room.doors[0].locked = true;
    room.doors[0].leadsTo = "room2";
    room.doors[0].firstTime = true;
    room.doors[0].fromWhere = "room1";

    room.chests[0].drops.push(key);
    room.chests[1].drops.push(woodSword, potion);
    room.chests[2].drops.push(revive);
  }

  mapCreator(10,10);
  wallMaker();
  itemPlacer(createdBefore);
  if(createdBefore){
    itemFiller();
    player.y = 5;
    player.x = 5;
    mapArrays[5][5].playerHere = true;
  } else {
    if(whereFrom === "room2") {
      player.y = 1;
      player.x = 5;
      mapArrays[2][5].playerHere = true;
    }
  }
  mapDisplayer();
  room.displayer();
  playerDisplayer(player);
  surroundingChecker(player);
}

var room2 = new Room("room2");
room2.displayName = "The Room of Despair";
room2.description = "You find yourself in a new room. Somewhere off to your right something makes a noise, and then all is silent again. The walls are closer in than before, and there’s no obvious exit. Hopefully there's another door around here somewhere, but will it require another key?";
rooms.push(room2);
room2.generator = function(player, createdBefore, whereFrom) {
  $("#audio").empty();
  $("#audio").append("<audio autoplay loop src=\"music/second.mp3\" type=\"audio/mpeg\"></audio>");
  var room = this;
  function itemPlacer(runCreator) {
    if(runCreator) {
      doorCreator(2, room);
      chestCreator(4, room);
      firepitCreator(1, room);
      spikeCreator(4, room);
    }
    room.doors[0].y = 0;
    room.doors[0].x = 5;
    room.doors[1].y = 9;
    room.doors[1].x = 5;
    room.chests[0].y = 2;
    room.chests[0].x = 1;
    room.chests[1].y = 1;
    room.chests[1].x = 6;
    room.chests[2].y = 8;
    room.chests[2].x = 1;
    room.chests[3].y = 7;
    room.chests[3].x = 8;
    room.firepits[0].y = 1;
    room.firepits[0].x = 8;
    room.spikes[0].y = 7;
    room.spikes[0].x = 1;
    room.spikes[1].y = 7;
    room.spikes[1].x = 2;
    room.spikes[2].y = 7;
    room.spikes[2].x = 7;
    room.spikes[3].y = 8;
    room.spikes[3].x = 7;

    mapArrays[room.doors[0].y][room.doors[0].x] = room.doors[0];
    mapArrays[room.doors[1].y][room.doors[1].x] = room.doors[1];
    mapArrays[room.chests[0].y][room.chests[0].x] = room.chests[0];
    mapArrays[room.chests[1].y][room.chests[1].x] = room.chests[1];
    mapArrays[room.chests[2].y][room.chests[2].x] = room.chests[2];
    mapArrays[room.chests[3].y][room.chests[3].x] = room.chests[3];
    mapArrays[room.firepits[0].y][room.firepits[0].x] = room.firepits[0];
    mapArrays[room.spikes[0].y][room.spikes[0].x] = room.spikes[0];
    mapArrays[room.spikes[1].y][room.spikes[1].x] = room.spikes[1];
    mapArrays[room.spikes[2].y][room.spikes[2].x] = room.spikes[2];
    mapArrays[room.spikes[3].y][room.spikes[3].x] = room.spikes[3];

    miniWallMaker(2, 4);
    miniWallMaker(2, 5);
    miniWallMaker(2, 6);
    miniWallMaker(2, 7);
    miniWallMaker(1, 7);
    miniWallMaker(4, 3);
    miniWallMaker(7, 4);
    miniWallMaker(8, 4);
    miniWallMaker(6, 7);
    miniWallMaker(6, 8);
  }
  function itemFiller() {
    room.doors[0].locked = true;
    room.doors[0].firstTime = true;
    room.doors[0].leadsTo = "room3";
    room.doors[0].fromWhere = "room2";
    room.doors[1].leadsTo = "room1";
    room.doors[1].fromWhere = "room2";

    room.chests[0].drops.push(potion);
    room.chests[1].drops.push(metalSword);
    room.chests[2].drops.push(key);
    room.chests[3].drops.push();
  }

  mapCreator(10,10);
  wallMaker();
  itemPlacer(createdBefore);
  if(createdBefore){
    itemFiller();
    player.y = 8;
    player.x = 5;
    mapArrays[8][5].playerHere = true;
  } else {
    if(whereFrom === "room3") {
      player.y = 1;
      player.x = 5;
      mapArrays[8][5].playerHere = true;
    } else {
      player.y = 8;
      player.x = 5;
      mapArrays[8][5].playerHere = true;
    }
  }
  mapDisplayer();
  room.displayer();
  playerDisplayer(player);
  surroundingChecker(player);
}

var room3 = new Room("room3");
room3.displayName = "The Slightly Puzzling Room";
room3.description = "You hear water, and it’s not just a trickle. Your normal poor visibility is worse than usual, as a mist seems to cling to everything. You hear some sort of mechanical grinding for a few seconds, but then it shudders to a halt. A new menace? Or a help?";
room3.switched = false;
rooms.push(room3);
room3.generator = function(player, createdBefore, whereFrom) {
  $("#audio").empty();
  $("#audio").append("<audio autoplay loop src=\"music/third.mp3\" type=\"audio/mpeg\"></audio>");
  var room = this;
  function itemPlacer(runCreator) {
    if(runCreator) {
      doorCreator(2, room);
      chestCreator(2, room);
      placedMonsterCreator("golem", room);
      waterCreator(8, room);
      objectSwitchCreator(1, room);
    }
    room.doors[0].y = 0;
    room.doors[0].x = 1;
    room.doors[1].y = 9;
    room.doors[1].x = 8;
    room.chests[0].y = 1;
    room.chests[0].x = 8;
    room.chests[1].y = 8;
    room.chests[1].x = 1;
    room.monsters[0].y = 5;
    room.monsters[0].x = 1;
    room.waters[0].y = 1;
    room.waters[0].x = 6;
    room.waters[1].y = 1;
    room.waters[1].x = 7;
    room.waters[2].y = 2;
    room.waters[2].x = 6;
    room.waters[3].y = 2;
    room.waters[3].x = 7;
    room.waters[4].y = 2;
    room.waters[4].x = 8;
    room.waters[5].y = 3;
    room.waters[5].x = 6;
    room.waters[6].y = 3;
    room.waters[6].x = 7;
    room.waters[7].y = 3;
    room.waters[7].x = 8;
    room.switches[0].y = 6;
    room.switches[0].x = 3;

    mapArrays[room.doors[0].y][room.doors[0].x] = room.doors[0];
    mapArrays[room.doors[1].y][room.doors[1].x] = room.doors[1];
    mapArrays[room.chests[0].y][room.chests[0].x] = room.chests[0];
    mapArrays[room.chests[1].y][room.chests[1].x] = room.chests[1];
    mapArrays[room.monsters[0].y][room.monsters[0].x] = room.monsters[0];
    mapArrays[room.waters[0].y][room.waters[0].x] = room.waters[0];
    mapArrays[room.waters[1].y][room.waters[1].x] = room.waters[1];
    mapArrays[room.waters[2].y][room.waters[2].x] = room.waters[2];
    mapArrays[room.waters[3].y][room.waters[3].x] = room.waters[3];
    mapArrays[room.waters[5].y][room.waters[5].x] = room.waters[5];
    mapArrays[room.waters[6].y][room.waters[6].x] = room.waters[6];
    mapArrays[room.switches[0].y][room.switches[0].x] = room.switches[0];
    if(room.switched === false) {
      mapArrays[room.waters[4].y][room.waters[4].x] = room.waters[4];
      mapArrays[room.waters[7].y][room.waters[7].x] = room.waters[7];
    }

    miniWallMaker(5,2);
    miniWallMaker(5,3);
    miniWallMaker(5,4);
    miniWallMaker(6,4);
    miniWallMaker(7,4);
    miniWallMaker(8,4);
  }
  function itemFiller() {
    room.doors[0].locked = true;
    room.doors[0].firstTime = true;
    room.doors[0].leadsTo = "room4";
    room.doors[0].fromWhere = "room3";
    room.doors[1].leadsTo = "room2";
    room.doors[1].fromWhere = "room3";

    room.chests[0].drops.push(mysticBow, revive);
    room.chests[1].drops.push(potion, unlitTorch, warHammer, key);

    room.switches[0].inside = "room3";
  }

  mapCreator(10,10);
  wallMaker();
  itemPlacer(createdBefore);
  if(createdBefore){
    itemFiller();
    player.y = 8;
    player.x = 8;
    mapArrays[8][8].playerHere = true;
  } else {
    if(whereFrom === "room2") {
      player.y = 8;
      player.x = 8;
      mapArrays[8][8].playerHere = true;
    } else {
      player.y = 1;
      player.x = 1;
      mapArrays[1][1].playerHere = true;
    }
  }
  mapDisplayer();
  room.displayer();
  playerDisplayer(player);
  surroundingChecker(player);
}

var room4 = new Room("room4");
room4.displayName = "The Maze Room";
room4.description = "A maze of columns, spike traps, and walls lies before you. You hear some sort of rustling in a far hallway, and you almost think you hear a great rumbling sigh somewhere. Surely that couldn’t involve you. Surely.";
room4.switched = false;
rooms.push(room4);
room4.generator = function(player, createdBefore, whereFrom) {
  $("#audio").empty();
  $("#audio").append("<audio autoplay loop src=\"music/maze.mp3\" type=\"audio/mpeg\"></audio>");
  var room = this;
  function itemPlacer(runCreator) {
    if(runCreator) {
      doorCreator(2, room);
      chestCreator(2, room);
      spikeCreator(6, room);
      objectSwitchCreator(1, room);
    }
    room.doors[0].y = 0;
    room.doors[0].x = 1;
    room.doors[1].y = 9;
    room.doors[1].x = 8;
    room.chests[0].y = 1;
    room.chests[0].x = 4;
    room.chests[1].y = 5;
    room.chests[1].x = 8;
    room.spikes[0].y = 3;
    room.spikes[0].x = 5;
    room.spikes[1].y = 5;
    room.spikes[1].x = 1;
    room.spikes[2].y = 5;
    room.spikes[2].x = 4;
    room.spikes[3].y = 5;
    room.spikes[3].x = 7;
    room.spikes[4].y = 7;
    room.spikes[4].x = 4;
    room.spikes[5].y = 7;
    room.spikes[5].x = 6;
    room.switches[0].y = 7;
    room.switches[0].x = 8;
    //switch at y=7,x=8
    //removable wall at y=7,x=1

    mapArrays[room.doors[0].y][room.doors[0].x] = room.doors[0];
    mapArrays[room.doors[1].y][room.doors[1].x] = room.doors[1];
    mapArrays[room.chests[0].y][room.chests[0].x] = room.chests[0];
    mapArrays[room.chests[1].y][room.chests[1].x] = room.chests[1];
    mapArrays[room.spikes[0].y][room.spikes[0].x] = room.spikes[0];
    mapArrays[room.spikes[1].y][room.spikes[1].x] = room.spikes[1];
    mapArrays[room.spikes[2].y][room.spikes[2].x] = room.spikes[2];
    mapArrays[room.spikes[3].y][room.spikes[3].x] = room.spikes[3];
    mapArrays[room.spikes[4].y][room.spikes[4].x] = room.spikes[4];
    mapArrays[room.spikes[5].y][room.spikes[5].x] = room.spikes[5];
    mapArrays[room.switches[0].y][room.switches[0].x] = room.switches[0]

    miniWallMaker(2,2);
    miniWallMaker(2,3);
    miniWallMaker(2,4);
    miniWallMaker(2,5);
    miniWallMaker(2,7);
    miniWallMaker(1,5);
    miniWallMaker(3,4);
    miniWallMaker(3,7);
    miniWallMaker(4,2);
    miniWallMaker(4,7);
    miniWallMaker(5,2);
    miniWallMaker(5,3);
    miniWallMaker(5,5);
    miniWallMaker(6,7);
    miniWallMaker(6,8);
    miniWallMaker(7,2);
    miniWallMaker(7,3);
    miniWallMaker(7,5);
    miniWallMaker(7,7);

    if(room.switched === false) {
      miniWallMaker(7,1);
    }
  }
  function itemFiller() {
    room.doors[0].locked = true;
    room.doors[0].firstTime = true;
    room.doors[0].leadsTo = "room5";
    room.doors[0].fromWhere = "room4";
    room.doors[1].leadsTo = "room3";
    room.doors[1].fromWhere = "room4";
    room.switches[0].inside = "room4";

    room.chests[0].drops.push(potion, potion, revive);
    room.chests[1].drops.push(revive, key);
  }

  mapCreator(10,10);
  wallMaker();
  itemPlacer(createdBefore);
  if(createdBefore){
    itemFiller();
    player.y = 8;
    player.x = 8;
    mapArrays[8][8].playerHere = true;
  } else {
    if(whereFrom === "room3") {
      player.y = 8;
      player.x = 8;
      mapArrays[8][8].playerHere = true;
    } else {
      player.y = 1;
      player.x = 1;
      mapArrays[1][1].playerHere = true;
    }
  }
  mapDisplayer();
  room.displayer();
  playerDisplayer(player);
  surroundingChecker(player);
}

var room5 = new Room("room5");
room5.displayName = "The Treasure Room";
room5.description = "As you pass through the door, a warm, red glow envelopes you. Soon you realize why: The entire room is filled with a bed of lava. A narrow stone bridge arches above the lava to a wider platform, at the center of which slumbers a huge scaly beast, its tail curling protectively around a large chest beside it."
rooms.push(room5);
room5.generator = function(player, createdBefore, whereFrom) {
  $("#audio").empty();
  $("#audio").append("<audio autoplay loop src=\"music/boss.mp3\" type=\"audio/mpeg\"></audio>");
  var room = this;
  function itemPlacer(runCreator) {
    if(runCreator) {
      doorCreator(2, room);
      chestCreator(1, room);
      placedMonsterCreator("dragon", room);
    }
    room.doors[0].y = 9;
    room.doors[0].x = 5;
    room.chests[0].y = 2;
    room.chests[0].x = 5;
    room.monsters[0].y = 2;
    room.monsters[0].x = 4;

    room.chests[0].trapped = true;

    var lavaCounter = 0;
    for(var yIdx = 1; yIdx < 9; yIdx++) {
      for(var xIdx = 1; xIdx < 9; xIdx++) {
        lavaCreator(1, room);
        mapArrays[yIdx][xIdx] = room.lavas[lavaCounter];
        lavaCounter++;
      }
    }

    for(var yIdx = 1; yIdx < 4; yIdx++) {
      for(var xIdx = 3; xIdx < 7; xIdx++) {
        var selectTile = mapArrays[yIdx][xIdx];
        selectTile.terrainType = "floor";
        selectTile.description = "A floor tile";
        selectTile.symbol = "#";
        selectTile.color = "tiles";
      }
    }

    for(var yIdx = 4; yIdx < 9; yIdx++) {
      for(var xIdx = 4; xIdx < 6; xIdx++) {
        var selectTile = mapArrays[yIdx][xIdx];
        selectTile.terrainType = "floor";
        selectTile.description = "A floor tile";
        selectTile.symbol = "#";
        selectTile.color = "tiles";
      }
    }

    mapArrays[room.doors[0].y][room.doors[0].x] = room.doors[0];
    mapArrays[room.chests[0].y][room.chests[0].x] = room.chests[0];
    mapArrays[room.monsters[0].y][room.monsters[0].x] = room.monsters[0];
  }
  function itemFiller() {
    room.doors[0].leadsTo = "room4";
    room.doors[0].fromWhere = "room5";

    room.chests[0].drops.push(potion, potion, potion, potion, potion, potion, potion, potion, potion, potion, revive, revive, revive, revive, revive, revive, revive, revive, revive, revive, revive, revive, revive, revive, revive, revive, revive, revive, revive, revive, revive);
  }

  mapCreator(10,10);
  wallMaker();
  itemPlacer(createdBefore);
  if(createdBefore){
    itemFiller();
    player.y = 8;
    player.x = 5;
    mapArrays[8][5].playerHere = true;
  } else {
    if(whereFrom === "room4") {
      player.y = 8;
      player.x = 5;
      mapArrays[8][5].playerHere = true;
    } else {
      player.y = 1;
      player.x = 1;
      mapArrays[1][1].playerHere = true;
    }
  }
  mapDisplayer();
  room.displayer();
  playerDisplayer(player);
  surroundingChecker(player);
}

// Only in back-end for testing purposes
var testPlayer = new Player("You");
// Front-end below this line

$(function() {
  var equipTyped = false;
  room1.generator(testPlayer, true);
  testPlayer.healthBar()
  testPlayer.weapons.push(bareHands);
  testPlayer.equippedWeapon = bareHands;
  testPlayer.potionCounter();
  testPlayer.reviveCounter();
  testPlayer.keyCounter();
  userCommands = ["start"]
  commandDisplayer();
  $("#combat-display").text("Hi, welcome to our text adventure! Type start in the input box and hit enter to begin.");

  // Code to make arrow keys work to move
  $(document).on("keydown", function(event) {
    if(event.which === 37) {
      if(playerInCombat === false && playerDead === false && playerStart === false) {
        moveLeft(testPlayer);
      } else {
        if(playerDead) {
          $("#combat-display").text("You can't move...you're dead!");
        } else if(playerInCombat) {
          $("#combat-display").text("You can't move while in combat!");
        }
      }
    } else if(event.which === 38) {
      if(playerInCombat === false && playerDead === false && playerStart === false) {
        moveUp(testPlayer);
      } else {
        if(playerDead) {
          $("#combat-display").text("You can't move...you're dead!");
        } else if(playerInCombat) {
          $("#combat-display").text("You can't move while in combat!");
        }
      }
    } else if(event.which === 39) {
      if(playerInCombat === false && playerDead === false && playerStart === false) {
        moveRight(testPlayer);
      } else {
        if(playerDead) {
          $("#combat-display").text("You can't move...you're dead!");
        } else if(playerInCombat) {
          $("#combat-display").text("You can't move while in combat!");
        }
      }
    } else if(event.which === 40) {
      if(playerInCombat === false && playerDead === false && playerStart === false) {
        moveDown(testPlayer);
      } else {
        if(playerDead) {
          $("#combat-display").text("You can't move...you're dead!");
        } else if(playerInCombat) {
          $("#combat-display").text("You can't move while in combat!");
        }
      }
    }
  });

  $("form#input-form").submit(function(event) {
      event.preventDefault();

      var userInput = $("#user-input").val().toLowerCase();
      $("#weapon-descriptions").text("");

      if(playerInCombat) {
        if(equipTyped) {
          testPlayer.equipWeapon(userInput);
          equipTyped = false;
        } else {
          if(userCommands.includes(userInput) || userInput === "dev healz") {
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
            } else if(userInput === "dev healz") {
              testPlayer.restoreHealth(1000);
              testPlayer.healthBar();
            } else {
              $("#combat-display").text("You can't do that.");
            }
          } else {
            $("#combat-display").text("You can't do that.");
          }
        }
      } else {
        if(equipTyped) {
          testPlayer.equipWeapon(userInput);
          equipTyped = false;
        } else {
          if(userCommands.includes(userInput) || userInput === "dev healz") {
            if(userInput === "search") {
              searcher(testPlayer);
            } else if(userInput === "potion") {
              testPlayer.drinkPotion();
            } else if(userInput === "equip") {
              var weaponNames = [];
              for(var idx = 0; idx < testPlayer.weapons.length; idx++) {
                weaponNames.push(testPlayer.weapons[idx].name);
              }
              $("#combat-display").text("What would you like to equip? Type its name in the command space and hit enter. Available weapons: " + "| " + weaponNames.join(" | ") + " |");
              equipTyped = true;
            } else if(userInput === "look") {
              looker(testPlayer);
            } else if(userInput === "open door") {
              doorOpener(testPlayer);
            } else if(userInput === "fight") {
              fighter(testPlayer);
            } else if(userInput === "use") {
              objectUser(testPlayer);
            } else if(userInput === "continue") {
              $("#room-description").show();
              $("#victory-image").fadeOut("slow");
              $("#map").delay(600).fadeIn("slow");
              $("#combat-display").text("");
              mapDisplayer();
              playerDisplayer(testPlayer);
              surroundingChecker(testPlayer);
            } else if(userInput === "restart") {
              window.location.reload();
            } else if(userInput === "start") {
              gameStarter(testPlayer);
            } else if(userInput === "dev healz") {
              testPlayer.restoreHealth(1000);
              testPlayer.healthBar();
            } else {
              $("#combat-display").text("You can't do that.");
            }
          } else {
            $("#combat-display").text("You can't do that.");
          }
        }
      }
      $("#user-input").val("");
  });
});
