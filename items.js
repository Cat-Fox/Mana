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
        var item = new game.ItemObject("Health Potion", "item-flask-red", "consumable", {heal: 75});
        me.gamestat.getItemValue("inventory").push(item);
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
        var item_sword = new game.ItemObject("Short sword", "item-sword1", "weapon", {dmg: 4, object_name: "Sword1", offset_x: 0, offset_y: 0});
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
        var item_sword = new game.ItemObject("Long sword", "item-sword2", "weapon", {dmg: 10, object_name: "Sword2", offset_x: -8, offset_y: -10});
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