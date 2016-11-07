// Constructor for weapons
function Weapon(name, damage, criticalHit) {
 this.name = name;
 this.damage = damage;
 this.criticalHit = criticalHit;
 this.description = "";
 this.symbol = "";
}


//Weapons

var woodSword = new Weapon("wood sword", 10, 20);
woodSword.description = "A warrior's first weapon.";
