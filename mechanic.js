game.mechanic.Stats = Object.extend({
    level: null, //number
    str: null, //number
    agi: null, //number
    end: null, //number
    int: null, //number
    bonus_str: null,
    bonus_agi: null, //number
    bonus_end: null, //number
    bonus_int: null, //number
    player: null, //boolean
    init: function(str, agi, end, int, player) {
        this.str = str;
        this.agi = agi;
        this.end = end;
        this.int = int;
        this.bonus_str = 0;
        this.bonus_agi = 0;
        this.bonus_end = 0;
        this.bonus_int = 0;
        this.player = player;
    },
    getBonusAttr: function(attribute) {
        var equip = me.gamestat.getItemValue("equip");
        this["bonus_" + attribute] = 0;
        if (equip.weapon !== null) {
            var item = game.mechanic.get_inventory_item(equip.weapon);
            if (typeof item.attributes[attribute] !== "undefined") {
                this["bonus_" + attribute] += item.attributes[attribute];
            }
        }

        if (equip.armor !== null) {
            var item = game.mechanic.get_inventory_item(equip.armor);
            if (typeof item.attributes[attribute] !== "undefined") {
                this["bonus_" + attribute] += item.attributes[attribute];
            }
        }

        if (equip.artefact !== null) {
            var item = game.mechanic.get_inventory_item(equip.artefact);
            if (typeof item.attributes[attribute] !== "undefined") {
                this["bonus_" + attribute] += item.attributes[attribute];
            }
        }
        return this[attribute] + this["bonus_" + attribute];
    },
    getEquipAttr: function(attribute) {
        var equip = me.gamestat.getItemValue("equip");
        var result = 0;
        if (equip.weapon !== null) {
            var item = game.mechanic.get_inventory_item(equip.weapon);
            if (typeof item.attributes[attribute] !== "undefined") {
                result += item.attributes[attribute];
            }
        }

        if (equip.armor !== null) {
            var item = game.mechanic.get_inventory_item(equip.armor);
            if (typeof item.attributes[attribute] !== "undefined") {
                result += item.attributes[attribute];
            }
        }

        if (equip.artefact !== null) {
            var item = game.mechanic.get_inventory_item(equip.artefact);
            if (typeof item.attributes[attribute] !== "undefined") {
                result += item.attributes[attribute];
            }
        }
        return result;
    },
    getAttr: function(attribute) {
        this.getBonusAttr(attribute);
        return this[attribute] + this["bonus_" + attribute];
    },
    getHP: function() {
        var result = 0;
        var hp_end_plus = Math.floor(this.getAttr("end") * 0.7);
        var hp_level_plus = Math.floor(this.level * 0.35);
        var equip_plus = this.getEquipAttr("hp");
        result = 30 + hp_end_plus + hp_level_plus + equip_plus;
        return result;
    },
    getSale: function(){
        return Math.floor(this.int * 0.3);
    },
    getSalePrice: function(price) {
        var sale = this.getSale();
        var sale = price - (sale / 100);
        return price - sale;
    },
    countBonusExp: function(exp) {
        var bonus = this.getBonusExp();
        var bonus = Math.floor((exp / 100) * bonus);
        return exp + bonus;
    },
    getBonusExp: function() {
        var bonus = Math.floor(this.int * 0.3);
        return bonus;
    },
    getMagicPower: function() {
        return Math.floor(this.int * 0.3);
    },
    getMagicFind: function() {
        return this.getEquipAttr("magic_find");
    },
    getVelocity: function() {
        return 1.3 + (this.agi / 95);
    },
    getDmg: function() {
        var weapon = me.gamestat.getItemValue("equip").weapon;
        if (weapon === null) {
            return [{type: "normal", min_dmg: 3, max_dmg: 5}];
        } else {
            var result = [];
            weapon = game.mechanic.get_inventory_item(weapon);
            result.push({type: "normal", min_dmg: weapon.attributes.min_dmg, max_dmg: weapon.attributes.max_dmg});
            if (typeof weapon.fire_dmg !== "undefined") {
                result.push({type: "magic", element: "fire", min_dmg: 0, max_dmg: weapon.attributes.fire_dmg});
            }
            if (typeof weapon.ice_dmg !== "undefined") {
                result.push({type: "magic", element: "ice", min_dmg: 0, max_dmg: weapon.attributes.ice_dmg});
            }
            return result;
        }
    },
    getDmgType: function() {
        return "normal";
    },
    getDmgMod: function() {
        //lets juts update
        return Math.floor(this.getAttr("str") / 2);
    }
});

