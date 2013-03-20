var Player = me.ObjectEntity.extend({
    shadow: null,
    inventory: null,
    attacking: false,
    attack_box: null,
    weapon: null,
    weapon_id: null,
    target_box: null,
    use_box: null,
    use_box_timer: null,
    attack: 5,
    flipped: false,
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS_BOTH);

        this.addAnimation("right", [5, 6, 7, 8]);
        this.addAnimation("up", [20, 21, 22, 23]);
        this.addAnimation("down", [35, 36, 37, 38]);
        this.addAnimation("iddle_right", [10, 11], 30);
        this.addAnimation("iddle_up", [25, 26], 30);
        this.addAnimation("iddle_down", [40, 41], 30);
        this.addAnimation("attack_down", [30, 31, 32, 33, 34], 1);
        this.addAnimation("attack_up", [15, 16, 17, 18, 19], 1);
        this.addAnimation("attack_right", [0, 1, 2, 3, 4], 1);

        this.setVelocity(1.5, 1.5);
        this.gravity = 0;
        this.updateColRect(10, 12, 5, 22);
        this.setCurrentAnimation("iddle_down");

        //store GUID
        if (me.gamestat.getItemValue("player") === 0) {
            me.gamestat.add("player", this.GUID);
        } else {
            console.log("Player old GUID " + me.gamestat.getItemValue("player") + " New GUID " + this.GUID);
            me.gamestat.setValue("player", this.GUID);
        }
        this.type = "player";

        this.shadow = new Shadow(this.pos.x + 8, this.pos.y + 13);
        me.game.add(this.shadow, 4);
        this.target_box = new CollisionBox(this.pos.x + 8, this.pos.y + 22, "human_target");
        me.game.add(this.target_box, 4);
        me.game.sort();

    },
    update: function() {
        var last_vel = this.vel.clone();
        me.game.HUD.setItemValue("HP", me.gamestat.getItemValue("hp"));
        if (this.use_box !== null) {
            if ((me.timer.getTime() - this.use_box_timer) > 200) {
                this.destroyUse();
            }
        }

        if (this.attacking) {
            if (this.getCurrentAnimationFrame() === 4) {
                if (this.isCurrentAnimation("attack_up")) {
                    this.setCurrentAnimation("iddle_up");
                } else if (this.isCurrentAnimation("attack_down")) {
                    this.setCurrentAnimation("iddle_down");
                } else if (this.isCurrentAnimation("attack_right")) {
                    this.setCurrentAnimation("iddle_right");
                }   

                if (this.attack_box !== null) {
                    me.game.remove(this.attack_box);
                }
                this.attacking = false;
            }
        }

        if (me.input.isKeyPressed('attack') && this.attacking === false) {
            this.vel.x = 0;
            this.vel.y = 0;
            this.attacking = true;
            if ((this.isCurrentAnimation("up") === true) || (this.isCurrentAnimation("iddle_up") === true)) {
                this.setCurrentAnimation("attack_up");
                this.createAttack("up");
            } else if ((this.isCurrentAnimation("down") === true) || (this.isCurrentAnimation("iddle_down") === true)) {
                this.setCurrentAnimation("attack_down");
                this.createAttack("down");
            } else if ((this.isCurrentAnimation("right") === true) || (this.isCurrentAnimation("iddle_right") === true)) {
                this.setCurrentAnimation("attack_right");
                this.createAttack("right");
            }
        } else {
            if (this.attacking === false) {
                if (me.input.isKeyPressed('left')) {
                    // flip the sprite on horizontal axis
                    this.setCurrentAnimation("right");
                    this.flipX(true);
                    this.flipped = true;
                    // update the entity velocity
                    this.vel.x -= this.accel.x * me.timer.tick;
                    this.vel.y = 0;
                } else if (me.input.isKeyPressed('right')) {
                    this.setCurrentAnimation("right");
                    // unflip the sprite
                    this.flipX(false);
                    this.flipped = false;
                    // update the entity velocity
                    this.vel.x += this.accel.x * me.timer.tick;
                    this.vel.y = 0;
                } else if (me.input.isKeyPressed('up')) {
                    this.setCurrentAnimation("up");
                    // update the entity velocity
                    this.vel.y -= this.accel.y * me.timer.tick;
                    this.vel.x = 0;
                } else if (me.input.isKeyPressed('down')) {
                    this.setCurrentAnimation("down");
                    // unflip the sprite
                    this.flipX(false);
                    this.flipped = false;
                    // update the entity velocity
                    this.vel.y += this.accel.y * me.timer.tick;
                    this.vel.x = 0;
                } else {
                    if (me.input.isKeyPressed('use')) {
                        this.createUse();
                    } else if (me.input.isKeyPressed('inventory')) {
                        console.log(me.gamestat.getItemValue("inventory"));
                    }
                    this.vel.x = 0;
                    this.vel.y = 0;
                    if (this.isCurrentAnimation('right')) {
                        this.setCurrentAnimation('iddle_right');
                    } else if (this.isCurrentAnimation('up')) {
                        this.setCurrentAnimation('iddle_up');
                    } else if (this.isCurrentAnimation('down')) {
                        this.setCurrentAnimation('iddle_down');
                    }
                }
            }
        }

        var res = me.game.collide(this);
        if (res) {
            //this is quite horrible solution
            if ((res.obj.type === "npc") || (res.obj.type === me.game.ENEMY_OBJECT)) {
                if (res.x !== 0) {
                    // x axis
                    if (res.x < 0) {
                        //this.vel.x = -this.vel.x;
                        this.vel.y = 0;
                        this.vel = last_vel;

                    } else {
                        this.vel.x = -this.vel.x;
                        this.vel.y = 0;
                    }
                }
                else {
                    // y axis
                    if (res.y < 0) {
                        this.vel.y = -this.vel.y;
                        this.vel.x = 0;

                    } else {
                        this.vel.y = -this.vel.y;
                        this.vel.x = 0;
                    }
                }
            }
            if ((res.obj.type === "fire" || res.obj.type === "cold")) {
                //ouch this hurts

            }
        }

        // check & update player movement
        this.updateMovement();
        this.shadow.pos.x = this.pos.x + 8;
        this.shadow.pos.y = this.pos.y + 13;
        if (this.weapon !== null) {
            this.weapon.pos.x = this.pos.x;
            this.weapon.pos.y = this.pos.y;
            this.syncWeapon();
        }
        this.updateTargetBox();

        // update object animation
        this.parent();
        return true;
    },
    updateHP: function(value) {
        me.gamestat.updateValue("hp", value);
    },
    updateEXP: function(value) {
        me.gamestat.updateValue("exp", value);
    },
    createAttack: function(direction) {
        if (direction === "up") {
            //top
            this.attack_box = new CollisionBox(this.pos.x + 10, this.pos.y - 16 + 8, "human_attack");
        } else if (direction === "down") {//down
            this.attack_box = new CollisionBox(this.pos.x + 8, this.pos.y + 22 + 2, "human_attack");
        } else if (direction === "right") {//right
            if (this.lastflipX) {
                this.attack_box = new CollisionBox(this.pos.x + 10 - 16, this.pos.y + 8, "human_attack");
            } else {
                this.attack_box = new CollisionBox(this.pos.x + 10 + 12, this.pos.y + 8, "human_attack");
            }
        }
        me.game.add(this.attack_box, 4);
        me.game.sort();

    }, destroyAttack: function() {
        me.game.remove(this.attack_box);
        this.use_box_timer = null;
    }, destroyUse: function() {
        me.game.remove(this.use_box);
        this.use_box = null;
        this.use_box_timer = me.timer.getTime();
    }, updateTargetBox: function() {
        if ((this.isCurrentAnimation("up") === true) || (this.isCurrentAnimation("iddle_up") === true)) {
            this.target_box.pos.x = this.pos.x + 10;
            this.target_box.pos.y = this.pos.y - 16 + 8;
        } else if ((this.isCurrentAnimation("down") === true) || (this.isCurrentAnimation("iddle_down") === true)) {
            this.target_box.pos.x = this.pos.x + 8;
            this.target_box.pos.y = this.pos.y + 22 + 2;
        } else if ((this.isCurrentAnimation("right") === true) || (this.isCurrentAnimation("iddle_right") === true)) {
            if (this.lastflipX) {
                this.target_box.pos.x = this.pos.x + 10 - 16;
                this.target_box.pos.y = this.pos.y + 8;
            } else {
                this.target_box.pos.x = this.pos.x + 10 + 12;
                this.target_box.pos.y = this.pos.y + 8;
            }
        }
    }, createUse: function() {
        if (this.use_box === null) {
            this.use_box = new CollisionBox(this.target_box.pos.x, this.target_box.pos.y, "human_use");
            me.game.add(this.use_box, 5);
            me.game.sort();
        }
    }, hurt: function(damage) {
        this.updateHP(-10);
        if (this.hp >= 0) {
            //DEAD
        } else {
            this.flicker(20);
        }
    }, equipWeapon: function(id) {
        name = me.gamestat.getItemValue("inventory")[id];
        if (this.weapon !== null) {
            me.game.HUD.updateItemValue("inventory", id);
            me.game.remove(this.weapon);
            this.weapon = null;
        }
        if (this.weapon_id === id) {
            this.weapon_id = null;
        } else {
            if (name === "item-sword1") {
                this.weapon = new Sword1(this.pos.x, this.pos.y);
                this.weapon_id = id;
                me.game.add(this.weapon, 4);
                me.game.sort();
            }
        }
    }, countDMG: function(armor) {
        if (this.weapon !== null) {
            console.log(this.attack + " + " + this.weapon.attack + " - " + armor);
            return this.attack + this.weapon.attack - armor;
        } else {
            console.log(this.attack + " - " + armor);
            return this.attack - armor;
        }
    }, syncWeapon: function() {
        if (this.isCurrentAnimation("up")) {
            this.weapon.flipX(false);
            this.weapon.setCurrentAnimation("up");
        } else if (this.isCurrentAnimation("iddle_up")) {
            this.weapon.flipX(false);
            this.weapon.setCurrentAnimation("iddle_up");
        } else if (this.isCurrentAnimation("down")) {
            this.weapon.flipX(false);
            this.weapon.setCurrentAnimation("down");
        } else if (this.isCurrentAnimation("iddle_down")) {
            this.weapon.flipX(false);
            this.weapon.setCurrentAnimation("iddle_down");
        } else if (this.isCurrentAnimation("right")) {
            if (this.flipped) {
                this.weapon.flipX(true);
            } else {
                this.weapon.flipX(false);
            }
            this.weapon.setCurrentAnimation("right");
        } else if (this.isCurrentAnimation("iddle_right")) {
            if (this.flipped) {
                this.weapon.flipX(true);
            } else {
                this.weapon.flipX(false);
            }
            this.weapon.setCurrentAnimation("iddle_right");
        } else if (this.isCurrentAnimation("attack_down")) {
            this.weapon.flipX(false);
            this.weapon.setCurrentAnimation("attack_down");
        } else if (this.isCurrentAnimation("attack_right")) {
            if (this.flipped) {
                this.weapon.flipX(true);
            } else {
                this.weapon.flipX(false);
            }
            this.weapon.setCurrentAnimation("attack_right");
        } else if (this.isCurrentAnimation("attack_up")) {
            this.weapon.flipX(false);
            this.weapon.setCurrentAnimation("attack_up");
        }
    }
});

