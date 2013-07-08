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

/*
game.consumables.HealthPotion = game.CollectableShadow.extend({
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.image = "item-flask-red";
        this.parent(x, y, settings);
        this.renderable.addAnimation("always", [0, 1, 2, 3, 4]);
        this.renderable.setCurrentAnimation("always");
    },
    onCollision: function() {
        me.audio.play("bottle");
        me.game.remove(this.shadow);
        me.game.remove(this);
        this.collidable = false;
        var tooltip_text = [];
        tooltip_text.push(new game.gui.TextLine("Health Potion", game.fonts.bad_red));
        tooltip_text.push(new game.gui.TextLine("Heals 75 HP", game.fonts.bad_red));
        var item = new game.ItemObject("Health Potion", "item-flask-red", "consumable", {heal: 75}, tooltip_text);
        me.gamestat.getItemValue("inventory").push(item);
    }
});*/

game.consumables.HealthPotion = game.ShadowObject.extend({
    tooltip: null,
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.image = "item-flask-red";
        this.parent(x, y, settings);
        this.renderable.addAnimation("always", [0, 1, 2, 3, 4]);
        this.renderable.setCurrentAnimation("always");
        this.tooltip = null;
        this.collidable = true;
    }, update: function() {
        var res = me.game.collide(this, true);
        if (res.length >= 1) {
            for (var i = 0; i < res.length; i++) {
                //this is quite horrible solution
                if (res[i].obj.type === "human_target") {
                    this.showTooltip();
                } else if (res[i].obj.type === "human_use") {
                    
                }
            }
        }

        this.parent();
        return true;
    },
    showTooltip: function(){
        if(this.tooltip === null){
            this.tooltip = new game.DropTooltip(this.x - (this.renderable.width / 2), this.y - 5, "Health Potion","normal");
            me.game.add(this.tooltip, this.z);
            me.game.sort();
            console.log("tooltip");
        }
    }
});


game.consumables.Money = game.ShadowObject.extend({
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.image = "money-1";
        this.parent(x, y, settings);
        this.renderable.addAnimation("always", [0, 1, 2, 3, 4]);
        this.renderable.setCurrentAnimation("always");
        this.tooltip = null;
        this.collidable = true;
    }
});

game.Item_sword1 = game.CollectableShadow.extend({
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.image = "item-sword1";
        this.parent(x, y, settings);
        this.renderable.addAnimation("always", [0, 1, 2, 3, 4]);
        this.renderable.setCurrentAnimation("always");
    },
    onCollision: function() {
        me.audio.play("metal-clash");
        me.game.remove(this.shadow);
        me.game.remove(this);
        this.collidable = false;
        var tooltip_text = [];
        tooltip_text.push(new game.gui.TextLine("Short Sword", game.fonts.basic));
        tooltip_text.push(new game.gui.TextLine("DMG 4", game.fonts.bad_red));
        var item_sword = new game.ItemObject("Short sword", "item-sword1", "weapon", {dmg: 4, object_name: "Sword1", offset_x: 0, offset_y: 0}, tooltip_text);
        me.gamestat.getItemValue("inventory").push(item_sword);
    }
});

game.Item_sword2 = game.CollectableShadow.extend({
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.image = "item-sword2";
        this.parent(x, y, settings);
        this.renderable.addAnimation("always", [0, 1, 2, 3, 4]);
        this.renderable.setCurrentAnimation("always");
    },
    onCollision: function() {
        me.audio.play("metal-clash");
        me.game.remove(this.shadow);
        me.game.remove(this);
        this.collidable = false;
        var tooltip_text = [];
        tooltip_text.push(new game.gui.TextLine("Long Sword", game.fonts.bad_red));
        tooltip_text.push(new game.gui.TextLine("DMG 10", game.fonts.bad_red));
        var item_sword = new game.ItemObject("Long sword", "item-sword2", "weapon", {dmg: 10, object_name: "Sword2", offset_x: -8, offset_y: -10}, tooltip_text);
        me.gamestat.getItemValue("inventory").push(item_sword);
    }
});

game.Item_bluesword = game.CollectableShadow.extend({
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.image = "item-bluesword";
        this.parent(x, y, settings);
        this.renderable.addAnimation("always", [0, 1, 2, 3, 4]);
        this.renderable.setCurrentAnimation("always");
    },
    onCollision: function() {
        me.audio.play("metal-clash");
        me.game.remove(this.shadow);
        me.game.remove(this);
        this.collidable = false;
        var item_sword = new game.ItemObject("Blue sword", "item-bluesword", "weapon", {dmg: 25, object_name: "Sword2", offset_x: -8, offset_y: -10});
        me.gamestat.getItemValue("inventory").push(item_sword);
    }
});

game.Item_redsword = game.CollectableShadow.extend({
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.image = "item-redsword";
        this.parent(x, y, settings);
        this.renderable.addAnimation("always", [0, 1, 2, 3, 4]);
        this.renderable.setCurrentAnimation("always");
    },
    onCollision: function() {
        me.audio.play("metal-clash");
        me.game.remove(this.shadow);
        me.game.remove(this);
        this.collidable = false;
        var item_sword = new game.ItemObject("Red sword", "item-redsword", "weapon", {dmg: 25, object_name: "Sword2", offset_x: -8, offset_y: -10});
        me.gamestat.getItemValue("inventory").push(item_sword);
    }
});