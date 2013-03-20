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
        smile = new Smile(this.pos.x, this.pos.y - 5, "happy");
        me.game.add(smile, 3);
        me.game.sort();
        me.game.remove(this.shadow);
        me.game.remove(this);
        me.game.getEntityByGUID(me.gamestat.getItemValue("player")).updateHP(15);
        this.collidable = false;
    }

});

var Sparks = me.CollectableEntity.extend({
    init: function(x, y) {
        settings = {};
        settings.image = "sparks";
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        this.parent(x, y, settings);
        this.addAnimation("idle", [0, 1, 2, 3, 4]);
        this.setCurrentAnimation("idle");
        this.collidable = true;
    },
    onCollision: function() {
        me.audio.play("exp_click");
        smile = new Smile(this.pos.x, this.pos.y - 5, "wow");
        me.game.add(smile, 3);
        me.game.sort();
        me.game.remove(this);
        me.game.getEntityByGUID(me.gamestat.getItemValue("player")).updateEXP(5);
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
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.addAnimation("always", [0, 1, 2, 3, 4]);
        this.setCurrentAnimation("always");
    },
    onCollision: function() {
        me.audio.play("metal-clash");
        smile = new Smile(this.pos.x, this.pos.y - 5, "wow");
        me.game.add(smile, 3);
        me.game.sort();
        me.game.remove(this.shadow);
        me.game.remove(this);
        this.collidable = false;
        me.gamestat.getItemValue("inventory").push("item-sword1");
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
        this.addAnimation("red", [4, 5, 6, 7]);
        this.setCurrentAnimation(colour);
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
        this.setVelocity(1, 1);
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

var Fire = me.InvisibleEntity.extend({
    attack_timer: null,
    attacking: false,
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 16;
        settings.sriteheight = 16;
        this.parent(x, y, settings);
        this.updateColRect(0, 16, 0, 16);
        this.collidable = true;
        this.type = "fire";
    },
    onCollision: function() {
        if (this.attacking && ((me.timer.getTime() - this.attack_timer) > 500)) {
            this.attacking = false;
        }
        if (!this.attacking) {
            var res = me.game.collide(this);
            if (res) {
                if (res.obj.type === "player") {
                    me.audio.play("fire");
                    var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
                    player.hurt(10);
                    this.attack_timer = me.timer.getTime();
                    this.attacking = true;
                }
            }
        }

    }
});

var CollisionBox = me.InvisibleEntity.extend({
    init: function(x, y, type) {
        settings = {};
        settings.spritewidth = 16;
        settings.spritewidth = 16;
        this.parent(x, y, settings);
        this.updateColRect(0, 16, 0, 16);
        this.collidable = true;
        this.type = type;
    }, onDestroyEvent: function() {
        this.collidable = false;
    }
});

var Sword1 = me.ObjectEntity.extend({
    attack: 3,
    description: "little sword",
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 32;
        settings.spriteheight = 32;
        settings.image = "sword1";
        this.parent(x, y, settings);
        this.addAnimation("attack_right", [0, 1, 2, 3, 4], 1);
        this.addAnimation("right", [5, 6, 7, 8]);
        this.addAnimation("iddle_right", [10, 11], 30);
        this.addAnimation("attack_up", [15, 16, 17, 18, 19], 1);
        this.addAnimation("up", [20, 21, 22, 23]);
        this.addAnimation("iddle_up", [25, 26], 30);
        this.addAnimation("attack_down", [30, 31, 32, 33, 34], 1);
        this.addAnimation("down", [35, 36, 37, 38]);
        this.addAnimation("iddle_down", [40, 41], 30);
    }
});

var Message = me.ObjectEntity.extend({
    timer: me.timer.getTime(),
    font: null,
    text: "",
    init: function(x, y, text) {
        settings = {};
        settings.spritewidth = 160;
        settings.spriteheight = 32;
        settings.image = "message";
        //now draw box for text!
//        settings.image = document.createElement("canvas");
//        settings.image.width = 150;
//        settings.image.height = 50;
//        var ctx = settings.image.getContext("2d");
//        ctx.fillStyle = "rgb(200,200,200)";
//        ctx.fillRect(0, 0, settings.image.width, settings.image.height);
        this.parent(x, y, settings);
        this.text = text;
        this.font = new me.Font("Arial", 10, "white");

    }, draw: function(context) {
        this.parent(context);
        var lines = this.text.split('\n');
        for (var i = 0; i < lines.length; i++) {
            this.font.draw(context, lines[i], this.pos.x + 6, this.pos.y + 10 + (10 * i));
        }

    }
});

var Particle = me.SpriteObject.extend({
    timer: 0,
    live: 0,
    generator: 0,
    type: null,
    init: function(x, y, image, guid_generator, type) {
        this.parent(x, y, me.loader.getImage(image), 8, 8);
        this.type = type;
        var vel_x, vel_y;
        if(this.type === "up"){
            vel_x = 0;
            vel_y = Number.prototype.random(2,5) / 10;
        } else if(this.type === "fountain"){
            vel_x = Number.prototype.random(-3,3) / 10;
            vel_y = Number.prototype.random(8,10) / 10;
        }
        this.vel = new me.Vector2d(vel_x, vel_y);
        this.timer = me.timer.getTime();
        this.live = Math.floor(500 + (1 + 1100 - 500) * Math.random());
        this.generator = guid_generator;
        

    },
    update: function() {
        if ((me.timer.getTime() - this.timer) > this.live) {
            me.game.remove(this);
            me.game.getEntityByGUID(this.generator).killParticle();
        }
        if(this.type === "up"){
            this.pos.y -= this.vel.y * me.timer.tick;
        } else if(this.type === "fountain"){
            this.pos.y -= this.vel.y * me.timer.tick;
            if((me.timer.getTime() - this.timer) > (this.live * 0.6)){
                this.pos.x += this.vel.x * me.timer.tick;
            }
        }
        return true;
    }
});

var ParticleGenerator = me.InvisibleEntity.extend({
    particles: null,
    limit: null,
    image: null,
    type: null,
    init: function(x, y, settings) {
        settings.spritewidth = 16;
        settings.spritewidth = 16;
        this.parent(x, y, settings);
        this.limit = settings.limit;
        this.image = settings.image;
        this.particles = 0;
        this.type = settings.type;
    },
    update: function() {
        for(var i = this.particles; i < this.limit; i++){
            this.particles += 1;
            var pos_x;
            if(this.type === "up"){
                pos_x = Math.floor(0 + (1 + 16 - 0) * Math.random());
            } else if(this.type === "fountain"){
                pos_x = (this.width / 2);
            }
            var particle = new Particle(this.pos.x + pos_x - 5, this.pos.y + 16, this.image, this.GUID, this.type);
            me.game.add(particle, 4);
            me.game.sort();
        }
        return false;
    },
    killParticle: function() {
        this.particles -= 1;
    }
});