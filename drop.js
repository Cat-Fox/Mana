game.mechanic.DropTable = Object.extend({
    // 1000 = 100%, 1 = 0.1%
    gold: null,
    equip: null,
    consumable: null,
    init: function(gold, equip, consumable){
        this.gold = gold;
        this.equip = equip;
        this.consumable = consumable;
    }
});

game.mechanic.drop = function(x, y, container_value, drop_table){
    
    var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
    
    var max_object_value = Math.floor(container_value + (container_value * (player.magic_find / 100)));
    var drop = false;
    console.log("drop max value "+max_object_value);
    //Drop Gold
    var chance_gold = Number.prototype.random(0, 1000);
    if(chance_gold <= drop_table.gold){
        var gold_amount = Number.prototype.random(1, max_object_value);
        var gold = me.entityPool.newInstanceOf("Gold", x, y, gold_amount);
        me.game.add(gold, game.object_layer);
    }
    //Drop Equip
    var chance_equip = Number.prototype.random(0, 1000);
    if(chance_equip <= drop_table.equip){
        var equip_value = Number.prototype.random(1, max_object_value);
        var equip_type = Number.prototype.random(0, 100);
        var equip = null;
        
        if(equip_type < 45){
            //ARMOR
            console.log("creating armor");
        } else if(equip_type < 90){
            //WEAPON
            var weapon_type = Number.prototype.random(0, 9);
            if(weapon_type < 3){
                //SHORT SWORD
                equip = me.entityPool.newInstanceOf("ShortSword", x, y);
            } else if(weapon_type < 6) {
                //LONG SWORD
                equip = me.entityPool.newInstanceOf("LongSword", x, y);
            } else if(weapon_type < 9){
                //AXE
                equip = me.entityPool.newInstanceOf("Axe", x, y);
            } else {
                //MACE
                equip = me.entityPoolnewInstanceOf("Morningstar", x, y);
            }
        } else {
            //ARTEFACT
            console.log("creating artefact");
        }
        
        if(equip !== null){
            me.game.add(equip, game.object_layer);
        }
    }
    
    //Drop Consumable
    var chance_consumable = Number.prototype.random(0, 1000);
    if(chance_consumable <= drop_table.consumable){
        var consumable = me.entityPool.newInstanceOf("HealthPotion", x, y);
        me.game.add(consumable, game.object_layer);
        drop = true;
    }
    
    if(drop){
        me.game.sort();
    }
}