var monsters = ["goblin", "wizard", "dragon", "golem", "skeleton"];
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

var testMonster = new Monster("testes", 50, 10, 10);
testMonster.defense = 2;

// Prototype method for monster to emit a random vocalization from its library.
Monster.prototype.saySomething = function() {
	var howMany = this.vocalizations.length;
  var whichSound = Math.floor(Math.random() * howMany) + 1;

  $("span#someID").text(this.vocalizations[whichSound]);
}

// Prototype method for generating a health bar based on current and max health. Needs to be tested. Should update the health bar everytime it's run as well. Don't forget the accompanying css.
Monster.prototype.healthBar = function() {
	var percentage = Math.floor((currentHealth / maxHealth) * 10);
  // Need jQuery here
  $("div#vil-health-bar").empty();
  $("div#vil-health-bar").append("<div id=\"health-bar-outer\"><div id=\"health-bar-inner\"></div></div>");
  $("div#health-bar-inner").css({"width":"\"" + percentage +"%\";"});
}

// Prototype method for monsters to take damage. Changes alive property to false if their currentHealth falls to 0 or below.
Monster.prototype.takeDamage = function(damageAmount) {
	this.currentHealth -= damageAmount;
  alert("You attack with " + damageAmount + ", the monster's health is " + this.currentHealth);
  if(this.currentHealth <= 0) {
  	this.alive = false;
    // Set playerInCombat = false; when merged into one script file
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

// Function to possibly grab a random monster out of 6.
function getMonster() {
  var number = Math.floor(Math.random() * monsters.length);
   return monsters[number];
}
