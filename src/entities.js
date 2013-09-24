game.CollectableShadow = me.CollectableEntity.extend({
    shadow: null,
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.shadow = me.entityPool.newInstanceOf("Shadow", this.pos.x, this.pos.y + 5);
        me.game.add(this.shadow, 4);
        me.game.sort();
    },
    onDestroyEvent: function() {
        me.game.remove(this.shadow);
    }
});

game.ShadowObject = me.ObjectEntity.extend({
    shadow: null,
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.shadow = new game.Shadow(this.pos.x, this.pos.y + 5);
        me.game.add(this.shadow, 4);
        me.game.sort();
    },
    onDestroyEvent: function() {
        me.game.remove(this.shadow);
        this.shadow = null;
    }
});

game.Target = me.ObjectEntity.extend({
    init: function(x, y, colour) {
        settings = {};
        settings.image = "target";
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        this.parent(x, y, settings);
        this.renderable.addAnimation("green", [0, 1, 2, 3]);
        this.renderable.addAnimation("red", [4, 5, 6, 7]);
        this.renderable.setCurrentAnimation(colour);
    }
});

game.Shadow = me.ObjectEntity.extend({
    init: function(x, y) {
        settings = {};
        settings.image = "shadow16";
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        this.parent(x, y, settings);
        this.collidable = false;
        this.isPersistent = true;
    }
});

game.entities.Firecamp = me.ObjectEntity.extend({
    attack_timer: null,
    attacking: false,
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 16;
        settings.sriteheight = 32;
        if(me.game.currentLevel.level_name === "VILLAGE"){
            settings.image = "firecamp1";
            
            y += 16;
        } else {
            settings.image = "firecamp2";
            x += 8;
            y += 8;
        }
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
                    game.instances.audio.channels.effects.addEffect("fire");
                    var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
                    player.hurt(9, 15, "normal");
                    this.attack_timer = me.timer.getTime();
                    this.attacking = true;
                }
            }
        }

    }
});

game.CollisionBox = me.ObjectEntity.extend({
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

game.Particle = me.SpriteObject.extend({
    timer: 0,
    live: 0,
    generator: 0,
    type: null,
    init: function(x, y, image, guid_generator, type) {
        this.parent(x, y, me.loader.getImage(image), 8, 8);
        this.type = type;
        var vel_x, vel_y;
        if (this.type === "up") {
            vel_x = 0;
            vel_y = Number.prototype.random(2, 5) / 10;
        } else if (this.type === "fountain") {
            vel_x = Number.prototype.random(-3, 3) / 10;
            vel_y = Number.prototype.random(8, 10) / 10;
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
        if (this.type === "up") {
            this.pos.y -= this.vel.y * me.timer.tick;
        } else if (this.type === "fountain") {
            this.pos.y -= this.vel.y * me.timer.tick;
            if ((me.timer.getTime() - this.timer) > (this.live * 0.6)) {
                this.pos.x += this.vel.x * me.timer.tick;
            }
        }
        return true;
    }
});

game.ParticleGenerator = me.ObjectEntity.extend({
    particles: null,
    limit: null,
    image: null,
    type: null,
    init: function(x, y, settings) {
        //settings.spritewidth = 16;
        //settings.spritewidth = 16;
        this.parent(x, y, settings);
        this.limit = settings.limit;
        this.image = settings.image;
        this.particles = 0;
        this.type = settings.type;
        this.renderable.setOpacity(0);
    },
    update: function() {
        for (var i = this.particles; i < this.limit; i++) {
            this.particles += 1;
            var pos_x;
            if (this.type === "up") {
                pos_x = Math.floor(0 + (1 + 16 - 0) * Math.random());
            } else if (this.type === "fountain") {
                pos_x = (this.renderable.width / 2);
            }
            var particle = me.entityPool.newInstanceOf("Particle", this.pos.x + pos_x - 5, this.pos.y + 16, this.image, this.GUID, this.type);
            me.game.add(particle, game.guiLayer - 1);
            me.game.sort();
        }
        return false;
    },
    killParticle: function() {
        this.particles -= 1;
    }
});

game.DeathSmoke = me.ObjectEntity.extend({
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 24;
        settings.spritewidth = 24;
        settings.image = me.loader.getImage('death');
        this.parent(x, y, settings);
        this.renderable.addAnimation("death", [0, 1, 2, 3, 4, 5, 5], 4);
        this.renderable.setCurrentAnimation("death");
    }, update: function() {
        if (this.renderable.getCurrentAnimationFrame() === 6) {
            me.game.remove(this);
        }

        this.parent();
        return true;
    }
});

game.Exit = me.ObjectEntity.extend({
    from: null,
    init: function(x, y, settings){
        this.parent(x, y, settings);
        this.from = settings.from;
        this.name = "exit";
    }
});

game.ChangeLevel = me.LevelEntity.extend({
    init: function(x, y, settings){
        settings.duration = 250;
        settings.fade = "#000000";
        this.parent(x, y, settings);
    },
    onCollision: function(){
        me.gamestat.getItemValue("history").previous_level = me.game.currentLevel.name; 
        this.parent();
    },
    onFadeComplete: function(){
        this.parent();
        
        var player = game.instances.player;
        if(me.gamestat.getItemValue("history").previous_level !== null){
            var exits = me.game.getEntityByProp("name","exit");
            for(var i = 0; i < exits.length; i++){
                if(me.gamestat.getItemValue("history").previous_level === exits[i].from){
                    player.pos.x = exits[i].pos.x;
                    player.pos.y = exits[i].pos.y;
                    break;
                }
            }
        }
        
        game.mechanic.initialize_level();
    }
});


game.entities.Respawn = me.ObjectEntity.extend({
    init: function(x, y){
        settings = {};
        settings.spritewidth = 16;
        settings.spritewidth = 16;
        this.parent(x, y, settings);
    },
    update: function(){
        if(me.input.isKeyPressed("use")){
            me.game.remove(this);
            game.mechanic.respawn();
        }
    }
});

game.entities.Logo = me.ObjectEntity.extend({
    init: function(x, y){
        settings = {};
        settings.spritewidth = 250;
        settings.spriteheight = 126;
        settings.image = "logo";
        this.parent(x, y, settings);
    }
});