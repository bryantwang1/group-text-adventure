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
