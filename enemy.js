game.WalkerRat = game.WalkerNPC.extend({
    target: null,
    target_text: null,
    use_text_t: false,
    use_text: null,
    attack_cooldown: null,
    attack_cooldown_run: false,
    attack_time: null,
    init: function(x, y) {
        settings = {};
        settings.image = me.loader.getImage("npc_rat");
        settings.spritewidth = 48;
        settings.spriteheight = 48;
        var stats = new game.npcStats(20, 3, "normal", 0, 0, 15);
        this.parent(x, y, settings, true, stats);
        this.renderable.anim = [];
        this.renderable.addAnimation("iddle_right", [18, 19], 30);
        this.renderable.addAnimation("iddle_up", [36, 37, 38, 39], 30);
        this.renderable.addAnimation("iddle_down", [54, 55, 56, 57], 30);
        this.renderable.addAnimation("right", [12, 13, 14], 7);
        this.renderable.addAnimation("down", [49, 50, 51, 52], 7);
        this.renderable.addAnimation("up", [30, 31, 32, 33], 7);
        this.renderable.addAnimation("attack_right", [6, 7, 8, 9, 10, 11], 5);
        this.renderable.addAnimation("attack_up", [24, 25, 26, 27], 5);
        this.renderable.addAnimation("attack_down", [42, 43, 44, 45], 5);
        this.renderable.addAnimation("die", [0, 0, 1, 2, 3, 4, 4], 7);
        this.renderable.setCurrentAnimation("iddle_right");
        this.updateColRect(15, 18, 18, 12);
        this.type = me.game.ENEMY_OBJECT;
        this.attack_cooldown = 1500;
        this.drop = new game.mechanic.DropTable(200, 999, 200);
        this.attack_cooldown_run = false;
        this.value = 200;
    },
    update: function() {
        this.targeted = false;
        this.use_text_t = false;
        this.parent();

        if (this.target !== null) {
            if (this.targeted === false) {
                me.game.remove(this.target);
                me.game.remove(this.target_text);
                this.target = null;
                this.target_text = null;
            } else {
                this.target.pos.x = this.pos.x + 15;
                this.target.pos.y = this.pos.y + 16;
                this.target_text.text = this.stats.hp + "/" + this.stats.max_hp;
            }
        }
        if (this.use_text !== null && this.use_text_t === false) {
            me.game.remove(this.use_text);
            this.use_text = null;
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
    onHit: function() {
        var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
        var dmg = me.gamestat.getItemValue("stats").getDmg();
        if (Object.prototype.toString.call(dmg) === '[object Array]') {
            for (var i = 0; i < dmg.length; i++) {
                console.log(dmg[i].dmg + " " + dmg[i].type);
                var result_dmg = this.hurt(dmg[i].dmg, dmg[i].type);
                var font = game.fonts.good_green;
                if (dmg[i].type === "magic") {
                    if (dmg[i].element === "fire") {
                        font = game.fonts.bad_red;
                    } else {
                        font = game.fonts.magic_blue;
                    }
                }
                this.hit_text = me.entityPool.newInstanceOf("HitText", this.pos.x + (this.renderable.width / 2), this.pos.y + (this.renderable.height / 2), result_dmg, font);
            }
        } else {
            var result_dmg = this.hurt(dmg, "normal");
            this.hit_text = me.entityPool.newInstanceOf("HitText", this.pos.x + (this.renderable.width / 2), this.pos.y + (this.renderable.height / 2), result_dmg, game.fonts.good_green);
            
        }
        player.destroyAttack();

        me.game.add(this.hit_text, this.z + 1);
        me.game.sort();
    },
    onUse: function() {
        this.use_text_t = true;
        if (this.use_text === null) {
            this.use_text = me.entityPool.newInstanceOf("SmallText", this.pos.x + 10, this.pos.y, "sqeeak!", game.fonts.white);
            me.game.add(this.use_text, this.z + 1);
            me.game.sort();
        }
    },
    hurt: function(dmg, dmg_type) {
        if (this.mode_select !== "dying") {
            var result_dmg = game.mechanic.count_dmg(dmg, dmg_type, this.stats.armor_normal, this.stats.armor_magic);
            this.stats.hp -= result_dmg;
            if (this.stats.hp <= 0) {
                this.renderable.setCurrentAnimation("die");
                me.game.getEntityByGUID(me.gamestat.getItemValue("player")).updateEXP(this.stats.exp);
                var exp_text = new game.effects.ExpText(this.pos.x + (this.renderable.width / 2), this.pos.y + (this.renderable.height / 2), this.stats.exp + "xp");
                me.game.add(exp_text, this.z);
                me.game.sort();
                this.mode_select = "dying";
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
        var this_vector = new me.Vector2d(this.pos.x + (this.renderable.width / 2), this.pos.y + (this.renderable.height / 2));
        var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
        if (player === null) {
            this.mode_select = "walking";
            return;
        }
        var player_vector = new me.Vector2d(player.pos.x + (player.width / 2), player.pos.y + (player.height / 2));
        var angle = (this_vector.angle(player_vector) * (180 / Math.PI));
        this.vel.x = 0;
        this.vel.y = 0;
        //console.log(this_vector.distance(player_vector));
        if (this_vector.distance(player_vector) < 25) {
            if (this.attack_cooldown_run) {
                if (me.timer.getTime() > (this.attack_time + this.attack_cooldown)) {
                    this.attack_cooldown_run = false;
                }
            } else {
                player.hurt(2);
                this.attack_cooldown_run = true;
                this.attack_time = me.timer.getTime();
            }
        }
        if (angle <= 45 && angle >= -45) {
            //right
            this.flipX(false);
            if (this_vector.distance(player_vector) >= 25) {
                this.vel.x += this.accel.x * me.timer.tick;
                this.renderable.setCurrentAnimation("right");
            } else {
                this.renderable.setCurrentAnimation("attack_right");
            }
        } else if (angle < -45 && angle >= -120) {
            //top
            if (this_vector.distance(player_vector) >= 25) {
                this.vel.y -= this.accel.x * me.timer.tick;
                this.renderable.setCurrentAnimation("up");
            } else {
                this.renderable.setCurrentAnimation("attack_up");
            }
        } else if ((angle < -120 && angle >= -180) || (angle > 120 && angle <= 180)) {
            //right_flipped
            this.flipX(true);
            if (this_vector.distance(player_vector) >= 25) {
                this.vel.x -= this.accel.x * me.timer.tick;
                this.renderable.setCurrentAnimation("right");
            } else {
                this.renderable.setCurrentAnimation("attack_right");
            }
        } else if (angle > 45 && angle <= 120) {
            //down
            if (this_vector.distance(player_vector) >= 25) {
                this.vel.y += this.accel.x * me.timer.tick;
                this.renderable.setCurrentAnimation("down");
            } else {
                this.renderable.setCurrentAnimation("attack_down");
            }
        }
    },
    modeDying: function() {
        this.alive = false;
        if (this.target_text !== null) {
            me.game.remove(this.target_text);
            this.target_text = null;
        }
        if (this.target !== null) {
            me.game.remove(this.target);
            this.target = null;
        }

        if (this.use_text !== null) {
            me.game.remove(this.use_text);
            this.use_text = null;
        }

        if (this.renderable.getCurrentAnimationFrame() === 6 && this.renderable.isCurrentAnimation("die")) {
            this.onDrop();
            me.game.remove(this);
        }
    },
    onDestroyEvent: function() {
        this.parent();

    }
});

game.npcs.MimicWeapon = game.WalkerNPC.extend({
    stealth: null,
    target_color: null,
    target_box: null,
    tooltip: null,
    init: function(x, y) {
        settings = {};
        settings.image = me.loader.getImage("item-axe");
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        var stats = new game.npcStats(20, 3, "normal", 0, 0, 0);
        this.parent(x, y, settings, true, stats);
        this.renderable.anim = [];
        this.renderable.addAnimation("inactive", [0, 1, 2, 3, 4]);
        this.renderable.setCurrentAnimation("inactive");
        this.updateColRect(15, 18, 18, 12);
        this.type = me.game.ENEMY_OBJECT;
        this.attack_cooldown = 1500;
        this.drop = new game.mechanic.DropTable(0, 0, 0);
        this.attack_cooldown_run = false;
        this.mode_select = "idling";
        this.shadow_offset = new me.Vector2d(0, 5);
        this.stealth = true;
        this.target_color = "green";
        this.updateColRect(0, 16, 0, 16);
        this.target_box = null;
        this.tooltip = null;
        console.log(this);
    },
    update: function() {
        this.targeted = false;
        this.parent();

        if (this.target_box !== null) {
            if (this.targeted === false) {
                me.game.remove(this.target_box);
                this.target_box = null;
                this.destroyTooltip();
            } else {
                this.target_box.pos.x = this.pos.x;
                this.target_box.pos.y = this.pos.y + 5;
            }
        }
    },
    onTarget: function() {
        this.targeted = true;
        if (this.target_box === null) {
            this.target_box = me.entityPool.newInstanceOf("Target", this.pos.x + 0, this.pos.y + 5, this.target_color);
            me.game.add(this.target_box, this.z - 1);
            if (this.stealth) {
                this.tooltip = new game.DropTooltip(this.pos.x - (this.renderable.width / 2), this.pos.y - 5, "Axe", "normal");
                me.game.add(this.tooltip, game.guiLayer - 1);
            }
            me.game.sort();
        }
    },
    onUse: function() {
        if (this.stealth) {
            this.target_color = "red";
            me.game.remove(this.target_box);
            this.target_box = null;
            this.destroyTooltip();
            this.stealth = false;
            var text = new game.effects.SpeakText(this.pos.x, this.pos.y, "HAHAHAHAH!");
            me.game.add(text, this.guiLayer - 2);

            var active_mimic = new game.npcs.MimicWeaponActive(this.pos.x, this.pos.y);
            me.game.add(active_mimic, this.z);
            me.game.sort();

            me.game.remove(this);
        }
    },
    destroyTooltip: function() {
        if (this.tooltip !== null) {
            me.game.remove(this.tooltip);
            this.tooltip = null;
        }
    },
    destroyTargetBox: function() {
        if (this.target_box !== null) {
            me.game.remove(this.target_box);
            this.target_box;
        }
    }, onDestroyEvent: function() {
        this.parent();
        this.destroyTargetBox();
        this.destroyTooltip();
    }
});

game.npcs.MimicWeaponActive = game.WalkerNPC.extend({
    target_box: null,
    targe_text: null,
    init: function(x, y) {
        settings = {};
        settings.image = me.loader.getImage("axe");
        settings.spritewidth = 48;
        settings.spriteheight = 48;
        var stats = new game.npcStats(45, 10, "normal", 0, 0, 50);
        this.parent(x, y, settings, true, stats);
        this.renderable.anim = [];
        this.renderable.addAnimation("attack_right", [0, 1, 2, 3, 4], 3);
        this.renderable.addAnimation("right", [5, 6, 7, 8]);
        this.renderable.addAnimation("iddle_right", [10, 11], 30);
        this.renderable.addAnimation("attack_up", [15, 16, 17, 18, 19], 3);
        this.renderable.addAnimation("up", [20, 21, 22, 23]);
        this.renderable.addAnimation("iddle_up", [25, 26], 30);
        this.renderable.addAnimation("attack_down", [30, 31, 32, 33, 34], 3);
        this.renderable.addAnimation("down", [35, 36, 37, 38]);
        this.renderable.addAnimation("iddle_down", [40, 41], 30);
        this.renderable.setCurrentAnimation("iddle_right");
        this.updateColRect(10, 16, 22, 16);
        this.type = me.game.ENEMY_OBJECT;
        this.attack_cooldown = 1500;
        this.drop = new game.mechanic.DropTable(200, 50, 200);
        this.attack_cooldown_run = false;
        this.mode_select = "attacking";
        this.shadow_offset = new me.Vector2d(12, 24);
        this.target_box = null;
        this.target_text = null;
        this.setVelocity(1.0, 1.0);
    },
    update: function() {
        this.targeted = false;
        this.parent();

        if (this.target_box !== null) {
            if (this.targeted === false) {
                me.game.remove(this.target_box);
                me.game.remove(this.target_text);
                this.target_box = null;
                this.target_text = null;
            } else {
                this.target_box.pos.x = this.pos.x + this.collisionBox.colPos.x;
                this.target_box.pos.y = this.pos.y + this.collisionBox.colPos.y;
                this.target_text.text = this.stats.hp + "/" + this.stats.max_hp;
            }
        }
    },
    onTarget: function() {
        this.targeted = true;
        if (this.target_box === null) {
            var text = this.stats.hp + "/" + this.stats.max_hp;
            this.target_box = me.entityPool.newInstanceOf("Target", this.pos.x + 10, this.pos.y + 23, "red");
            this.target_text = me.entityPool.newInstanceOf("SmallText", this.pos.x + (this.renderable.width / 4), this.pos.y + (this.renderable.height / 1.5), text, game.fonts.bad_red);
            me.game.add(this.target_box, this.z - 1);
            me.game.add(this.target_text, this.z + 1);
            me.game.sort();
        }
    },
    hurt: function(dmg, dmg_type) {
        if (this.mode_select !== "dying") {
            var result_dmg = game.mechanic.count_dmg(dmg, dmg_type, this.stats.armor_normal, this.stats.armor_magic);
            this.stats.hp -= result_dmg;
            if (this.stats.hp <= 0) {
                this.onDrop();
                this.renderable.setCurrentAnimation("die");
                me.game.getEntityByGUID(me.gamestat.getItemValue("player")).updateEXP(this.stats.exp);
                var exp_text = new game.effects.ExpText(this.pos.x + (this.renderable.width / 2), this.pos.y + (this.renderable.height / 2), this.stats.exp + "xp");
                me.game.add(exp_text, this.z);
                me.game.sort();
                this.mode_select = "dying";
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
        var this_vector = new me.Vector2d(this.pos.x + (this.renderable.width / 2), this.pos.y + (this.renderable.height / 2));
        var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
        if (player === null) {
            this.mode_select = "walking";
            return;
        }
        var player_vector = new me.Vector2d(player.pos.x + (player.width / 2), player.pos.y + (player.height / 2));
        var angle = (this_vector.angle(player_vector) * (180 / Math.PI));
        this.vel.x = 0;
        this.vel.y = 0;
        //console.log(this_vector.distance(player_vector));
        if (this_vector.distance(player_vector) < 25) {
            if (this.attack_cooldown_run) {
                if (me.timer.getTime() > (this.attack_time + this.attack_cooldown)) {
                    this.attack_cooldown_run = false;
                }
            } else {
                player.hurt(this.stats.dmg);
                this.attack_cooldown_run = true;
                this.attack_time = me.timer.getTime();
            }
        }
        if (angle <= 45 && angle >= -45) {
            //right
            this.flipX(false);
            this.updateColRect(25, 16, 23, 16);
            this.shadow_offset.x = 25;
            if (this_vector.distance(player_vector) >= 25) {
                this.vel.x += this.accel.x * me.timer.tick;
                this.renderable.setCurrentAnimation("right");
            } else {
                this.renderable.setCurrentAnimation("attack_right");
            }
        } else if (angle < -45 && angle >= -120) {
            //top
            this.flipX(false);
            this.updateColRect(25, 16, 23, 16);
            this.shadow_offset.x = 25;
            if (this_vector.distance(player_vector) >= 25) {
                this.vel.y -= this.accel.x * me.timer.tick;
                this.renderable.setCurrentAnimation("up");
            } else {
                this.renderable.setCurrentAnimation("attack_up");
            }
        } else if ((angle < -120 && angle >= -180) || (angle > 120 && angle <= 180)) {
            //right_flipped
            this.flipX(true);

            this.updateColRect(12, 16, 23, 16);
            this.shadow_offset.x = 12;
            if (this_vector.distance(player_vector) >= 25) {
                this.vel.x -= this.accel.x * me.timer.tick;
                this.renderable.setCurrentAnimation("right");
            } else {
                this.renderable.setCurrentAnimation("attack_right");
            }
        } else if (angle > 45 && angle <= 120) {
            //down
            this.flipX(false);
            this.updateColRect(25, 16, 23, 16);
            this.shadow_offset.x = 25;
            if (this_vector.distance(player_vector) >= 25) {
                this.vel.y += this.accel.x * me.timer.tick;
                this.renderable.setCurrentAnimation("down");
            } else {
                this.renderable.setCurrentAnimation("attack_down");
            }
        }
    }
});