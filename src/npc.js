game.npcStats = Object.extend({
    hp: null,
    max_hp: null,
    dmg_min: null,
    dmg_max: null,
    normal_armor: null,
    magic_armor: null,
    dmg_type: null,
    exp: null,
    stance: null,
    init: function(max_hp, dmg_min, dmg_max, dmg_type, armor_normal, armor_magic, exp, stance) {
        this.hp = max_hp;
        this.max_hp = max_hp;
        this.dmg_min = dmg_min;
        this.dmg_max = dmg_max;
        this.dmg_type = dmg_type;
        this.normal_armor = armor_normal;
        this.magic_armor = armor_magic;
        this.exp = exp;
        this.stance = stance;
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
            me.game.add(this.shadow, game.LAYERS.NPC - 1);
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
                        game.instances.player.destroyUse();
                        this.onUse();
                    } else if (res[i].obj.type === "human_attack") {
                        this.onHit();
                    } else if (res[i].obj.type === "projectile") {
                        if (this.type === me.game.ENEMY_OBJECT) {
                            var result_dmg = this.hurt(res[i].obj.dmg_min, res[i].obj.dmg_max, res[i].obj.element);
                            this.hit_text = me.entityPool.newInstanceOf("HitText", this.pos.x + (this.renderable.width / 2), this.pos.y + (this.renderable.height / 2) + (i * 6), result_dmg, game.fonts.bad_red);
                            me.game.add(this.hit_text, this.z + 1);
                            me.game.sort();
                            me.game.remove(res[i].obj);
                        }
                    }
                }
            }
            this.updateMovement();
            if (this.shadow !== null) {
                this.shadow.pos.x = this.pos.x + this.shadow_offset.x;
                this.shadow.pos.y = this.pos.y + this.shadow_offset.y;
            }
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
        if (this.type === me.game.ENEMY_OBJECT) {
            var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
            var dmg = me.gamestat.getItemValue("stats").getDmg();
            for (var i = 0; i < dmg.length; i++) {
                var result_dmg = this.hurt(dmg[i].min_dmg, dmg[i].max_dmg, dmg[i].type);
                var font = game.fonts.white;
                if (dmg[i].type === "magic") {
                    if (dmg[i].element === "fire") {
                        font = game.fonts.bad_red;
                    } else {
                        font = game.fonts.magic_blue;
                    }
                }
                this.hit_text = me.entityPool.newInstanceOf("HitText", this.pos.x + (this.renderable.width / 2), this.pos.y + (this.renderable.height / 2) + (i * 6), result_dmg, font);
                me.game.add(this.hit_text, this.z + 1);
            }

            player.destroyAttack();
            me.game.sort();
        }
    },
    onUse: function() {

    },
    onTarget: function() {

    },
    onDestroyEvent: function() {
        this.collidable = false;
        me.game.remove(this.shadow);
        this.shadow = null;

    },
    onDrop: function() {
        if (this.drop !== null && this.type === me.game.ENEMY_OBJECT) {
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

game.npcs.AllyWalker = game.WalkerNPC.extend({
    targeted: null,
    target: null,
    target_text: null,
    name: null,
    init: function(x, y, settings, c_shadow, stats) {
        this.parent(x, y, settings, c_shadow, stats);
        this.target = null;
        this.targeted = false;
        this.target_text = false;
        this.type = "npc";
    },
    update: function() {
        this.targeted = false;
        this.parent();

        if (this.target !== null) {
            if (this.targeted === false) {
                me.game.remove(this.target);
                me.game.remove(this.target_text);
                this.target = null;
                this.target_text = null;
            } else {
                this.target.pos.x = this.pos.x + this.target_offset.x;
                this.target.pos.y = this.pos.y + this.target_offset.y;
                this.target_text.pos.x = this.pos.x + (this.renderable.width / 4);
                this.target_text.pos.y = this.pos.y + (this.renderable.height / 1.5);
            }
        }
    },
    onTarget: function() {
        this.targeted = true;
        if (this.target === null) {
            this.target = me.entityPool.newInstanceOf("Target", this.pos.x + 15, this.pos.y + 16, "green");
            this.target_text = me.entityPool.newInstanceOf("SmallText", this.pos.x + (this.renderable.width / 4), this.pos.y + (this.renderable.height), this.name, game.fonts.white);
            me.game.add(this.target, this.z - 1);
            me.game.add(this.target_text, this.z + 1);
            me.game.sort();
        }
    }, onDestroyEvent: function(){
        if(this.target !== null){
            me.game.remove(this.target);
            this.target = null;
            me.game.remove(this.target_text);
            this.target_text = null;
        }
        this.parent();
    }
});

game.npcs.EnemyNPC = game.WalkerNPC.extend({
    target: null,
    target_text: null,
    targeted: null,
    target_offset: null,
    attack_cooldown: null,
    attack_cooldown_run: false,
    attack_time: null,
    path: null,
    init: function(x, y, settings, c_shadow, stats) {
        this.parent(x, y, settings, c_shadow, stats);
        this.attack_cooldown_run = false;
        this.targeted = false;
        this.target_offset = new me.Vector2d(15, 16);
        this.mode_select = "walking";
        this.path = null;
    },
    update: function() {
        this.targeted = false;
        this.parent();

        if (this.stats.stance === "aggresive" && this.mode_select !== "attacking" && this.mode_select !== "dying" && game.instances.player !== null) {
            var distance = Math.floor(this.pos.distance(game.instances.player.pos));
            if (distance < 100) {
                this.mode_select = "attacking";
            }
        }

        if (this.target !== null) {
            if (this.targeted === false) {
                me.game.remove(this.target);
                me.game.remove(this.target_text);
                this.target = null;
                this.target_text = null;
            } else {
                this.target.pos.x = this.pos.x + this.target_offset.x;
                this.target.pos.y = this.pos.y + this.target_offset.y;
                this.target_text.text = this.stats.hp + "/" + this.stats.max_hp;
                this.target_text.pos.x = this.pos.x + (this.renderable.width / 4);
                this.target_text.pos.y = this.pos.y + (this.renderable.height / 1.5);
            }
        }
    },
    onTarget: function() {
        this.targeted = true;
        if (this.target === null) {
            var text = this.stats.hp + "/" + this.stats.max_hp;
            this.target = me.entityPool.newInstanceOf("Target", this.pos.x + 15, this.pos.y + 16, "red");
            this.target_text = me.entityPool.newInstanceOf("SmallText", this.pos.x + (this.renderable.width / 4), this.pos.y + (this.renderable.height / 1.5), text, game.fonts.bad_red);
            me.game.add(this.target, this.z - 1);
            me.game.add(this.target_text, this.z + 1);
            me.game.sort();
        }
    },
    hurt: function(dmg_min, dmg_max, dmg_type) {
        if (this.mode_select !== "dying") {
            var result_dmg = game.mechanic.count_dmg(dmg_min, dmg_max, dmg_type, this.stats.normal_armor, this.stats.magic_armor);
            this.stats.hp -= result_dmg;
            var percent = Math.floor((this.stats.hp * 100) / this.stats.max_hp);
            game.mechanic.set_enemy_panel(this.name, percent);
            if (this.stats.hp <= 0) {
                if (typeof this.renderable.anim["die"] !== "undefined") {
                    this.renderable.setCurrentAnimation("die");
                }
                me.game.getEntityByGUID(me.gamestat.getItemValue("player")).updateEXP(this.stats.exp);
                var exp_text = new game.effects.ExpText(this.pos.x + (this.renderable.width / 2), this.pos.y + (this.renderable.height / 2), this.stats.exp + "xp");
                me.game.add(exp_text, this.z);
                me.game.sort();
                this.mode_select = "dying";
                this.alive = false;
                this.vel.x = 0;
                this.vel.y = 0;
            } else {
                this.renderable.flicker(5);
                if (this.mode_select !== "attacking") {
                    this.mode_select = "attacking";
                }
            }
            return result_dmg;
        }
    },
    modeAttacking: function() {
        if (game.instances.player === null) {
            this.mode_select = "walking";
            return;
        }
        var this_vector = new me.Vector2d(this.pos.x + (this.renderable.width / 2), this.pos.y + (this.renderable.height / 2));
        var player = game.instances.player;
        var player_vector = new me.Vector2d(player.pos.x + (player.width / 2), player.pos.y + (player.height / 2));
        var angle = (this_vector.angle(player_vector) * (180 / Math.PI));
        var player = game.instances.player;
        if (player === null) {
            this.mode_select = "walking";
            return;
        }

        this.vel.x = 0;
        this.vel.y = 0;

        if (this.attack_cooldown_run) {
            if (me.timer.getTime() > (this.attack_time + this.attack_cooldown)) {
                this.attack_cooldown_run = false;
            } else {
                return;
            }
        }

        var distance = parseInt(this_vector.distance(player_vector));

        if (this.path === null && distance > 25) {
            this.path = game.pathfinding.findPath(game.pathfinding.getObjectNode(this), game.pathfinding.getPlayerNode());
            for (var i = 0; i < this.path.length; i++) {
                this.path[i].x = (this.path[i].x * 16) + 8;
                this.path[i].y = (this.path[i].y * 16) + 8;
            }
        } else if (distance <= 25) {
            this.path = null;
            this.attack_cooldown_run = true;
            this.attack_time = me.timer.getTime();
            var angle = (this_vector.angle(player_vector) * (180 / Math.PI));
            if (angle <= 45 && angle >= -45) {
                this.renderable.setCurrentAnimation("attack_right", this.finishAttack.bind(this));
                this.flipX(false);
            } else if (angle < -45 && angle >= -120) {
                this.renderable.setCurrentAnimation("attack_up", this.finishAttack.bind(this));
                this.flipX(false);
            } else if ((angle < -120 && angle >= -180) || (angle > 120 && angle <= 180)) {
                this.renderable.setCurrentAnimation("attack_right", this.finishAttack.bind(this));
                this.flipX(true);
            } else if (angle > 45 && angle <= 120) {
                this.renderable.setCurrentAnimation("attack_down", this.finishAttack.bind(this));
                this.flipX(false);
            }
        }

        if (this.path !== null) {
            if (parseInt(this_vector.distance(this.path[0])) > 0) {
                var angle = (this_vector.angle(this.path[0]) * (180 / Math.PI));
                if (angle <= 45 && angle >= -45) {
                    this.vel.x += this.accel.x * me.timer.tick;
                    this.renderable.setCurrentAnimation("right");
                    this.flipX(false);
                } else if (angle < -45 && angle >= -120) {
                    this.vel.y -= this.accel.y * me.timer.tick;
                    this.renderable.setCurrentAnimation("up");
                    this.flipX(false);
                } else if ((angle < -120 && angle >= -180) || (angle > 120 && angle <= 180)) {
                    this.vel.x -= this.accel.x * me.timer.tick;
                    this.renderable.setCurrentAnimation("right");
                    this.flipX(true);
                } else if (angle > 45 && angle <= 120) {
                    this.vel.y += this.accel.y * me.timer.tick;
                    this.renderable.setCurrentAnimation("down");
                    this.flipX(false);
                }
            } else {
                this.path.splice(0, 1);
                if (this.path.length === 0) {
                    this.path = null;
                }
            }
        }
    },
    modeDying: function() {
        if (this.target_text !== null) {
            me.game.remove(this.target_text);
            this.target_text = null;
        }
        if (this.target !== null) {
            me.game.remove(this.target);
            this.target = null;
        }

        if (this.renderable.getCurrentAnimationFrame() === 6 && this.renderable.isCurrentAnimation("die")) {
            this.onDrop();
            me.game.remove(this);
        }
    },
    finishAttack: function() {
        game.instances.player.hurt(this.stats.dmg_min, this.stats.dmg_max, this.stats.dmg_type);
        if (this.renderable.isCurrentAnimation("attack_right")) {
            this.renderable.setCurrentAnimation("iddle_right");
        } else if (this.renderable.isCurrentAnimation("attack_up")) {
            this.renderable.setCurrentAnimation("iddle_up");
        } else {
            this.renderable.setCurrentAnimation("iddle_down");
        }

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
        if (Object.prototype.toString.call(size) === '[object Array]') {
            settings.spritewidth = size[0];
            settings.spriteheight = size[1];
        } else {
            settings.spritewidth = size;
            settings.spriteheight = size;
        }
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

        if (this.speak_text !== null) {
            if (me.timer.getTime() > (this.speak_text_timer + 1500)) {
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
                    game.instances.player.destroyUse();
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
                this.speak_text = new game.gui.SmallText(this.pos.x, this.pos.y - 5, this.dialog.hit_texts[random], game.fonts.white);
                me.game.add(this.speak_text, game.LAYERS.GUI);
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