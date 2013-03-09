var Player = me.ObjectEntity.extend({
    shadow: null,
    inventory: null,
    attacking: false,
    invicible_timer: 0,
    invicible: false,
    attack_box: null,
    target_box: null,
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
        me.gamestat.add("player", this.GUID);

        //set HP (which is already set)
        //this.updateHP(50);

        this.shadow = new Shadow(this.pos.x + 8, this.pos.y + 13);
        me.game.add(this.shadow, 4);
        //this.inventory = new InventoryTiles(400 - 80, 220 - 80);
        //me.game.add(this.inventory, 4);
        this.target_box = new CollisionBox(this.pos.x + 8, this.pos.y + 22, "human_target");
        me.game.add(this.target_box, 4);
        me.game.sort();

    },
    update: function() {
        me.game.HUD.setItemValue("HP", me.gamestat.getItemValue("hp"));

        if ((me.timer.getTime() - this.invicible_timer) > 3000) {
            this.invicible = false;
            this.invicible_timer = 0;
        }

        if (this.attacking) {
            if (this.getCurrentAnimationFrame() === 19) {
                this.setCurrentAnimation("iddle_up");
                console.log("stop attack");
                this.attacking = false;
                if (this.attack_box !== null) {
                    me.game.remove(this.attack_box);
                }
                this.attacking = false;
            } else if (this.getCurrentAnimationFrame() === 34) {
                this.setCurrentAnimation("iddle_down");
                console.log("stop attack");
                this.attacking = false;
                if (this.attack_box !== null) {
                    me.game.remove(this.attack_box);
                }
                this.attacking = false;
            } else if (this.getCurrentAnimationFrame() === 4) {
                this.setCurrentAnimation("iddle_right");
                console.log("stop attack");
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
                console.log("a_up");
            } else if ((this.isCurrentAnimation("down") === true) || (this.isCurrentAnimation("iddle_down") === true)) {
                this.setCurrentAnimation("attack_down");
                this.createAttack("down");
                console.log("a_down");
            } else if ((this.isCurrentAnimation("right") === true) || (this.isCurrentAnimation("iddle_right") === true)) {
                this.setCurrentAnimation("attack_right");
                this.createAttack("right");
                console.log("a_right");
            }
        } else {
            if (this.attacking === false) {
                if (me.input.isKeyPressed('left')) {
                    // flip the sprite on horizontal axis
                    this.setCurrentAnimation("right");
                    this.flipX(true);
                    // update the entity velocity
                    this.vel.x -= this.accel.x * me.timer.tick;
                    this.vel.y = 0;
                } else if (me.input.isKeyPressed('right')) {
                    this.setCurrentAnimation("right");
                    // unflip the sprite
                    this.flipX(false);
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
                    // update the entity velocity
                    this.vel.y += this.accel.y * me.timer.tick;
                    this.vel.x = 0;
                } else {
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
                        this.vel.x = -this.vel.x;
                        this.vel.y = 0;
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
            if ((res.obj.type === "fire" || res.obj.type === "cold") && this.invicible === false) {
                //ouch this hurts
                this.updateHP(-10);
                this.flicker(120);
                this.invicible_timer = me.timer.getTime();
                this.invicible = true;
            }
        }

        // check & update player movement
        this.updateMovement();
        this.shadow.pos.x = this.pos.x + 8;
        this.shadow.pos.y = this.pos.y + 13;
        this.updateTargetBox();

        // update object animation
        this.parent();
        return true;
    },
    updateHP: function(value) {
        console.log(me.gamestat.getItemValue("hp"));
        me.gamestat.updateValue("hp", value);
        console.log(me.gamestat.getItemValue("hp"));
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
    }
});