game.mechanic.count_dmg = function(dmg_min, dmg_max, dmg_type, armor_normal, armor_magic) {
    var dmg = Number.prototype.random(dmg_min, dmg_max);
    if (dmg_type === "normal") {
        dmg = dmg - armor_normal;
    } else {
        dmg = dmg - armor_magic;
    }

    if (dmg <= 0) {
        dmg = 1;
    }

    return dmg;
};

game.mechanic.get_attribute_tooltip = function(attribute) {
    var tooltip_text = [];
    var stats = me.gamestat.getItemValue("stats");
    switch (attribute) {
        case "str":
            tooltip_text.push(new game.gui.TextLine("Base " + stats.str, game.fonts.white));
            tooltip_text.push(new game.gui.TextLine("Bonus " + stats.bonus_str, game.fonts.teal));
            tooltip_text.push(new game.gui.TextLine("DMG bonus " + stats.getDmgMod(), game.fonts.white));
            break;
        case "end":
            tooltip_text.push(new game.gui.TextLine("Base " + stats.end, game.fonts.white));
            tooltip_text.push(new game.gui.TextLine("Bonus " + stats.bonus_end, game.fonts.teal));
            break;
        case "agi":
            tooltip_text.push(new game.gui.TextLine("Base " + stats.agi, game.fonts.white));
            tooltip_text.push(new game.gui.TextLine("Bonus " + stats.bonus_agi, game.fonts.teal));
            break;
        case "int":
            tooltip_text.push(new game.gui.TextLine("Base " + stats.int, game.fonts.white));
            tooltip_text.push(new game.gui.TextLine("Bonus " + stats.bonus_int, game.fonts.teal));
            tooltip_text.push(new game.gui.TextLine("Bonus EXP " + stats.getBonusExp() + "%", game.fonts.teal));
            tooltip_text.push(new game.gui.TextLine("Shop Sale" + stats.getSale() + "%", game.fonts.teal));
            tooltip_text.push(new game.gui.TextLine("Bonus Magic" + stats.getMagicPower() + "%", game.fonts.teal));
            break;
    }
    return tooltip_text;
};

game.mechanic.player_hurt = function(dmg_min, dmg_max, dmg_type) {
    var normal_armor, magic_armor, armor_type;
    var equip_armor = me.gamestat.getItemValue("equip").armor;
    if (equip_armor === null) {
        normal_armor = 0;
        magic_armor = 0;
        armor_type = "normal";
    } else {
        equip_armor = game.mechanic.get_inventory_item(equip_armor);
        normal_armor = equip_armor.attributes.armor_normal;
        magic_armor = equip_armor.attributes.armor_magic;
        armor_type = equip_armor.attributes.armor_type;
    }

    var result_dmg = game.mechanic.count_dmg(dmg_min, dmg_max, dmg_type, normal_armor, magic_armor);
    return result_dmg;
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

game.mechanic.trigger_inventory = function() {
    if (game.instances.backpack === null && game.instances.stash === null) {
        game.instances.backpack = me.entityPool.newInstanceOf("Backpack");
        this.backpack = game.instances.backpack;
        me.game.add(game.instances.backpack, game.guiLayer);
        me.game.sort();
        game.instances.audio.channels.effects.addEffect("itempick2");
    } else if (game.instances.backpack !== null) {
        me.game.remove(game.instances.backpack);
        game.instances.backpack = null;
        game.instances.audio.channels.effects.addEffect("itempick2");
    }
};

game.mechanic.trigger_stash = function() {
    if (game.instances.stash === null && game.instances.backpack === null) {
        game.instances.stash = new game.gui.Stash();
        me.game.add(game.instances.stash, game.LAYERS.GUI);
        me.game.sort();
    } else if (game.instances.stash !== null) {
        me.game.remove(game.instances.stash);
        game.instances.stash = null;
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
};

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
};

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
    if (typeof belt !== null) {
        game.mechanic.trigger_item(belt);
    }
};

