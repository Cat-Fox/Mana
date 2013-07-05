game.Player = me.ObjectEntity.extend({
    shadow: null,
    inventory: null,
    //attacks
    attacking: false,
    attack_box: null,
    attack_cooldown: 500,
    attack_cooldown_run: null,
    weapon: null,
    weapon_id: null,
    armor: null,
    artefact: null,
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
                    } else if (me.input.isKeyPressed('inventory')) {
                        console.log(me.gamestat.getItemValue("inventory"));
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
                            this.pos.x = this.pos.x + 3;

                        } else {
                            this.pos.x = this.pos.x - 3;
                        }
                    }
                    else {
                        // y axis
                        if (res[i].y < 0) {
                            this.pos.y = this.pos.y + 3;

                        } else {
                            this.pos.y = this.pos.y - 3;
                        }
                    }
                }
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
    }, equipWeapon: function(id) {
        name = me.gamestat.getItemValue("inventory")[id];
        if (this.weapon !== null) {
            // TODO:CHANGE
            //me.game.HUD.updateItemValue("inventory", id);
            me.game.remove(this.weapon);
            this.weapon = null;
        }
        if (this.weapon_id === id) {
            this.weapon_id = null;
        } else {
            if (name === "item-sword1") {
                this.weapon = new game.Sword1(this.pos.x, this.pos.y);
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

game.BackpackIcon = me.GUI_Object.extend({
    backpack: null,
    button_timer: 0,
    timing: false,
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.image = "backpack";
        this.parent(x, y, settings);

        this.floating = true;
    },
    update: function() {
        if (this.timing === true) {
            if (me.timer.getTime() > this.button_timer + 300) {
                this.timing = false;
                this.button_timer = 0;
            }
        } else {
            if (me.input.isKeyPressed("inventory")) {
                this.triggerBackpack();
                this.button_timer = me.timer.getTime();
                this.timing = true;
            }
        }
        this.parent();
    },
    onClick: function() {
        this.triggerBackpack();
    },
    triggerBackpack: function() {
        if (this.backpack === null) {
            this.backpack = me.entityPool.newInstanceOf("Backpack");
            me.game.add(this.backpack, game.guiLayer);
            me.game.sort();
            me.audio.play("itempick2");
        } else {
            me.game.remove(this.backpack);
            this.backpack = null;
            me.audio.play("itempick2");
        }
    }
});

game.Backpack = me.ObjectEntity.extend({
    tiles: null,
    font: null,
    bm_font: null,
    buttons: null,
    buttons_add: null,
    weapon_tile: null,
    armor_tile: null,
    artefact_tile: null,
    selected_tile: null,
    entity_layer: game.guiLayer + 1,
    init: function() {
        settings = {};
        settings.image = me.video.createCanvas(350, 180);
        //drawing backpack image
        var context = settings.image.getContext("2d");
        context.fillStyle = "#958686";
        context.fillRect(0, 0, 350, 170);
        context.fillStyle = "black";
        context.moveTo(0, 0);
        context.lineWidth = 3;
        context.lineTo(350, 0);
        context.lineTo(350, 170);
        context.lineTo(0, 170);
        context.lineTo(0, 0);
        context.stroke();
        settings.spritewidth = 350;
        settings.spriteheight = 170;

        this.parent(15, 15, settings);
        this.floating = true;

        this.tiles = new Array(4);
        for (var i = 0; i < 4; i++) {
            this.tiles[i] = new Array(4);
        }
        for (var row = 0; row < 4; row++) {
            for (var column = 0; column < 4; column++) {
                this.tiles[row][column] = me.entityPool.newInstanceOf("InventoryTile", this.pos.x + 135 + (column * 16), this.pos.y + 15 + (row * 16), (row * 4) + column)
                me.game.add(this.tiles[row][column], this.entity_layer);
            }
        }

        this.buttons = [];
        this.buttons.push(new game.DropButton(140 + (16 * 5) + 10, 35, "DROP", "drop an item!"));
        this.buttons.push(new game.EquipButton(140 + (16 * 5) + 10, 50, "EQUIP", "equip an item!"));
        this.buttons.push(new game.Button(140 + (16 * 5) + 10, 65, "USE", "use an item!"));
        for (var i = 0; i < this.buttons.length; i++) {
            me.game.add(this.buttons[i], this.entity_layer);
        }
        this.armor_tile = me.entityPool.newInstanceOf("CharacterTile", 30, 130);
        me.game.add(this.armor_tile, this.entity_layer);
        this.weapon_tile = me.entityPool.newInstanceOf("CharacterTile", 70, 130);
        me.game.add(this.weapon_tile, this.entity_layer);
        this.artefact_tile = me.entityPool.newInstanceOf("CharacterTile", 110, 130);
        me.game.add(this.artefact_tile, this.entity_layer);

        this.font = new me.Font("century gothic", "1em", "black");
        this.bm_font = new me.BitmapFont("geebeeyay-8x8", 8);

        if (me.gamestat.getItemValue("skill") > 0) {
            if (this.buttons_add === null) {
                this.buttons_add = {};
                this.buttons_add.str = me.entityPool.newInstanceOf("PlusSkillButton", 25, 60, "str");
                me.game.add(this.buttons_add.str, this.entity_layer);
                this.buttons_add.agi = me.entityPool.newInstanceOf("PlusSkillButton", 25, 60, "agi");
                me.game.add(this.buttons_add.agi, this.entity_layer);
                this.buttons_add.end = me.entityPool.newInstanceOf("PlusSkillButton", 25, 60, "end");
                me.game.add(this.buttons_add.end, this.entity_layer);
                this.buttons_add.int = me.entityPool.newInstanceOf("PlusSkillButton", 25, 60, "int");
                me.game.add(this.buttons_add.int, this.entity_layer);
            }
        }
        me.game.sort();
    }, update: function() {
        if (me.gamestat.getItemValue("skill") === 0 && this.buttons_add !== null) {
            me.game.remove(this.buttons_add.str);
            me.game.remove(this.buttons_add.agi);
            me.game.remove(this.buttons_add.end);
            me.game.remove(this.buttons_add.int);
        }
        this.parent();
        return true;
    }, draw: function(context) {
        this.parent(context);
        var height = 30;
        this.bm_font.draw(context, "LEVEL " + me.gamestat.getItemValue("level"), 46, height);
        height = height + 10 + this.bm_font.measureText(context, "HP").height;
        this.font.draw(context, "Experience " + me.gamestat.getItemValue("exp") + "/" + me.gamestat.getItemValue("next_level"), 46, height);
        height = height + 10 + this.font.measureText(context, "HP").height;
        this.font.draw(context, "HP " + me.gamestat.getItemValue("hp") + "/" + me.gamestat.getItemValue("maxhp"), 46, height);
        height = height + 10 + this.font.measureText(context, "HP").height;
        this.font.draw(context, "Strength " + me.gamestat.getItemValue("str"), 46, height);
        if (this.buttons_add !== null) {
            this.buttons_add.str.pos.y = height;
        }
        height = height + 10 + this.font.measureText(context, "HP").height;
        this.font.draw(context, "Agility " + me.gamestat.getItemValue("agi"), 46, height);
        if (this.buttons_add !== null) {
            this.buttons_add.agi.pos.y = height;
        }
        height = height + 10 + this.font.measureText(context, "HP").height;
        this.font.draw(context, "Endurance " + me.gamestat.getItemValue("end"), 46, height);
        if (this.buttons_add !== null) {
            this.buttons_add.end.pos.y = height;
        }
        height = height + 10 + this.font.measureText(context, "HP").height;
        this.font.draw(context, "Inteligence " + me.gamestat.getItemValue("int"), 46, height);
        if (this.buttons_add !== null) {
            this.buttons_add.int.pos.y = height;
        }
        height = height + 10 + this.font.measureText(context, "HP").height;
        this.font.draw(context, "Skill Points " + me.gamestat.getItemValue("skill"), 46, height);

        this.font.draw(context, "You", 130, 20 + 5);
        this.font.draw(context, "Body", 25, 150);
        this.font.draw(context, "Hand", 65, 150);
        this.font.draw(context, "Artefact", 100, 150);
    },
    onDestroyEvent: function() {
        for (var row = 0; row < 4; row++) {
            for (var column = 0; column < 4; column++) {
                me.game.remove(this.tiles[row][column]);
            }
        }
        for (var i = 0; i < this.buttons.length; i++) {
            me.game.remove(this.buttons[i]);
        }
        me.game.remove(this.armor_tile);
        me.game.remove(this.weapon_tile);
        me.game.remove(this.artefact_tile);

        if (this.buttons_add !== null) {
            me.game.remove(this.buttons_add.str);
            me.game.remove(this.buttons_add.agi);
            me.game.remove(this.buttons_add.end);
            me.game.remove(this.buttons_add.int);
        }
        this.selected_tile = null;
    },
    getTileFromID: function(id) {
        if (id < 5) {
            return {row: 0, column: id};
        } else {
            var row = Math.floor(id / 5);
            var column = id - (5 * row);
            return {row: row, column: column};
        }
    }
});

game.CharacterTile = me.GUI_Object.extend({
    icon: null,
    init: function(x, y) {
        settings = {};
        settings.image = "inventory_tile";
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        this.parent(x, y, settings);
        this.floating = true;

    }, onDestroyEvent: function() {
        this.removeIcon;
    }, addIcon: function(icon_name) {
        this.removeIcon;
        console.log(icon_name);
        this.icon = me.entityPool.newInstanceOf("Icon", this.pos.x, this.pox.y, icon_name);
        me.game.add(this.icon, this.z + 1);
        me.game.sort();
    }, removeIcon: function() {
        if (this.icon !== null) {
            me.game.remove(this.icon);
            this.icon = null;
        }
    }, onClick: function() {

    }
});

game.InventoryTile = me.GUI_Object.extend({
    id: null,
    icon: null,
    type: null,
    name: null,
    click_timer: 25,
    click_timer_run: null,
    init: function(x, y, id) {
        settings = {};
        settings.image = "inventory_tile";
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        this.parent(x, y, settings);
        this.floating = true;
        this.id = id;
        this.isClickable = true;
        this.isPersistent = true;
        this.type = "";
        this.name = "";
        this.click_timer_run = 0;
    },
    onDestroyEvent: function() {
        if (this.icon !== null) {
            me.game.remove(this.icon);
            this.icon = null;
        }
    },
    onClick: function() {
        if (this.click_timer_run === 0) {
            this.click_timer_run = me.timer.getTime();
            console.log("clicked tile " + this.id + " this:" + this.type + " gamestat: " + me.gamestat.getItemValue("inventory")[this.id]);
            if (this.icon !== null) {
                var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
                if (player.backpack_icon.backpack.selected_tile === null) {
                    player.backpack_icon.backpack.selected_tile = this.id;
                    this.icon.renderable.setCurrentAnimation("active");
                } else if (player.backpack_icon.backpack.selected_tile === this.id) {
                    player.backpack_icon.backpack.selected_tile = null;
                    this.icon.renderable.setCurrentAnimation("inactive");
                } else {
                    var last_active = player.backpack_icon.backpack.getTileFromID(player.backpack_icon.backpack.selected_tile);
                    player.backpack_icon.backpack.tiles[last_active.row][last_active.column].renderable.setCurrentAnimation("inactive");
                    player.backpack_icon.backpack.selected_tile = this.id;
                    this.icon.renderable.setCurrentAnimation("active");
                }
            }
        } else if (me.timer.getTime() > (this.click_timer + this.click_timer_run)) {
            this.click_timer_run = 0;
        }
    },
    update: function() {
        if (this.icon === null && me.gamestat.getItemValue("inventory")[this.id] !== null) {
            if (me.gamestat.getItemValue("inventory")[this.id] === "item-sword1") {
                this.icon = me.entityPool.newInstanceOf("Icon", this.pos.x, this.pos.y, "item-sword1");
                this.type = "weapon";
                this.name = "item-sword1";
                me.game.add(this.icon, this.z + 1);
                me.game.sort();
            }
        } else if (this.icon !== null && typeof me.gamestat.getItemValue("inventory")[this.id] == "undefined") {
            me.game.remove(this.icon);
            this.icon = null;
            this.type = "";
            this.name = "";
            console.log("removing icon");
        }

        this.parent();
        return true;
    }

});

game.ExpBar = me.ObjectEntity.extend({
    percent: null,
    init: function(x, y) {
        settings = {};
        settings.spriteWidth = 100;
        settings.spriteHeight = 20;
        settings.image = me.video.createCanvas(140, 20);

        var context = settings.image.getContext("2d");
        context.fillStyle = "#958686";
        context.fillRect(0, 0, 100, 20);
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.strokeRect(0, 0, 100, 20);
        context.lineWidth = 1;
        context.strokeRect(5, 8, 90, 3);

        this.parent(x, y, settings);
        this.percent = 0;
        this.floating = true;
    },
    draw: function(context) {
        this.parent(context);
        var width = Math.floor(0.9 * this.percent);
        //FIXME
        /*if (width >= 1) {
         context.strokeStyle = "green";
         context.lineWidth = 1;
         context.moveTo(this.pos.x, this.pos.y);
         context.lineTo(this.pos.x + width, this.pos.y);
         context.stroke();
         }*/
    },
    update: function() {
        this.percent = Math.floor((me.gamestat.getItemValue("exp") * 100) / me.gamestat.getItemValue("next_level"));
        this.parent();
        return true;
    }
});

game.Icon = me.ObjectEntity.extend({
    init: function(x, y, image) {
        console.log("creating Icon");
        settings = {};
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.image = image;
        this.parent(x, y, settings);
        this.floating = true;
        this.renderable.addAnimation("active", [0, 1, 2, 3, 4]);
        this.renderable.addAnimation("inactive", [2]);
        this.renderable.setCurrentAnimation("inactive");
    }
});

game.Button = me.GUI_Object.extend({
    text: null,
    title: null,
    font: null,
    init: function(x, y, text, title) {
        this.text = text;
        this.title = title;
        this.font = new me.Font("century gothic", "0.8em", "black");
        var size = this.font.measureText(me.video.getScreenContext(), text);
        settings = {};
        settings.spritewidth = size.width;
        settings.spriteheight = size.height + 12;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);

        var context = settings.image.getContext("2d");
        context.fillStyle = "#D83939";
        context.fillRect(0, 0, settings.spritewidth, settings.spriteheight);
        context.strokeStyle = "#C02727";
        context.lineWidth = 1;
        context.moveTo(0, settings.spriteheight);
        context.lineTo(0, 0);
        context.lineTo(settings.spritewidth, 0);
        context.stroke();
        context.strokeStyle = "#E26D6D";
        context.lineTo(settings.spritewidth, settings.spriteheight);
        context.lineTo(0, settings.spriteheight);
        context.stroke();
        this.font.draw(context, text, 4, 3);

        this.parent(x, y, settings);
        this.floating = true;
    }, draw: function(context) {
        this.parent(context);
        var trigger = false;
        if (me.input.mouse.pos.x >= this.pos.x && me.input.mouse.pos.x <= this.pos.x + this.width) {
            if (me.input.mouse.pos.y >= this.pos.y && me.input.mouse.pos.y <= this.pos.y + this.height) {
                trigger = true;
            }
        }

        if (trigger) {
            context.fillStyle = "#981F1F";
            context.fillRect(this.pos.x, this.pos.y, this.width, this.height);
            context.strokeStyle = "#C02727";
            this.font.draw(context, this.text, this.pos.x + 4, this.pos.y + 3);
        } else {
            context.clearRect(this.pos.x, this.pos.y, this.width, this.height);
            context.fillStyle = "#white";
            context.fillRect(this.pos.x, this.pos.y, this.width, this.height);
            context.strokeStyle = "#C02727";
            context.lineWidth = 1;
            context.moveTo(this.pos.x + 1, this.pos.y + this.height - 1);
            context.lineTo(this.pos.x + 1, this.pos.y + 1);
            context.lineTo(this.pos.x + this.width - 1, this.pos.y + 1);
            context.stroke();
            context.strokeStyle = "#E26D6D";
            context.lineTo(this.pos.x + this.width - 1, this.pos.y + this.height - 1);
            context.lineTo(this.pos.x + 1, this.pos.y + this.height - 1);
            context.stroke();
            this.font.draw(context, this.text, this.pos.x + 4, this.pos.y + 3);
        }
    }, onClick: function() {
        console.log(this.title);
    }
});

game.DropButton = game.Button.extend({
    init: function(x, y, text, title) {
        this.parent(x, y, text, title);
    },
    onClick: function() {
        this.parent();
        var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
        if (player.backpack_icon.backpack.selected_tile !== null) {
            console.log("drop this shit!");
            me.gamestat.getItemValue("inventory").splice(player.backpack_icon.backpack.selected_tile, 1);
            console.log(me.gamestat.getItemValue("inventory"));
        }

    }
});

game.EquipButton = game.Button.extend({
    init: function(x, y, text, title) {
        this.parent(x, y, text, title);
    },
    onClick: function() {
        this.parent();
        var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
        if (player.backpack_icon.backpack.selected_tile !== null) {
            console.log("equip item on tile " + player.backpack_icon.backpack.selected_tile);
            var selected = player.backpack_icon.backpack.getTileFromID(player.backpack_icon.backpack.selected_tile);
            var selected = player.backpack_icon.backpack.tiles[selected.row][selected.column];
            switch (selected.type) {
                case "armor":
                    break;
                case "weapon":
                    player.backpack_icon.backpack.weapon_tile.addIcon(selected.name);
                    break;
                case "artefact":
                    break;
                case "default":
                    console.log("nothing");
                    break;
            }
        }

    }
});


game.PlusSkillButton = game.Button.extend({
    skill: null,
    init: function(x, y, skill, title) {
        this.parent(x, y, "+", title);
        this.skill = skill;
    },
    onClick: function() {
        var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
        switch (this.skill) {
            case "str":
                player.strUp();
                me.gamestat.updateValue("skill", -1);
                break;
            case "end":
                player.endUp();
                me.gamestat.updateValue("skill", -1);
                break;
            case "agi":
                player.agiUp();
                me.gamestat.updateValue("skill", -1);
                break;
            case "int":
                player.intUp();
                me.gamestat.updateValue("skill", -1);
                break;
            default:
        }
    }
});