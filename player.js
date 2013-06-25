game.Player = me.ObjectEntity.extend({
    shadow: null,
    inventory: null,
    attacking: false,
    attack_box: null,
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

        //store GUID
        if (me.gamestat.getItemValue("player") === 0) {
            me.gamestat.add("player", this.GUID);
        } else {
            console.log("Player old GUID " + me.gamestat.getItemValue("player") + " New GUID " + this.GUID);
            me.gamestat.setValue("player", this.GUID);
        }
        this.type = "player";
        
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
            if (this.renderable.getCurrentAnimationFrame() === 5) {
                me.game.remove(this);
            } else {
                // update object animation
                this.vel.x = 0;
                this.vel.y = 0;
                this.updateMovement();
                this.parent();
                return true;
            }
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
                this.attacking = false;
            }
        }

        if (me.input.isKeyPressed('attack') && this.attacking === false) {
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
            var addition = me.gamestat.getItemValue("exp") + value - me.gamestat.getItemValue("next_level");
            me.gamestat.updateValue("level", 1);
            me.gamestat.setValue("exp", addition);
            me.gamestat.setValue("next_leve1l", Math.floor(me.gamestat.getItemValue("next_level") + me.gamestat.getItemValue("next_level") * 2.5));
            me.gamestat.updateValue("skill", 5);
            me.audio.play("level_up");
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
        if (me.gamestat.getItemValue("hp") <= 0) {
            //just die already!)
            this.dying = true;
            this.image = me.loader.getImage("death");
            this.spritewidth = 24;
            this.spriteheight = 24;
            this.renderable.addAnimation("death", [0, 1, 2, 3, 4, 5], 8);
            this.renderable.setCurrentAnimation("death");
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
    weapon_icon: null,
    armor_icon: null,
    artefact_icon: null,
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
        this.buttons.push(new game.Button(140 + (16 * 5) + 10, 50, "EQUIP", "equip an item!"));
        this.buttons.push(new game.Button(140 + (16 * 5) + 10, 65, "USE", "equip an item!"));
        for (var i = 0; i < this.buttons.length; i++) {
            me.game.add(this.buttons[i], this.entity_layer);
        }
        this.armor_icon = new game.CharacterTile(36, 130);
        me.game.add(this.armor_icon, this.entity_layer);
        this.weapon_icon = new game.CharacterTile(55, 130);
        me.game.add(this.weapon_icon, this.entity_layer);
        this.artefact_icon = new game.CharacterTile(75, 130);
        me.game.add(this.artefact_icon, this.entity_layer);
        me.game.sort();

        this.font = new me.Font("century gothic", "1em", "black");
        this.bm_font = new me.BitmapFont("geebeeyay-8x8", 8);
    }, update: function() {
        if (me.gamestat.getItemValue("skill") > 0) {
            if (this.buttons_add === null) {
                this.buttons_add = new Array();

            }
        }
        
        this.parent();
        return true;
    }, draw: function(context) {
        this.parent(context);
        var height = 30;
        this.bm_font.draw(context, "LEVEL " + me.gamestat.getItemValue("level"), 36, height);
        height = height + 10 + this.bm_font.measureText(context, "HP").height;
        this.font.draw(context, "Experience " + me.gamestat.getItemValue("exp") + "/" + me.gamestat.getItemValue("next_level"), 36, height);
        height = height + 10 + this.font.measureText(context, "HP").height;
        this.font.draw(context, "HP " + me.gamestat.getItemValue("hp") + "/" + me.gamestat.getItemValue("maxhp"), 36, height);
        height = height + 10 + this.font.measureText(context, "HP").height;
        this.font.draw(context, "Strength " + me.gamestat.getItemValue("str"), 36, height);
        height = height + 10 + this.font.measureText(context, "HP").height;
        this.font.draw(context, "Agility " + me.gamestat.getItemValue("agi"), 36, height);
        height = height + 10 + this.font.measureText(context, "HP").height;
        this.font.draw(context, "Endurance " + me.gamestat.getItemValue("end"), 36, height);
        height = height + 10 + this.font.measureText(context, "HP").height;
        this.font.draw(context, "Inteligence " + me.gamestat.getItemValue("int"), 36, height);
        height = height + 10 + this.font.measureText(context, "HP").height;
        this.font.draw(context, "Skill Points " + me.gamestat.getItemValue("skill"), 36, height);

        this.font.draw(context, "You", 120 + 20, 20 + 5);
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
        me.game.remove(this.armor_icon);
        me.game.remove(this.weapon_icon);
        me.game.remove(this.artefact_icon);
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
        if (this.icon !== null) {
            me.game.remove(this.icon);
        }
    }
});

game.InventoryTile = me.GUI_Object.extend({
    id: null,
    icon: null,
    type: null,
    init: function(x, y, id) {
        //console.log("creating HUD InventoryTile");
        settings = {};
        settings.image = "inventory_tile";
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        this.parent(x, y, settings);
        this.floating = true;
        this.id = id;
        this.isClickable = true;
        this.isPersistent = true;
    }, onDestroyEvent: function() {
        if (this.icon !== null) {
            me.game.remove(this.icon);
            this.icon = null;
        }
    }
    ,
    onClick: function() {
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
    },
    update: function() {
        if (this.icon === null && me.gamestat.getItemValue("inventory")[this.id] !== null) {
            if (me.gamestat.getItemValue("inventory")[this.id] === "item-sword1") {
                this.icon = me.entityPool.newInstanceOf("Icon", this.pos.x, this.pos.y, "item-sword1");
                this.type = "weapon";
                me.game.add(this.icon, 9);
                me.game.sort();
            }
        } else if (this.icon !== null && me.gamestat.getItemValue("inventory")[this.id] === null ){
            me.game.remove(this.icon);
            this.icon = null;
        }
        this.parent(true);
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
            /*context.lineWidth = 1;
            context.moveTo(this.pos.x, this.pos.y + this.height);
            context.lineTo(this.pos.x, this.pos.y);
            context.lineTo(this.pos.x + this.width, this.pos.y);
            context.stroke();
            context.strokeStyle = "#E26D6D";
            context.lineTo(this.pos.x + this.width, this.pos.y + this.height);
            context.lineTo(this.pos.x, this.pos.y + this.height);
            context.stroke();*/
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
    }
});

game.DropButton = game.Button.extend({
    init: function(x, y, text, title) {
        this.parent(x, y, text, title);
    },
    onClick: function() {
        var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
        if (player.backpack_icon.backpack.selected_tile !== null) {
            console.log("drop this shit!");
            me.gamestat.getItemValue("inventory").splice(player.backpack_icon.backpack.selected_tile,1);
            console.log(me.gamestat.getItemValue("inventory"));
        }

    }
});

game.PlusSkillbutton = game.Button.extend({
    skill: null,
    init: function(x, y, skill, title) {
        this.parent(x, y, "+", title);
        this.skill = skill;
    },
    onClick: function() {
        switch (this.skill) {
            case "str":
                me.gamestat.updateValue("str", 1);
                me.gamestat.updateValue("skill", -1);
                break;
            case "end":
                me.gamestat.updateValue("end", 1);
                me.gamestat.updateValue("skill", -1);
                break;
            case "agi":
                me.gamestat.updateValue("agi", 1);
                me.gamestat.updateValue("skill", -1);
                break;
            case "int":
                me.gamestat.updateValue("int", 1);
                me.gamestat.updateValue("skill", -1);
                break;
            default:
        }
    }
});