game.mechanic.trigger_item = function(guid) {

    var selected = game.mechanic.get_inventory_item(guid);
    var player = game.instances.player;
    switch (selected.type) {
        case "weapon":
            if (game.mechanic.check_requirements(selected)) {
                me.gamestat.getItemValue("equip").weapon = guid;
                player.equipWeapon();
                game.instances.audio.channels.effects.addEffect(selected.attributes.sound);
                return true;
            }
            break;
        case "armor":
            if (game.mechanic.check_requirements(selected)) {
                me.gamestat.getItemValue("equip").armor = guid;
                player.equipArmor();
                game.instances.audio.channels.effects.addEffect(selected.attributes.sound);
                return true;
                break;
            }
        case "consumable":
            if (typeof selected.attributes.heal !== "undefined") {
                player.updateHP(selected.attributes.heal);
                game.instances.audio.channels.effects.addEffect(selected.attributes.sound);
            }

            var belt = me.gamestat.getItemValue("belt");
            for (var i = 0; i < belt.length; i++) {
                if (belt[i] === guid) {
                    belt.splice(i, 1);
                }
            }
            game.mechanic.inventory_drop(guid);
            return true;
            break;
        case "default":
            console.log("nothing");
            return false;
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
    localStorage.level = me.gamestat.getItemValue("level");
    localStorage.next_level = me.gamestat.getItemValue("next_level");
    localStorage.hp = me.gamestat.getItemValue("hp");
    localStorage.max_hp = me.gamestat.getItemValue("maxhp");
    localStorage.exp = me.gamestat.getItemValue("exp");
    localStorage.stats = JSON.stringify(me.gamestat.getItemValue("stats"));
    localStorage.equip = JSON.stringify(me.gamestat.getItemValue("equip"));
    localStorage.inventory = JSON.stringify(me.gamestat.getItemValue("inventory"));
    localStorage.belt = JSON.stringify(me.gamestat.getItemValue("belt"));
    localStorage.skill_points = me.gamestat.getItemValue("skill");
    localStorage.money = me.gamestat.getItemValue("money");
    localStorage.stash_money = me.gamestat.getItemValue("stash_money");
    localStorage.history = JSON.stringify(me.gamestat.getItemValue("history"));
    localStorage.stash = JSON.stringify(me.gamestat.getItemValue("stash"));
    localStorage.save = true;
    game.instances.console.post("Hero has been saved");
};

game.mechanic.load_game = function() {
    me.gamestat.setValue("level", parseInt(localStorage.level));
    me.gamestat.setValue("next_level", parseInt(localStorage.next_level));
    me.gamestat.setValue("hp", parseInt(localStorage.hp));
    me.gamestat.setValue("maxhp", parseInt(localStorage.max_hp));
    me.gamestat.setValue("exp", parseInt(localStorage.exp));
    me.gamestat.setValue("money", parseInt(localStorage.money));
    me.gamestat.setValue("inventory", JSON.parse(localStorage.inventory));
    me.gamestat.setValue("stash", JSON.parse(localStorage.stash));
    me.gamestat.setValue("stash_money", parseInt(JSON.parse(localStorage.stash_money)));
    me.gamestat.setValue("equip", JSON.parse(localStorage.equip));
    me.gamestat.setValue("belt", JSON.parse(localStorage.belt));
    console.log(me.gamestat.getItemValue("belt"));
    me.gamestat.setValue("skill", parseInt(localStorage.skill_points));
    var json = JSON.parse(localStorage.history);
    var history = new game.mechanic.History(json.killed_monsters, json.npcs_talks);
    me.gamestat.setValue("history", history);
    console.log(me.gamestat.getItemValue("history"));
    var old_stats = JSON.parse(localStorage.stats);
    var stats = new game.mechanic.Stats(old_stats.str, old_stats.agi, old_stats.end, old_stats.int, true);
    stats.getBonusAttr("str");
    stats.getBonusAttr("agi");
    stats.getBonusAttr("end");
    stats.getBonusAttr("vit");
    me.gamestat.setValue("stats", stats);
};

game.mechanic.respawn = function() {

};

game.mechanic.generateShop = function(type, value) {

};

game.mechanic.check_requirements = function(item) {
    player = game.instances.player;
    switch (item.type) {
        case "weapon" :
            if (typeof item.attributes.str_req !== "undefined") {
                if (me.gamestat.getItemValue("stats").str < item.attributes.str_req) {
                    game.instances.console.post("Not enough Strength");
                    return false;
                }
            }
            break;
        case "armor" :
            if (typeof item.attributes.end_req !== "undefined") {
                if (me.gamestat.getItemValue("stats").str < item.attributes.str_req) {
                    game.instances.console.post("Not enough Endurance");
                    return false;
                }
            }
            break;
        case "artefact" :
            if (typeof item.attributes.int_req !== "undefined") {
                if (me.gamestat.getItemValue("stats").str < item.attributes.str_req) {
                    game.instances.console.post("Not enough Inteligence");
                    return false;
                }
            }
            break;
    }
    return true;
};

game.mechanic.attributeUp = function(attribute) {
    var requirement = game.mechanic.stat_requirement(me.gamestat.getItemValue("stats")[attribute]);
    if (me.gamestat.getItemValue("skill") >= requirement) {
        me.gamestat.getItemValue("stats")[attribute] += 1;
        me.gamestat.updateValue("skill", -requirement);
        game.mechanic.updateStats();
    } else {
        game.instances.console.post("Not enough skill points");
    }
};

game.mechanic.updateStats = function() {
    console.log(me.gamestat.getItemValue("stats"));
    var max_hp = me.gamestat.getItemValue("stats").getHP();
    me.gamestat.setValue("maxhp", max_hp);
    if (me.gamestat.getItemValue("hp") > me.gamestat.getItemValue("maxhp")) {
        me.gamestat.setValue("hp", max_hp);
    }
};

game.mechanic.stat_requirement = function(stat) {
    var value = me.gamestat.getItemValue(stat);
    if (value <= 20) {
        return 1;
    } else if (value <= 40) {
        return 2;
    } else if (value <= 60) {
        return 3;
    } else if (value <= 80) {
        return 4;
    } else {
        return false;
    }
};

game.mechanic.trigger_rain = function() {
    console.log(game.instances.rain);
    if (game.instances.rain === null) {
        game.instances.rain = new game.effects.Rain();
        me.game.add(game.instances.rain, game.guiLayer - 1);
        me.game.sort();
    }
};

game.mechanic.initialize_level = function() {
    if (game.instances.rain !== null) {
        me.game.remove(game.instances.rain);
        game.instances.rain = null;
    }

    //game.instances.audio.channels.ambient.stopAmbient();

    //lets load some ambient
    if (me.game.currentLevel.name === "test_map") {
        game.instances.audio.channels.ambient.changeAmbient("taberna_noctis");
    } else if (me.game.currentLevel.name === "cave") {
        game.instances.audio.channels.ambient.changeAmbient("battle_of_souls");
    }
};

game.mechanic.trigger_options = function() {
    if (game.instances.options === null) {
        game.instances.options = new game.gui.Options();
        me.game.add(game.instances.options, game.LAYERS.TOP);
        me.game.sort();
    } else {
        me.game.remove(game.instances.options);
        game.instances.options = null;
    }
};

game.mechanic.save_settings = function() {
    localStorage.options = true;
    if(me.audio.isAudioEnable()){
        localStorage.audio_enabled = true;
    } else {
        localStorage.audio_enabled = false;
    }
    
    localStorage.ambient_volume = game.instances.audio.channels.ambient.volume;
    localStorage.effects_volume = game.instances.audio.channels.effects.volume;
    game.instances.console.post("Options has been saved");
};

game.mechanic.load_settings = function(){
    if(typeof localStorage.options !== "undefined"){
        game.instances.console.post("Options save found");
        var boolean = (localStorage.audio_enabled === "true");
        console.log(boolean);
        game.instances.audio.switchEnable(boolean);
        game.instances.audio.channels.ambient.volume = parseFloat(localStorage.ambient_volume);
        game.instances.audio.channels.effects.volume = parseFloat(localStorage.effects_volume);
        
    }
};