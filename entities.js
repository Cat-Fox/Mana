var Burger = me.CollectableEntity.extend({
    shadow: null,
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.addAnimation("always", [0, 1, 2, 3, 4, 5]);
        this.setCurrentAnimation("always");
        this.shadow = new Shadow(this.pos.x, this.pos.y + 7);
        me.game.add(this.shadow, 4);
        me.game.sort();
    },
    onCollision: function() {
        me.audio.play("itempick2");
        smile = new Smile(this.pos.x, this.pos.y-5, "happy");
        me.game.add(smile, 3);
        me.game.sort();
        me.game.remove(this.shadow);
        me.game.remove(this);
        me.game.HUD.updateItemValue("HP", 15);
        this.collidable = false;
    }

});

var CollectableShadow = me.CollectableEntity.extend({
    shadow: null,
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.shadow = new Shadow(this.pos.x, this.pos.y + 7);
        me.game.add(this.shadow, 4);
        me.game.sort();
        
    },
    onDestroyEvent: function() {
        me.game.remove(this.shadow);
    }
});

var Item_sword1 = CollectableShadow.extend({
    init: function(x, y, settings){
        this.parent(x, y, settings);
        this.addAnimation("always", [0,1,2,3,4]);
        this.setCurrentAnimation("always");
    },
    onCollision: function() {
        me.audio.play("metal-clash");
        smile = new Smile(this.pos.x, this.pos.y-5, "wow");
        me.game.add(smile, 3);
        me.game.sort();
        me.game.remove(this.shadow);
        me.game.remove(this);
        this.collidable = false;
    }
});

var Target = me.ObjectEntity.extend({
    init: function(x, y, colour) {
        settings = {};
        settings.image = "target";
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        this.parent(x, y, settings);
        this.addAnimation("green", [0, 1, 2, 3]);
        this.addAnimation("red", [0, 1, 2, 3]);
        this.setCurrentAnimation(colour);
    }
});

var Sparks = me.ObjectEntity.extend({
    init: function(x, y) {
        settings = {};
        settings.image = "sparks";
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        this.parent(x, y, settings);
        this.addAnimation("idle", [0, 1, 2, 3, 4]);
        this.setCurrentAnimation("idle");
        this.time = me.timer.getTime();
        this.collidable = false;
    }
});

var Shadow = me.ObjectEntity.extend({
    init: function(x, y) {
        settings = {};
        settings.image = "shadow16";
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        this.parent(x, y, settings);
        this.collidable = false;
    }
});

var Smile = me.ObjectEntity.extend({
    timer: null,
    init: function(x, y, smile) {
        settings = {};
        settings.image = "smiles16";
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        this.parent(x, y, settings);
        this.addAnimation("lick", [0]);
        this.addAnimation("dead", [1]);
        this.addAnimation("sleepy", [2]);
        this.addAnimation("wow", [3]);
        this.addAnimation("kill", [4]);
        this.addAnimation("happy", [5]);
        this.setCurrentAnimation(smile);
        this.timer = me.timer.getTime();
        this.setVelocity(1,1);
        this.collidable = false;
    },
    update: function() {
        this.vel.y -= this.accel.y * me.timer.tick;
        this.updateMovement();
        if ((me.timer.getTime() - this.timer) > 600) {
            me.game.remove(this);
        }
    }
});