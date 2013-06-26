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
        this.parent(x, y, settings, true);
        console.log("creating WalkerRat");
        this.image = me.loader.getImage("rat");
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
        this.renderable.addAnimation("die", [0, 0, 1, 2, 3, 4, 4, 4], 7);
        this.renderable.setCurrentAnimation("iddle_right");
        this.updateColRect(15, 18, 18, 12);
        this.type = me.game.ENEMY_OBJECT;
        this.initHP(30);
        this.attack_cooldown = 1500;
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
                this.target_text.text = this.hp + "/" + this.max_hp;
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
            this.target = me.entityPool.newInstanceOf("Target", this.pos.x + 15, this.pos.y + 16, "red");
            this.target_text = me.entityPool.newInstanceOf("SmallText", this.pos.x + (this.renderable.width / 4), this.pos.y + (this.renderable.height / 1.5), this.hp + "/" + this.max_hp, "Arial", "1em", "red");
            me.game.add(this.target, this.z - 1);
            me.game.add(this.target_text, this.z + 1);
            me.game.sort();
        }
    },
    onHit: function() {
        var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
        this.hurt(player.countDMG(this.armor));
        console.log(this.hp);
        player.destroyAttack();
    },
    onUse: function() {
        this.use_text_t = true;
        if (this.use_text === null) {
            this.use_text = me.entityPool.newInstanceOf("SmallText", this.pos.x + 10, this.pos.y, "sqeeak!", "Arial", "1em", "white");
            me.game.add(this.use_text, this.z + 1);
            me.game.sort();
        }
    },
    hurt: function(value) {
        this.hp = this.hp - value;
        if (this.mode_select !== "dying") {
            if (this.hp <= 0) {
                this.renderable.setCurrentAnimation("die");
                me.game.getEntityByGUID(me.gamestat.getItemValue("player")).updateEXP(this.exp);
                this.mode_select = "dying";
            } else {
                this.renderable.flicker(20);
                if (this.mode_select !== "attacking") {
                    this.mode_select = "attacking";
                    smile = me.entityPool.newInstanceOf("Smile", this.pos.x + (this.renderable.width / 2), this.pos.y, "kill");
                    me.game.add(smile, 3);
                    me.game.sort();
                }
            }
        }
    },
    modeAttacking: function() {
        var this_vector = new me.Vector2d(this.pos.x + (this.renderable.width / 2), this.pos.y + (this.renderable.height / 2));
        var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
        var player_vector = new me.Vector2d(player.pos.x + (player.width / 2), player.pos.y + (player.height / 2));
        var angle = (this_vector.angle(player_vector) * (180 / Math.PI));
        this.vel.x = 0;
        this.vel.y = 0;
        //console.log(this_vector.distance(player_vector));
        if(this_vector.distance(player_vector) < 25){
            if(this.attack_cooldown_run){
                if(me.timer.getTime() > (this.attack_time + this.attack_cooldown)){
                    this.attack_cooldown_run = false;
                }
            } else {
                player.hurt(5);
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
                this.renderable.setCurrenAnimation("down");
            } else {
                this.renderable.setCurrentAnimation("attack_down");
            }
        }
    },
    modeDying: function() {
        this.alive = false;
        if (this.renderable.getCurrentAnimationFrame() === 7 && this.renderable.isCurrentAnimation("die")) {
            me.game.remove(this);
        }
    },
    onDestroyEvent: function() {
        this.parent();
        if (this.target !== null) {
            me.game.remove(this.target);
        }
    }
});

