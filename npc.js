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
    max_hp: 100,
    hp: 100,
    targeted: false,
    shadow: null,
    modes: ["walking", "standing", "attacking", "dying"],
    mode_select: "walking",
    exp: 10,
    armor: 0,
    drop: null,
    value: null,
    init: function(x, y, settings, c_shadow) {
        console.log("creating Walker");
        /*settings = {};
         settings.image = me.loader.getImage("firefox");
         settings.spritewidth = 32;
         settings.spriteheight = 32;*/
        this.parent(x, y, settings);
        this.renderable.addAnimation("right", [8, 9, 10, 11], 10);
        this.renderable.addAnimation("up", [32, 33, 34, 35, 36, 37, 38, 39]);
        this.renderable.addAnimation("down", [56, 57, 58, 59]);
        this.renderable.addAnimation("iddle_right", [16, 17, 18, 19, 20], 20);
        this.renderable.addAnimation("iddle_up", [40, 41], 35);
        this.renderable.addAnimation("iddle_down", [64, 65], 35);
        this.renderable.addAnimation("attack_down", [48, 49, 50, 51, 52], 3);
        this.renderable.addAnimation("attack_up", [24, 25, 26, 27, 28], 3);
        this.renderable.addAnimation("attack_right", [0, 1, 2, 3, 4], 3);
        this.renderable.setCurrentAnimation("iddle_right");
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
            this.shadow.pos.x = this.pos.x + 15;
            this.shadow.pos.y = this.pos.y + 15
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
        
        if(this.drop !== null){
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
    initHP: function(hp) {
        this.hp = hp;
        this.max_hp = hp;
    }
});