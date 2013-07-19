game.npcStats = Object.extend({
    hp: null,
    max_hp: null,
    dmg: null,
    armor_normal: null,
    armor_magic: null,
    dmg_type: null,
    exp: null,
    init: function(max_hp, dmg, dmg_type, armor_normal, armor_magic, exp) {
        this.hp = max_hp;
        this.max_hp = max_hp;
        this.dmg = dmg;
        this.dmg_type = dmg_type;
        this.armor_normal = armor_normal;
        this.armor_magic = armor_magic;
        this.exp = exp;
    }
});

game.WalkerNPC = me.ObjectEntity.extend({
    iddle_min: 5000,
    iddle_max: 10000,
    iddle_pick: null,
    iddling: true,
    iddle_now: 0,
    direction: {first: false, second: false},
    duration_min: 200,
    duration_max: 1000,
    duration_pick: null,
    duration_now: 0,
    walking: false,
    flipped: false,
    targeted: false,
    shadow: null,
    modes: ["walking", "standing", "attacking", "dying", "idling"],
    mode_select: "walking",
    stats: null,
    drop: null,
    value: null,
    shadow_offset: null,
    init: function(x, y, settings, c_shadow, stats) {
        /*settings = {};
         settings.image = me.loader.getImage("firefox");
         settings.spritewidth = 32;
         settings.spriteheight = 32;*/
        this.parent(x, y, settings);/*
         this.renderable.addAnimation("right", [8, 9, 10, 11], 10);
         this.renderable.addAnimation("up", [32, 33, 34, 35, 36, 37, 38, 39]);
         this.renderable.addAnimation("down", [56, 57, 58, 59]);
         this.renderable.addAnimation("iddle_right", [16, 17, 18, 19, 20], 20);
         this.renderable.addAnimation("iddle_up", [40, 41], 35);
         this.renderable.addAnimation("iddle_down", [64, 65], 35);
         this.renderable.addAnimation("attack_down", [48, 49, 50, 51, 52], 3);
         this.renderable.addAnimation("attack_up", [24, 25, 26, 27, 28], 3);
         this.renderable.addAnimation("attack_right", [0, 1, 2, 3, 4], 3);
         this.renderable.setCurrentAnimation("iddle_right");*/
        this.setVelocity(0.5, 0.5);
        this.gravity = 0;
        this.newIddle();
        this.updateColRect(10, 12, 5, 22);
        this.collidable = true;
        this.type = "npc";
        this.value = 1;
        if (c_shadow) {
            this.shadow = me.entityPool.newInstanceOf("Shadow", this.pos.x + 15, this.pos.y + 15);
            me.game.add(this.shadow, 3);
            me.game.sort();
        }
        this.drop = null;
        this.stats = stats;
        this.shadow_offset = new me.Vector2d(15, 15);
    },
    update: function() {
        switch (this.mode_select) {
            case "walking":
                this.modeWalking();
                break;
            case "attacking":
                this.modeAttacking();
                break;
            case "dying":
                this.modeDying();
                break;
            case "idling":
                this.modeIdling();
                break;
        }

        if (this.mode_select !== "dying") {
            var res = me.game.collide(this, true);
            if (res.length >= 1) {
                for (var i = 0; i < res.length; i++) {
                    //this is quite horrible solution
                    if ((res[i].obj.type === "npc") || (res[i].obj.type === me.game.ENEMY_OBJECT)) {
                        if (res[i].x !== 0) {
                            // x axis
                            if (res[i].x < 0) {
                                this.pos.x = this.pos.x + this.accel.x;

                            } else {
                                this.pos.x = this.pos.x - this.accel.x;
                            }
                        }
                        else {
                            // y axis
                            if (res[i].y < 0) {
                                this.pos.y = this.pos.y + this.accel.y;

                            } else {
                                this.pos.y = this.pos.y - this.accel.y;
                            }
                        }
                    } else if (res[i].obj.type === "human_target") {
                        this.onTarget();
                    } else if (res[i].obj.type === "human_use") {
                        this.onUse();
                    } else if (res[i].obj.type === "human_attack") {
                        this.onHit();
                    }
                }
            }
        }
        this.updateMovement();
        if (this.shadow !== null) {
            this.shadow.pos.x = this.pos.x + this.shadow_offset.x;
            this.shadow.pos.y = this.pos.y + this.shadow_offset.y;
        }
        this.parent();
        return true;

    },
    newIddle: function() {
        this.iddle_pick = Number.prototype.random(this.iddle_min, this.iddle_max);
        this.iddle_now = me.timer.getTime();
        this.iddling = true;
    },
    newDuration: function() {
        this.duration_pick = Number.prototype.random(this.duration_min, this.duration_max);
        this.duration_now = me.timer.getTime();
        this.iddling = false;
        this.walking = false;
    },
    onHit: function() {

    },
    onUse: function() {

    },
    onTarget: function() {

    },
    onDestroyEvent: function() {
        this.collidable = false;
        if (this.shadow !== null) {
            me.game.remove(this.shadow);
            this.shadow = null;
        }
    },
    onDrop: function() {
        if (this.drop !== null) {
            game.mechanic.drop(this.pos.x, this.pos.y, this.value, this.drop);
        }
    },
    modeWalking: function() {
        if (this.iddling) {
            this.vel.x = 0;
            this.vel.y = 0;
            if (me.timer.getTime() > (this.iddle_now + this.iddle_pick)) {
                //stop waiting
                this.newDuration();
            }
        } else {
            if (me.timer.getTime() > (this.duration_now + this.duration_pick)) {
                //stop walking
                if (this.renderable.isCurrentAnimation("up")) {
                    this.renderable.setCurrentAnimation("iddle_up");
                } else if (this.renderable.isCurrentAnimation("down")) {
                    this.renderable.setCurrentAnimation("iddle_down");
                } else if (this.renderable.isCurrentAnimation("right")) {
                    this.renderable.setCurrentAnimation("iddle_right");
                }
                this.newIddle();
            } else if (!this.walking) {
                this.direction.first = !!Math.round(Math.random() * 1);
                this.direction.second = !!Math.round(Math.random() * 1);
                this.walking = true;
            } else {
                if (this.direction.first) {
                    if (this.direction.second) {
                        this.vel.x += this.accel.x * me.timer.tick;
                        this.renderable.setCurrentAnimation("right");
                        this.flipX(false);
                        this.flipped = false;
                    } else {
                        this.vel.x -= this.accel.x * me.timer.tick;
                        this.renderable.setCurrentAnimation("right");
                        this.flipX(true);
                        this.flipped = true;
                    }
                } else {
                    if (this.direction.second) {
                        this.vel.y += this.accel.x * me.timer.tick;
                        this.renderable.setCurrentAnimation("down");
                    } else {
                        this.vel.y -= this.accel.x * me.timer.tick;
                        this.renderable.setCurrentAnimation("up");
                    }
                }
            }
        }
    },
    modeAttacking: function() {

    },
    modeDying: function() {

    },
    modeIdling: function() {

    },
    initHP: function(hp) {
        this.hp = hp;
        this.max_hp = hp;
    }
});