game.Rat = me.ObjectEntity.extend({
    max_hp: 30,
    hp: 30,
    shadow: null,
    target: null,
    attacked: false,
    attack_box: null,
    attacking: true,
    dying: false,
    attack: 2,
    armor: 0,
    rat_text: null,
    targeted: false,
    use_targeted: false,
    init: function(x, y, settings) {
        console.log("creating rat");
        this.parent(x, y, settings);
        this.collidable = true;
        this.renderable.addAnimation("iddle_right", [18, 19], 30);
        this.renderable.addAnimation("iddle_top", [35, 36, 37, 38], 30);
        this.renderable.addAnimation("iddle_down", [54, 55, 56, 57], 30);
        this.renderable.addAnimation("walk_right", [12, 13, 14], 30);
        this.renderable.addAnimation("walk_down", [49, 50, 51, 52], 30);
        this.renderable.addAnimation("walk_up", [30, 31, 32, 33], 30);
        this.renderable.addAnimation("attack_right", [6, 7, 8, 9, 10, 11], 5);
        this.renderable.addAnimation("attack_top", [24, 25, 26, 27], 5);
        this.renderable.addAnimation("attack_down", [42, 43, 44, 45], 5);
        this.renderable.addAnimation("die", [0, 0, 1, 2, 3, 4, 4, 4], 7);
        this.type = me.game.ENEMY_OBJECT;
        this.renderable.setCurrentAnimation("iddle_right");
        this.updateColRect(15, 18, 18, 12);

        this.shadow = new game.Shadow(this.pos.x + 15, this.pos.y + 15);
        me.game.add(this.shadow, 4);
        me.game.sort();

        this.rat_text = new me.Font("Arial", "1em", "white");
    },
    onDestroyEvent: function() {
        this.collidable = false;
        me.game.remove(this.shadow);
    },
    draw: function(context) {
        this.parent(context);
        if (this.targeted) {
            this.rat_text.draw(context, this.hp + "/" + this.max_hp, this.pos.x + (this.renderable.width / 4), this.pos.y + (this.renderable.height / 1.5));
        }
        if (this.use_targeted) {
            this.rat_text.draw(context, "sqeeak!", this.pos.x + (this.renderable.width / 4), this.pos.y);
        }
    },
    update: function() {
        if (this.renderable.getCurrentAnimationFrame() === 7 && this.renderable.isCurrentAnimation("die")) {
            me.game.remove(this);
        }
        if (this.attacked) {
            var this_vector = new me.Vector2d(this.pos.x + (this.renderable.width / 2), this.pos.y + (this.renderable.height / 2));
            var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
            var player_vector = new me.Vector2d(player.pos.x + (player.width / 2), player.pos.y + (player.height / 2));
            var angle = (this_vector.angle(player_vector) * (180 / Math.PI));

            if (angle <= 45 && angle >= -45) {
                //right
                this.renderable.setCurrentAnimation("attack_right");
                this.flipX(false);
            } else if (angle < -45 && angle >= -120) {
                //top
                this.renderable.setCurrentAnimation("attack_top");
            } else if ((angle < -120 && angle >= -180) || (angle > 120 && angle <= 180)) {
                //right_flipped
                this.renderable.setCurrentAnimation("attack_right");
                this.flipX(true);
            } else if (angle > 45 && angle <= 120) {
                //down
                this.renderable.setCurrentAnimation("attack_down")
            }

        }
        this.targeted = false;
        this.use_targeted = false;
        var res = me.game.collide(this, true);
        if (res.length >= 1 && this.dying === false) {
            for (var i = 0; i < res.length; i++) {
                if (res[i].obj.type === "human_attack") {
                    var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
                    this.hurt(player.countDMG(this.armor));
                    player.destroyAttack();
                }
                if (res[i].obj.type === "human_target") {
                    this.targeted = true;
                    // TODO:CHANGE
                    //me.game.HUD.setItemValue("EnemyHP", this.hp + ";rat;enemy");
                    if (this.target === null) {
                        this.target = new game.Target(this.pos.x + 15, this.pos.y + 16, "red");
                        me.game.add(this.target, 3);
                        me.game.sort();
                    }
                }
                if (res[i].obj.type === "human_use") {
                    this.use_targeted = true;
                }
            }
        }

        if (this.targeted === false && this.target !== null) {
            me.game.remove(this.target);
            this.target = null;
        }
        this.parent();
        return true;
    },
    hurt: function(value) {
        this.hp = this.hp - value;
        if (!this.dying) {
            if (this.hp <= 0) {
                this.renderable.setCurrentAnimation("die");
                me.game.getEntityByGUID(me.gamestat.getItemValue("player")).updateEXP(30);
                this.attacking = false;
                this.attacked = false;
                this.dying = true;
            } else {
                this.renderable.flicker(20);
                if (this.attacked === false) {
                    this.attacked = true;
                    smile = new game.Smile(this.pos.x + (this.renderable.width / 2), this.pos.y, "kill");
                    me.game.add(smile, 3);
                    me.game.sort();
                }
            }
        }
    }
});