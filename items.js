game.ItemObject = Object.extend({
    name: null,
    icon_name: null,
    type: null,
    attributes: null,
    tooltip_text: null,
    init: function(name, icon_name, type, attributes, tooltip) {
        this.name = name;
        this.icon_name = icon_name;
        this.type = type;         //weapon, armor, artefact, consumable, others
        this.attributes = attributes; //Hash
        this.tooltip_text = tooltip;
    }
});

game.consumables.Layout = game.ShadowObject.extend({
    tooltip: null,
    autopick: null,
    rarity: null,
    name: null,
    target_box: null,
    init: function(x, y, settings, autopick, name, rarity) {
        this.parent(x, y, settings);
        this.renderable.addAnimation("always", [0, 1, 2, 3, 4]);
        this.renderable.setCurrentAnimation("always");
        this.tooltip = null;
        this.collidable = true;
        this.autopick = autopick;
        this.name = name;
        this.rarity = rarity;
    }, update: function() {
        var res = me.game.collide(this, true);
        var targeted = false;
        if (res.length >= 1) {
            for (var i = 0; i < res.length; i++) {
                //this is quite horrible solution
                if (res[i].obj.type === "human_target") {
                    targeted = true;
                } else if (res[i].obj.type === "human_use") {
                    this.onUse();
                } else if (res[i].obj.type === "player" && this.autopick) {
                    this.onUse();
                }
            }
        }
        
        if(me.input.isKeyPressed("alt")){
            targeted = true;
        }

        if (targeted) {
            this.showTooltip();
            this.showTargetBox();
        } else {
            this.destroyTooltip();
            this.destroyTargetBox();
        }

        this.parent();
        return true;
    },
    showTooltip: function() {
        if (this.tooltip === null) {
            this.tooltip = new game.DropTooltip(this.pos.x - (this.renderable.width / 2), this.pos.y - 5, this.name, this.rarity);
            me.game.add(this.tooltip, this.z + 1);
            me.game.sort();
        }
    },
    destroyTooltip: function() {
        if (this.tooltip !== null) {
            me.game.remove(this.tooltip);
            this.tooltip = null;
        }
    },
    showTargetBox: function() {
        if (this.target_box === null) {
            this.target_box = new game.Target(this.pos.x, this.pos.y + 5, "green");
            me.game.add(this.target_box, this.z - 1);
            me.game.sort();
        }
    },
    destroyTargetBox: function() {
        if (this.target_box !== null) {
            me.game.remove(this.target_box);
            this.target_box = null;
        }
    },
    onUse: function() {
    },
    onDestroyEvent: function() {
        this.destroyTooltip();
        this.destroyTargetBox();
        this.parent();
    }
});

game.consumables.HealthPotion = game.consumables.Layout.extend({
    tooltip: null,
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.image = "item-flask-red";
        this.parent(x, y, settings, false, "Health Potion", "normal");
    },
    onUse: function() {
        me.audio.play("bottle");
        var tooltip_text = [];
        tooltip_text.push(new game.gui.TextLine("Health Potion", game.fonts.bad_red));
        tooltip_text.push(new game.gui.TextLine("Heals 75 HP", game.fonts.bad_red));
        var item = new game.ItemObject("Health Potion", "item-flask-red", "consumable", {heal: 75}, tooltip_text);
        me.gamestat.getItemValue("inventory").push(item);
        me.game.remove(this);
        this.collidable = false;
    }
});

game.consumables.Money = game.consumables.Layout.extend({
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.image = "money-4";
        this.parent(x, y, settings, true, "Gold", "gold");
    }

});

game.Item_sword1 = game.consumables.Layout.extend({
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.image = "item-sword1";
        this.parent(x, y, settings, false, "Short Sword", "normal");
        ;
    },
    onUse: function() {
        me.audio.play("metal-clash");
        var tooltip_text = [];
        tooltip_text.push(new game.gui.TextLine("Short Sword", game.fonts.basic));
        tooltip_text.push(new game.gui.TextLine("DMG 4", game.fonts.bad_red));
        var item_sword = new game.ItemObject("Short sword", "item-sword1", "weapon", {dmg: 4, object_name: "Sword1", offset_x: 0, offset_y: 0}, tooltip_text);
        me.gamestat.getItemValue("inventory").push(item_sword);
        me.game.remove(this);
        this.collidable = false;
    }
});

game.Item_sword2 = game.consumables.Layout.extend({
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.image = "item-sword2";
        this.parent(x, y, settings, false, "Long Sword", "normal");
    },
    onUse: function() {
        me.audio.play("metal-clash");
        var tooltip_text = [];
        tooltip_text.push(new game.gui.TextLine("Long Sword", game.fonts.bad_red));
        tooltip_text.push(new game.gui.TextLine("DMG 10", game.fonts.bad_red));
        var item_sword = new game.ItemObject("Long sword", "item-sword2", "weapon", {dmg: 10, object_name: "Sword2", offset_x: -8, offset_y: -10}, tooltip_text);
        me.gamestat.getItemValue("inventory").push(item_sword);
        me.game.remove(this);
        this.collidable = false;
    }
});

game.Item_bluesword = game.consumables.Layout.extend({
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.image = "item-bluesword";
        this.parent(x, y, settings, false, "Blue Sword", "normal");
    },
    onUse: function() {
        me.audio.play("metal-clash");
        var item_sword = new game.ItemObject("Blue sword", "item-bluesword", "weapon", {dmg: 25, object_name: "Sword2", offset_x: -8, offset_y: -10});
        me.gamestat.getItemValue("inventory").push(item_sword);
        me.game.remove(this);
        this.collidable = false;
    }
});

game.Item_redsword = game.consumables.Layout.extend({
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.image = "item-redsword";
        this.parent(x, y, settings, false, "Red Sword", "normal");
    },
    onUse: function() {
        me.audio.play("metal-clash");
        var item_sword = new game.ItemObject("Red sword", "item-redsword", "weapon", {dmg: 25, object_name: "Sword2", offset_x: -8, offset_y: -10});
        me.gamestat.getItemValue("inventory").push(item_sword);
        me.game.remove(this);
        this.collidable = false;
    }
});