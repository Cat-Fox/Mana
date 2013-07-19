game.mechanic.Stats = Object.extend({
    level: null, //number
    str: null, //number
    agi: null, //number
    end: null, //number
    int: null, //number
    player: null, //boolean
    init: function(str, agi, end, int, player) {
        this.str = str;
        this.agi = agi;
        this.end = end;
        this.int = int;
        this.player = player;
    },
    getHP: function() {
        var hp_end_plus = Math.floor(this.end * 0.7);
        var hp_level_plus = Math.floor(this.level * 0.35);
        return 30 + hp_end_plus + hp_level_plus;
    },
    getSalePrice: function(price) {
        var sale = Math.floor(this.int * 0.3);
        var sale = price - (sale / 100);
        return price - sale;
    },
    getBonusExp: function(exp) {
        var bonus = Math.floor(this.int * 0.3);
        var bonus = bonus - (bonus / 100);
        return exp + bonus;
    },
    countMagicPower: function() {

    },
    getMagicFind: function() {

    },
    getVelocity: function() {
        return 1.3 + (this.agi / 95);
    },
    getDmg: function() {
        var weapon = me.gamestat.getItemValue("equip").weapon;
        if (weapon === null) {
            return 5;
        } else {
            var result = [];
            weapon = game.mechanic.get_inventory_item(weapon);
            result.push({type: "normal", dmg: weapon.attributes.dmg});
            if (typeof weapon.fire_dmg !== "undefined") {
                result.push({type: "magic", element: "fire", dmg: weapon.attributes.fire_dmg});
            }
            if (typeof weapon.ice_dmg !== "undefined") {
                result.push({type: "magic", element: "ice", dmg: weapon.attributes.ice_dmg});
            }
            return result;
        }
    },
    getDmgType: function() {
        return "normal";
    }
});

game.mechanic.count_dmg = function(dmg, dmg_type, armor_normal, armor_magic) {
    if (dmg_type === "normal") {
        return dmg - armor_normal;
    } else {
        return dmg - armor_magic;
    }
};

game.mechanic.trigger_pause_menu = function() {
    if (game.instances.pause_menu === null) {
        game.instances.pause_menu = new game.gui.PauseMenu();
        me.game.add(game.instances.pause_menu, game.guiLayer + 1);
        me.game.sort();
    } else {
        me.game.remove(game.instances.pause_menu);
        game.instances.pause_menu = null;
    }
};

game.mechanic.inventory_push = function(item) {
    var inventory = me.gamestat.getItemValue("inventory");
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i] === null) {
            inventory[i] = item;
            return true;
        }
    }
    return false;
};

game.mechanic.inventory_sort = function() {
    var inventory = me.gamestat.getItemValue("inventory");
    inventory.sort(game.mechanic.sort);
};

game.mechanic.inventory_drop = function(guid) {
    var inventory = me.gamestat.getItemValue("inventory");
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i].guid === guid) {
            inventory[i] = null;
            game.mechanic.inventory_sort();
            return true;
        }
    }
    return false;
};

game.mechanic.get_inventory_item = function(guid) {
    var inventory = me.gamestat.getItemValue("inventory");
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i] === null) {
            continue;
        }
        if (guid === inventory[i].guid) {
            return inventory[i];
        }
    }
    return false;
}

game.mechanic.stash_push = function(item) {
    var inventory = me.gamestat.getItemValue("stash");
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i] === null) {
            inventory[i] = item;
            return true;
        }
    }
    return false;
};

game.mechanic.stash_sort = function() {
    var inventory = me.gamestat.getItemValue("stash");
    inventory.sort(game.mechanic.sort);
};

game.mechanic.stash_drop = function(guid) {
    var inventory = me.gamestat.getItemValue("stash");
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i].guid === guid) {
            inventory[i] = null;
            game.mechanic.stash_sort();
            return true;
        }
    }
    return false;
};

game.mechanic.get_stash_item = function(guid) {
    var inventory = me.gamestat.getItemValue("inventory");
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i] === null) {
            continue;
        }
        if (guid === inventory[i].guid) {
            return inventory[i];
        }
    }
    return false;
}

game.mechanic.sort = function(a, b) {
    if (a === null && b !== null) {
        return 1;
    } else {
        return 0;
    }
};

game.mechanic.belt_use = function(id) {
    console.log(id);
    var belt = me.gamestat.getItemValue("belt")[id];
    if (typeof belt !== "undefined") {
        game.mechanic.trigger_item(belt);
    }
};

game.mechanic.trigger_item = function(guid) {

    var selected = game.mechanic.get_inventory_item(guid);
    var player = game.instances.player;
    switch (selected.type) {
        case "consumable":
            if (typeof selected.attributes.heal !== "undefined") {
                player.updateHP(selected.attributes.heal);
            }

            var belt = me.gamestat.getItemValue("belt");
            for (var i = 0; i < belt.length; i++) {
                if (belt[i] === guid) {
                    belt.splice(i, 1);
                }
            }
            game.mechanic.inventory_drop(guid);
            break;
        case "default":
            console.log("nothing");
            break;
    }
};

game.mechanic.guid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

game.mechanic.destroy_dialoge = function(guid) {
    if (game.instances.dialog !== null && game.instances.dialog.guid === guid) {
        me.game.remove(game.instances.dialog);
        game.instances.dialog = null;
    }
};

game.mechanic.save_game = function() {

};

game.mechanic.load_game = function() {
    me.gamestat.setValue("level", localStorage.level);
    me.gamestat.setValue("next_level", localStorage.next_level);
    me.gamestat.setValue("hp", localStorage.hp);
    me.gamestat.setValue("max_hp", localStorage.max_hp);
    me.gamestat.setValue("exp", localStorage.exp);
    me.gamestat.setValue("stats", JSON.parse(localStorage.stats));
    me.gamestat.setValue("inventory", JSON.parse(localStorage.inventory));
    me.gamestat.setValue("stash", JSON.parse(localStorage.stash));
    me.gaemstat.setValue("equip", JSON.parse(localStorage.equip));
    me.gaemstat.setValue("belt", JSON.parse(localStorage.belt));
    me.gamestat.setValue("skill", localStorage.skill_points);
};