game.Player = me.ObjectEntity.extend({
    shadow: null,
    inventory: null,
    //attacks
    attacking: false,
    attack_box: null,
    attack_cooldown: 500,
    attack_cooldown_run: null,
    weapon: null,
    target_box: null,
    use_box: null,
    use_box_timer: null,
    attack: 5,
    flipped: false,
    hp_font: null,
    backpack_icon: null,
    exp_bar: null,
    dying: false,
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS_BOTH);
        console.log("creating player");
        this.renderable.addAnimation("right", [5, 6, 7, 8]);
        this.renderable.addAnimation("up", [20, 21, 22, 23]);
        this.renderable.addAnimation("down", [35, 36, 37, 38]);
        this.renderable.addAnimation("iddle_right", [10, 11], 30);
        this.renderable.addAnimation("iddle_up", [25, 26], 30);
        this.renderable.addAnimation("iddle_down", [40, 41], 30);
        this.renderable.addAnimation("attack_down", [30, 31, 32, 33, 34], 1);
        this.renderable.addAnimation("attack_up", [15, 16, 17, 18, 19], 1);
        this.renderable.addAnimation("attack_right", [0, 1, 2, 3, 4], 1);

        this.setVelocity(1.5, 1.5);
        this.gravity = 0;
        this.updateColRect(10, 12, 5, 22);
        this.renderable.setCurrentAnimation("iddle_down");

        this.attack_cooldown_run = 0;

        //store GUID
        if (me.gamestat.getItemValue("player") === 0) {
            me.gamestat.add("player", this.GUID);
        } else {
            console.log("Player old GUID " + me.gamestat.getItemValue("player") + " New GUID " + this.GUID);
            me.gamestat.setValue("player", this.GUID);
        }
        this.type = "player";

        //creating shadow and GUI
        this.shadow = me.entityPool.newInstanceOf("Shadow", this.pos.x + 8, this.pos.y + 13);
        me.game.add(this.shadow, 4);
        this.target_box = new game.CollisionBox(this.pos.x + 8, this.pos.y + 22, "human_target");
        me.game.add(this.target_box, 4);
        this.backpack_icon = new game.BackpackIcon(0, game.screenHeight - 16);
        me.game.add(this.backpack_icon, game.guiLayer);
        this.exp_bar = new game.ExpBar(game.screenWidth - 30, game.screenHeight - 10);
        me.game.add(this.exp_bar, game.guiLayer);
        me.game.sort();

        this.hp_font = new me.Font("Arial", "1em", "red");
        
        //console.log(me.loader.getBinary("arakis10"));

    },
    draw: function(context) {
        this.parent(context);
        this.hp_font.draw(context, me.gamestat.getItemValue("hp") + "/" + me.gamestat.getItemValue("maxhp"), this.pos.x + 5, this.pos.y + this.renderable.height);
    },
    update: function() {
        if (this.dying) {
            me.game.remove(this);
            var dieText = me.entityPool.newInstanceOf("BigText", "YOU HAVE DIED");
            var deathSmoke = me.entityPool.newInstanceOf("DeathSmoke", this.pos.x + (this.renderable.width / 2), this.pos.y + (this.renderable.height / 2));
            me.game.add(deathSmoke, this.z);
            me.game.add(dieText, game.guiLayer);
            me.game.sort();
        }

        if (me.input.isKeyPressed('f')) {
            this.renderable.image = me.loader.getImage("clotharmor");
        }

        // TODO:CHANGE
        //me.game.HUD.setItemValue("HP", me.gamestat.getItemValue("hp"));
        if (this.use_box !== null) {
            if ((me.timer.getTime() - this.use_box_timer) > 200) {
                this.destroyUse();
            }
        }

        if (this.attacking) {
            if (this.renderable.getCurrentAnimationFrame() === 4) {
                if (this.renderable.isCurrentAnimation("attack_up")) {
                    this.renderable.setCurrentAnimation("iddle_up");
                } else if (this.renderable.isCurrentAnimation("attack_down")) {
                    this.renderable.setCurrentAnimation("iddle_down");
                } else if (this.renderable.isCurrentAnimation("attack_right")) {
                    this.renderable.setCurrentAnimation("iddle_right");
                }

                if (this.attack_box !== null) {
                    me.game.remove(this.attack_box);
                }
            }
            if (me.timer.getTime() > (this.attack_cooldown_run + this.attack_cooldown)) {
                this.attacking = false;

            }
        }

        if (me.input.isKeyPressed('attack') && this.attacking === false) {
            this.attack_cooldown_run = me.timer.getTime();
            this.vel.x = 0;
            this.vel.y = 0;
            this.attacking = true;
            me.audio.play("swing");
            if ((this.renderable.isCurrentAnimation("up") === true) || (this.renderable.isCurrentAnimation("iddle_up") === true)) {
                this.renderable.setCurrentAnimation("attack_up");
                this.createAttack("up");
            } else if ((this.renderable.isCurrentAnimation("down") === true) || (this.renderable.isCurrentAnimation("iddle_down") === true)) {
                this.renderable.setCurrentAnimation("attack_down");
                this.createAttack("down");
            } else if ((this.renderable.isCurrentAnimation("right") === true) || (this.renderable.isCurrentAnimation("iddle_right") === true)) {
                this.renderable.setCurrentAnimation("attack_right");
                this.createAttack("right");
            }
        } else {
            if (this.attacking === false) {
                if (me.input.isKeyPressed('left')) {
                    // flip the sprite on horizontal axis
                    this.renderable.setCurrentAnimation("right");
                    this.flipX(true);
                    this.flipped = true;
                    // update the entity velocity
                    this.vel.x -= this.accel.x * me.timer.tick;
                    this.vel.y = 0;
                } else if (me.input.isKeyPressed('right')) {
                    this.renderable.setCurrentAnimation("right");
                    // unflip the sprite
                    this.flipX(false);
                    this.flipped = false;
                    // update the entity velocity
                    this.vel.x += this.accel.x * me.timer.tick;
                    this.vel.y = 0;
                } else if (me.input.isKeyPressed('up')) {
                    this.renderable.setCurrentAnimation("up");
                    // update the entity velocity
                    this.vel.y -= this.accel.y * me.timer.tick;
                    this.vel.x = 0;
                } else if (me.input.isKeyPressed('down')) {
                    this.renderable.setCurrentAnimation("down");
                    // unflip the sprite
                    this.renderable.flipX(false);
                    this.renderable.flipped = false;
                    // update the entity velocity
                    this.vel.y += this.accel.y * me.timer.tick;
                    this.vel.x = 0;
                } else {
                    if (me.input.isKeyPressed('use')) {
                        this.createUse();
                    }
                    this.vel.x = 0;
                    this.vel.y = 0;
                    if (this.renderable.isCurrentAnimation('right')) {
                        this.renderable.setCurrentAnimation('iddle_right');
                    } else if (this.renderable.isCurrentAnimation('up')) {
                        this.renderable.setCurrentAnimation('iddle_up');
                    } else if (this.renderable.isCurrentAnimation('down')) {
                        this.renderable.setCurrentAnimation('iddle_down');
                    }
                }
            }
        }


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
                            this.pos.x = this.pos.x - this.accel.y;
                        }
                    }
                    else {
                        // y axis
                        if (res[i].y < 0) {
                            this.pos.y = this.pos.y + this.accel.x;

                        } else {
                            this.pos.y = this.pos.y - this.accel.y;
                        }
                    }
                }
            }
        }

        // check & update player movement
        this.updateMovement();
        this.shadow.pos.x = this.pos.x + 8;
        this.shadow.pos.y = this.pos.y + 13;
        this.updateTargetBox();
        if (this.weapon !== null) {
            var weapon = me.gamestat.getItemValue("inventory")[me.gamestat.getItemValue("equip").weapon];
            this.weapon.pos.x = this.pos.x + weapon.attributes.offset_x;
            this.weapon.pos.y = this.pos.y + weapon.attributes.offset_y;
            this.syncWeapon();
        }

        // update object animation
        this.parent();
        
        
        return true;
    },
    onDestroyEvent: function() {
        me.game.remove(this.shadow);
        me.game.remove(this.target_box);
    },
    updateHP: function(value) {
        if (me.gamestat.getItemValue("hp") + value > me.gamestat.getItemValue("maxhp")) {
            me.gamestat.setValue("hp", me.gamestat.getItemValue("maxhp"));
        } else {
            me.gamestat.updateValue("hp", value);
        }
    },
    updateEXP: function(value) {
        if (me.gamestat.getItemValue("exp") + value >= me.gamestat.getItemValue("next_level")) {
            //NEXT LEVEL
            this.levelUp(value);
        } else {
            me.gamestat.updateValue("exp", value);
        }
    },
    createAttack: function(direction) {
        if (direction === "up") {
            //top
            this.attack_box = new game.CollisionBox(this.pos.x + 10, this.pos.y - 16 + 8, "human_attack");
        } else if (direction === "down") {//down
            this.attack_box = new game.CollisionBox(this.pos.x + 8, this.pos.y + 22 + 2, "human_attack");
        } else if (direction === "right") {//right
            if (this.renderable.lastflipX) {
                this.attack_box = new game.CollisionBox(this.pos.x + 10 - 16, this.pos.y + 8, "human_attack");
            } else {
                this.attack_box = new game.CollisionBox(this.pos.x + 10 + 12, this.pos.y + 8, "human_attack");
            }
        }
        me.game.add(this.attack_box, 4);
        me.game.sort();

    }, destroyAttack: function() {
        me.game.remove(this.attack_box);
        this.attack_box = null;
        this.use_box_timer = null;
    }, destroyUse: function() {
        me.game.remove(this.use_box);
        this.use_box = null;
        this.use_box_timer = me.timer.getTime();
    }, updateTargetBox: function() {
        if ((this.renderable.isCurrentAnimation("up") === true) || (this.renderable.isCurrentAnimation("iddle_up") === true)) {
            this.target_box.pos.x = this.pos.x + 10;
            this.target_box.pos.y = this.pos.y - 16 + 8;
        } else if ((this.renderable.isCurrentAnimation("down") === true) || (this.renderable.isCurrentAnimation("iddle_down") === true)) {
            this.target_box.pos.x = this.pos.x + 8;
            this.target_box.pos.y = this.pos.y + 22 + 2;
        } else if ((this.renderable.isCurrentAnimation("right") === true) || (this.renderable.isCurrentAnimation("iddle_right") === true)) {
            if (this.renderable.lastflipX) {
                this.target_box.pos.x = this.pos.x + 10 - 16;
                this.target_box.pos.y = this.pos.y + 8;
            } else {
                this.target_box.pos.x = this.pos.x + 10 + 12;
                this.target_box.pos.y = this.pos.y + 8;
            }
        }
    }, createUse: function() {
        if (this.use_box === null) {
            this.use_box = me.entityPool.newInstanceOf("CollisionBox", this.target_box.pos.x, this.target_box.pos.y, "human_use");
            me.game.add(this.use_box, 5);
            me.game.sort();
        }
    }, hurt: function(damage) {
        this.updateHP(-damage);
        this.hit_text = me.entityPool.newInstanceOf("HitText", this.pos.x + (this.renderable.width / 2), this.pos.y + (this.renderable.height / 2), damage, "Arial", "1em", "red");
        me.game.add(this.hit_text, this.z + 1);
        me.game.sort();
        if (me.gamestat.getItemValue("hp") <= 0) {
            //just die already!)
            this.dying = true;
        } else {
            this.renderable.flicker(20);
        }
    }, equipWeapon: function() {
        if (this.weapon !== null) {
            me.game.remove(this.weapon);
            this.weapon = null;
        }
        var weapon = me.gamestat.getItemValue("inventory")[me.gamestat.getItemValue("equip").weapon];
        this.weapon = new game.weapons[weapon.attributes.object_name](this.pos.x + weapon.attributes.offset_x, this.pos.y + weapon.attributes.offset_y);
        me.game.add(this.weapon, this.z + 1);
        me.game.sort();
    }, countDMG: function(armor) {
        var weapon = me.gamestat.getItemValue("inventory")[me.gamestat.getItemValue("equip").weapon];
        if (this.weapon !== null) {
            console.log(this.attack + " + " + weapon.attributes.dmg + " - " + armor);
            return this.attack + weapon.attributes.dmg - armor;
        } else {
            console.log(this.attack + " - " + armor);
            return this.attack - armor;
        }
    }, syncWeapon: function() {
        if (this.renderable.isCurrentAnimation("up")) {
            this.weapon.renderable.flipX(false);
            this.weapon.renderable.setCurrentAnimation("up");
        } else if (this.renderable.isCurrentAnimation("iddle_up")) {
            this.weapon.renderable.flipX(false);
            this.weapon.renderable.setCurrentAnimation("iddle_up");
        } else if (this.renderable.isCurrentAnimation("down")) {
            this.weapon.renderable.flipX(false);
            this.weapon.renderable.setCurrentAnimation("down");
        } else if (this.renderable.isCurrentAnimation("iddle_down")) {
            this.weapon.renderable.flipX(false);
            this.weapon.renderable.setCurrentAnimation("iddle_down");
        } else if (this.renderable.isCurrentAnimation("right")) {
            if (this.flipped) {
                this.weapon.renderable.flipX(true);
            } else {
                this.weapon.renderable.flipX(false);
            }
            this.weapon.renderable.setCurrentAnimation("right");
        } else if (this.renderable.isCurrentAnimation("iddle_right")) {
            if (this.flipped) {
                this.weapon.renderable.flipX(true);
            } else {
                this.weapon.renderable.flipX(false);
            }
            this.weapon.renderable.setCurrentAnimation("iddle_right");
        } else if (this.renderable.isCurrentAnimation("attack_down")) {
            this.weapon.renderable.flipX(false);
            this.weapon.renderable.setCurrentAnimation("attack_down");
        } else if (this.renderable.isCurrentAnimation("attack_right")) {
            if (this.flipped) {
                this.weapon.renderable.flipX(true);
            } else {
                this.weapon.renderable.flipX(false);
            }
            this.weapon.renderable.setCurrentAnimation("attack_right");
        } else if (this.renderable.isCurrentAnimation("attack_up")) {
            this.weapon.renderable.flipX(false);
            this.weapon.renderable.setCurrentAnimation("attack_up");
        }
    },
    levelUp: function(value) {
        var addition = me.gamestat.getItemValue("exp") + value - me.gamestat.getItemValue("next_level");
        me.gamestat.updateValue("level", 1);
        me.gamestat.setValue("exp", addition);
        var next_level = Math.floor(me.gamestat.getItemValue("next_level") + me.gamestat.getItemValue("next_level") * 2.5);
        me.gamestat.setValue("next_level", next_level);
        me.gamestat.updateValue("skill", 5);
        me.audio.play("level_up");
        var bigText = me.entityPool.newInstanceOf("BigText", "YOU HAVE REACHED LEVEL " + me.gamestat.getItemValue("level"));
        me.game.add(bigText, game.guiLayer);
        me.game.sort();
    },
    strUp: function() {
        me.gamestat.updateValue("str", 1);
    },
    agiUp: function() {
        me.gamestat.updateValue("agi", 1);
    },
    endUp: function() {
        me.gamestat.updateValue("end", 1);
    },
    intUp: function() {
        me.gamestat.updateValue("int", 1);
    }
});