game.npcs.AllyNPC = game.ShadowObject.extend({
    target_box: null,
    target_text: null,
    targeted: null,
    target_offset: null,
    dialog: null,
    speak_text: null,
    speak_text_timer: null,
    init: function(x, y, name, image, size, anim_length, dialog) {
        settings = {};
        settings.spritewidth = size;
        settings.spriteheight = size;
        settings.image = image;
        this.dialog = me.loader.getJSON(dialog);
        this.parent(x, y, settings);
        var animation = [];
        for (var i = 0; i < anim_length; i++) {
            animation.push(i);
        }
        this.renderable.addAnimation("always", animation, 35);
        this.renderable.setCurrentAnimation("always");
        this.name = name;
        this.type = "npc";
        this.targeted = false;
        this.target_box = null;
        this.target_text = null;
        this.target_offset = new me.Vector2d(6, 8);
        this.speak_text = null;
        this.speak_text_timer = 0;
    }, update: function() {
        this.shadow.pos.x = this.pos.x + this.target_offset.x;
        this.shadow.pos.y = this.pos.y + this.target_offset.y;

        if(this.speak_text !== null){
            if(me.timer.getTime() > (this.speak_text_timer + 1500)){
                me.game.remove(this.speak_text);
                this.speak_text = null;
                this.speak_text_timer = 0;
            }
        }

        this.targeted = false;
        var res = me.game.collide(this, true);
        if (res.length >= 1) {
            for (var i = 0; i < res.length; i++) {
                if (res[i].obj.type === "human_target") {
                    this.onTarget();
                } else if (res[i].obj.type === "human_use") {
                    this.onUse();
                } else if (res[i].obj.type === "human_attack") {
                    this.onHit();
                }
            }
        }

        if (!this.targeted) {
            this.destroyTarget();
            this.cleanup();
        }

        this.parent();
        return true;
    }, onTarget: function() {
        this.targeted = true;
        if (this.target_box === null) {
            this.target_box = me.entityPool.newInstanceOf("Target", this.pos.x + this.target_offset.x, this.pos.y + this.target_offset.y, "green");
            this.target_text = me.entityPool.newInstanceOf("SmallText", this.pos.x - (this.renderable.width / 2), this.pos.y + (this.renderable.height), this.name, game.fonts.white);
            me.game.add(this.target_box, this.z);
            me.game.add(this.target_text, this.z + 1);
            me.game.sort();
        }
    }, onUse: function() {

    }, onHit: function() {
        if (typeof this.dialog.hit_texts !== "undefined") {
            if (this.speak_text_timer === 0) {
                var random = Number.prototype.random(0, this.dialog.hit_texts.length - 1);
                this.speak_text = new game.SmallText(this.pos.x, this.pos.y - 5, this.dialog.hit_texts[random], game.fonts.white);
                me.game.add(this.speak_text, game.guiLayer);
                me.game.sort();
                this.speak_text_timer = me.timer.getTime();
            }
        }
    }, showTarget: function() {

    }, destroyTarget: function() {
        if (this.target_box !== null) {
            me.game.remove(this.target_box);
            me.game.remove(this.target_text);
            this.target_box = null;
            this.target_text = null;
        }
    }, cleanup: function() {
    }
});