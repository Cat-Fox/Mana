
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
    belt_tiles: null,
    selected_tile: null,
    entity_layer: game.guiLayer + 1,
    human_icon: null,
    weapon_icon: null,
    money_icon: null,
    init: function() {
        settings = {};
        settings.spritewidth = 370;
        settings.spriteheight = 190;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);
        //drawing backpack image
        var context = settings.image.getContext("2d");
        context.fillStyle = "#958686";
        context.fillRect(0, 0, settings.spritewidth, settings.spriteheight);
        context.fillStyle = "black";
        context.moveTo(0, 0);
        context.lineWidth = 3;
        context.lineTo(settings.spritewidth, 0);
        context.lineTo(settings.spritewidth, settings.spriteheight);
        context.lineTo(0, settings.spriteheight);
        context.lineTo(0, 0);
        context.stroke();

        context.lineWidth = 1;
        context.strokeStyle = "black";
        context.fillStyle = "black";
        //context.moveTo(180, 145);
        //context.fillRect(140,135,65,16);
        context.strokeRect(140, 125, 16, 16);
        context.strokeRect(140, 125, 16, 16);
        context.strokeRect(140, 125, 16, 16);
        context.strokeRect(140, 125, 65, 16);
        context.strokeRect(140, 125, 65, 16);
        context.strokeRect(140, 125, 65, 16);


        //Texts
        this.font = game.fonts.basic;
        this.bm_font = new me.BitmapFont("geebeeyay-8x8", 8);

        this.font.draw(context, "Inventory", 15 + 135, 5 + 2);
        this.font.draw(context, "Belt", 15 + 135, 147);

        var height = 95;
        this.bm_font.draw(context, "LEVEL", 15, height);
        height = height + 2 + this.bm_font.measureText(context, "HP").height;
        this.font.draw(context, "Experience", 15, height);
        height = height + this.font.measureText(context, "HP").height;
        this.font.draw(context, "HP", 15, height);
        height = height + this.font.measureText(context, "HP").height;
        this.font.draw(context, "Strength", 15, height);
        height = height + this.font.measureText(context, "HP").height;
        this.font.draw(context, "Agility", 15, height);
        height = height + this.font.measureText(context, "HP").height;
        this.font.draw(context, "Endurance", 15, height);
        height = height + this.font.measureText(context, "HP").height;
        this.font.draw(context, "Inteligence", 15, height);
        height = height + this.font.measureText(context, "HP").height;
        this.font.draw(context, "Skill Points", 15, height);

        this.parent(15, 5, settings);
        game.instances.backpack = this;
        this.floating = true;

        var armor = "clotharmor";
        this.human_icon = new game.gui.HumanIcon(60, 23, armor);
        me.game.add(this.human_icon, this.entity_layer);

        this.tiles = new Array(6);
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i] = new Array(5);
        }
        for (var row = 0; row < this.tiles.length; row++) {
            for (var column = 0; column < this.tiles[row].length; column++) {
                this.tiles[row][column] = me.entityPool.newInstanceOf("InventoryTile", this.pos.x + 135 + (column * 16), this.pos.y + 20 + (row * 16), (row * (this.tiles.length - 1)) + column)
                me.game.add(this.tiles[row][column], this.entity_layer);
            }
        }

        this.buttons = [];
        this.buttons.push(new game.DropButton(145 + (16 * 5) + 10, 35, "DROP", "drop an item!"));
        this.buttons.push(new game.EquipButton(145 + (16 * 5) + 10, 50, "EQUIP", "equip an item!"));
        this.buttons.push(new game.UseButton(145 + (16 * 5) + 10, 65, "USE", "use an item!"));
        for (var i = 0; i < this.buttons.length; i++) {
            me.game.add(this.buttons[i], this.entity_layer);
        }
        this.armor_tile = me.entityPool.newInstanceOf("CharacterTile", 30, 75, "armor", null);
        me.game.add(this.armor_tile, this.entity_layer);
        this.weapon_tile = me.entityPool.newInstanceOf("CharacterTile", 70, 75, "weapon", null);
        me.game.add(this.weapon_tile, this.entity_layer);
        this.artefact_tile = me.entityPool.newInstanceOf("CharacterTile", 110, 75, "artefact", null);
        me.game.add(this.artefact_tile, this.entity_layer);



        if (me.gamestat.getItemValue("skill") > 0) {
            this.buttons_add = {};
            var x_pos = this.pos.x + 75;
            this.buttons_add.str = me.entityPool.newInstanceOf("PlusSkillButton", x_pos, 10, "str");
            me.game.add(this.buttons_add.str, this.entity_layer);
            this.buttons_add.agi = me.entityPool.newInstanceOf("PlusSkillButton", x_pos, 10, "agi");
            me.game.add(this.buttons_add.agi, this.entity_layer);
            this.buttons_add.end = me.entityPool.newInstanceOf("PlusSkillButton", x_pos, 10, "end");
            me.game.add(this.buttons_add.end, this.entity_layer);
            this.buttons_add.int = me.entityPool.newInstanceOf("PlusSkillButton", x_pos, 10, "int");
            me.game.add(this.buttons_add.int, this.entity_layer);
        }

        console.log(me.gamestat.getItemValue("inventory"));

        this.money_icon = new game.Icon(this.pos.x + 140, this.pos.y + 128, "money-1");
        me.game.add(this.money_icon, this.entity_layer);

        this.belt_tiles = new Array(8);

        for (var i = 0; i < this.belt_tiles.length; i++) {
            this.belt_tiles[i] = me.entityPool.newInstanceOf("CharacterTile", this.pos.x + 135 + (i * 16), this.pos.y + 160, "belt", i);
            me.game.add(this.belt_tiles[i], this.entity_layer);
        }
        me.game.sort();

        me.input.registerPointerEvent('mouseup', me.game.viewport, this.mouseUp.bind(this));

    }, update: function() {
        if (me.gamestat.getItemValue("skill") === 0 && this.buttons_add !== null) {
            me.game.remove(this.buttons_add.str);
            me.game.remove(this.buttons_add.agi);
            me.game.remove(this.buttons_add.end);
            me.game.remove(this.buttons_add.int);
        }

        var value = me.gamestat.getItemValue("money");
        if (value < 6) {
            this.money_icon.renderable.image = me.loader.getImage("money-1");
        } else if (value < 26) {
            this.money_icon.renderable.image = me.loader.getImage("money-2");
        } else if (value < 101) {
            this.money_icon.renderable.image = me.loader.getImage("money-3");
        } else {
            this.money_icon.renderable.image = me.loader.getImage("money-4");
        }


        this.parent();
        return true;
    }, updateEquip: function() {
        var equip = me.gamestat.getItemValue("equip");
        var armor;
        if (equip.armor === null) {
            armor = "clotharmor";
        } else {
            var equip = me.gamestat.getItemValue("inventory")[me.gamestat.getItemValue("equip").armor];
            armor = equip.attributes.image_name;
        }
        this.human_icon.renderable.image = me.loader.getImage(armor);

        if (me.gamestat.getItemValue("equip").weapon !== null) {
            if (this.weapon !== null) {
                me.game.remove(this.weapon);
                this.weapon = null;
            }
            var weapon = me.gamestat.getItemValue("inventory")[me.gamestat.getItemValue("equip").weapon];
            this.weapon_icon = new game.weapons[weapon.attributes.object_name](this.human_icon.pos.x + weapon.attributes.offset_x, this.human_icon.pos.y + weapon.attributes.offset_y);
            this.weapon_icon.renderable.setCurrentAnimation("iddle_down");
            this.weapon_icon.floating = true;
            me.game.add(this.weapon_icon, this.entity_layer + 1);
            me.game.sort();
        }
    }, draw: function(context) {
        this.parent(context);

        context.fillStyle = "black";
        context.fillRect(57, 20, 40, 40);

        var height = 65;

        this.font.draw(context, "Armor", 22, height);
        this.font.draw(context, "Weapon", 58, height);
        this.font.draw(context, "Artefact", 102, height);

        height = 100;
        x_pos = this.pos.x + 90;
        this.bm_font.draw(context, me.gamestat.getItemValue("level"), x_pos, height);
        height = height + 2 + this.bm_font.measureText(context, "HP").height;
        this.font.draw(context, me.gamestat.getItemValue("exp") + "/" + me.gamestat.getItemValue("next_level"), x_pos, height);
        height = height + this.font.measureText(context, "HP").height;
        this.font.draw(context, me.gamestat.getItemValue("hp") + "/" + me.gamestat.getItemValue("maxhp"), x_pos, height);
        height = height + this.font.measureText(context, "HP").height;
        this.font.draw(context, me.gamestat.getItemValue("str"), x_pos, height);
        if (this.buttons_add !== null) {
            this.buttons_add.str.pos.y = height;
        }
        height = height + this.font.measureText(context, "HP").height;
        this.font.draw(context, me.gamestat.getItemValue("agi"), x_pos, height);
        if (this.buttons_add !== null) {
            this.buttons_add.agi.pos.y = height;
        }
        height = height + this.font.measureText(context, "HP").height;
        this.font.draw(context, me.gamestat.getItemValue("end"), x_pos, height);
        if (this.buttons_add !== null) {
            this.buttons_add.end.pos.y = height;
        }
        height = height + this.font.measureText(context, "HP").height;
        this.font.draw(context, me.gamestat.getItemValue("int"), x_pos, height);
        if (this.buttons_add !== null) {
            this.buttons_add.int.pos.y = height;
        }
        height = height + this.font.measureText(context, "HP").height;
        this.font.draw(context, me.gamestat.getItemValue("skill"), x_pos, height);

        game.fonts.white.draw(context, me.gamestat.getItemValue("money"), this.pos.x + 160, this.pos.y + 128);
    },
    onDestroyEvent: function() {
        me.game.remove(this.human_icon);
        this.human_icon = null;
        me.game.remove(this.money_icon);
        this.money_icon = null;
        if(this.weapon_icon !== null){
            me.game.remove(this.weapon_icon);
            this.weapon_icon = null;
        }

        for (var row = 0; row < this.tiles.length; row++) {
            for (var column = 0; column < this.tiles[row].length; column++) {
                me.game.remove(this.tiles[row][column]);
            }
        }
        for (var i = 0; i < this.buttons.length; i++) {
            me.game.remove(this.buttons[i]);
        }
        this.buttons = null;
        me.game.remove(this.armor_tile);
        this.armor_tile = null;
        me.game.remove(this.weapon_tile);
        this.weapon_tile = null;
        me.game.remove(this.artefact_tile);
        this.artefact_tile = null;

        if (this.buttons_add !== null) {
            me.game.remove(this.buttons_add.str);
            me.game.remove(this.buttons_add.agi);
            me.game.remove(this.buttons_add.end);
            me.game.remove(this.buttons_add.int);
            this.buttons_add = null;
        }

        for (var i = 0; i < this.belt_tiles.length; i++) {
            me.game.remove(this.belt_tiles[i]);
        }
        this.belt_tiles = null;

        this.selected_tile = null;

        me.input.releasePointerEvent('mouseup', me.game.viewport);
        me.input.releasePointerEvent('mousedown', me.game.viewport);
    },
    getTileFromID: function(id) {
        if (id < this.tiles.length - 1) {
            return {row: 0, column: id};
        } else {
            var row = Math.floor(id / (this.tiles.length - 1));
            var column = id - ((this.tiles.length - 1) * row);
            return {row: row, column: column};
        }
    }, mouseUp: function() {
        console.log("mouse-up at " + me.input.mouse.pos.x + " " + me.input.mouse.pos.y);
        if (this.selected_tile !== null) {
            var selected = this.getTileFromID(this.selected_tile);
            //noticed equip first
            this.weapon_tile.iconDown(this.selected_tile);
            this.armor_tile.iconDown(this.selected_tile);
            this.artefact_tile.iconDown(this.selected_tile);

            //then belt
            for (var i = 0; i < this.belt_tiles.length; i++) {
                this.belt_tiles[i].iconDown(this.selected_tile);
            }
            //then tile
            this.tiles[selected.row][selected.column].mouseUp();
        }
    }
});

game.CharacterTile = me.GUI_Object.extend({
    id: null,
    icon: null,
    type: null,
    init: function(x, y, type, id) {
        settings = {};
        settings.image = "inventory_tile";
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        this.parent(x, y, settings);
        this.floating = true;
        this.type = type;
        this.id = id;

        if (this.type !== "belt") {
            if (me.gamestat.getItemValue("equip")[this.type] !== null) {
                this.addIcon(me.gamestat.getItemValue("equip")[this.type]);
            }
        } else {
            if (typeof me.gamestat.getItemValue("belt")[this.id] !== "undefined") {
                this.addIcon(me.gamestat.getItemValue("belt")[this.id]);
            }
        }
    }, onDestroyEvent: function() {
        this.removeIcon();
    }, addIcon: function(id) {
        this.removeIcon();


        if (this.type !== "belt") {
            me.gamestat.getItemValue("equip")[this.type] = id;
            var object = me.gamestat.getItemValue("inventory")[id];
            switch (object.type) {
                case "weapon":
                    me.game.getEntityByGUID(me.gamestat.getItemValue("player")).equipWeapon();
                    break;
                case "armor":
                    me.game.getEntityByGUID(me.gamestat.getItemValue("player")).equipArmor();
                    break;
            }

            this.icon = new game.Icon(this.pos.x, this.pos.y, object.icon_name);

            game.instances.backpack.updateEquip();
        } else {
            if (game.instances.belt.tiles[this.id].icon !== null) {
                me.game.remove(game.instances.belt.tiles[this.id].icon);
                game.instances.belt.tiles[this.id].icon = null;
            }

            me.gamestat.getItemValue("belt")[this.id] = id;
            var object = me.gamestat.getItemValue("inventory")[id];

            this.icon = new game.Icon(this.pos.x, this.pos.y, object.icon_name);

            game.instances.belt.tiles[this.id].icon = new game.Icon(game.instances.belt.tiles[this.id].pos.x - 8, game.instances.belt.tiles[this.id].pos.y - 8, object.icon_name);
            me.game.add(game.instances.belt.tiles[this.id].icon, game.guiLayer + 1);
        }
        me.game.add(this.icon, this.z + 1);
        me.game.sort();
        return true;

    }, removeIcon: function() {
        if (this.icon !== null) {
            me.game.remove(this.icon);
            this.icon = null;
        }

    }, onClick: function() {

    }, iconDown: function(selected_tile) {
        if (this.containsPoint(me.input.mouse.pos.x, me.input.mouse.pos.y)) {
            var object = me.gamestat.getItemValue("inventory")[selected_tile];
            if (object.type === this.type || this.type === "belt") {
                this.addIcon(selected_tile);
            }
        }
    }
});

game.InventoryTile = me.GUI_Object.extend({
    follow_mouse: null,
    id: null,
    icon: null,
    click_timer: 25,
    click_timer_run: null,
    tooltip: null,
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
        this.click_timer_run = 0;
        this.tooltip = null;
        this.follow_mouse = false;
    },
    onDestroyEvent: function() {
        if (this.icon !== null) {
            me.game.remove(this.icon);
            this.icon = null;
        }
        if (this.tooltip !== null) {
            me.game.remove(this.tooltip);
            this.tooltip = null;
        }
    },
    onClick: function() {
        if (this.click_timer_run === 0) {
            this.click_timer_run = me.timer.getTime();
            var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
            var pos = player.backpack_icon.backpack.getTileFromID(this.id);
            //console.log("clicked tile " + this.id + " which is " + pos.row + " " + pos.column);
            if (this.icon !== null) {
                player.backpack_icon.backpack.selected_tile = this.id;
                //this.icon.renderable.setCurrentAnimation("active");
                this.follow_mouse = true;
            }
        } else if (me.timer.getTime() > (this.click_timer + this.click_timer_run)) {
            this.click_timer_run = 0;
        }
    },
    update: function() {
        if (this.icon === null && typeof me.gamestat.getItemValue("inventory")[this.id] !== "undefined") {
            this.icon = me.entityPool.newInstanceOf("Icon", this.pos.x, this.pos.y, me.gamestat.getItemValue("inventory")[this.id].icon_name);
            me.game.add(this.icon, this.z + 2);
            me.game.sort();
        } else if (this.icon !== null && typeof me.gamestat.getItemValue("inventory")[this.id] === "undefined") {
            me.game.remove(this.icon);
            this.icon = null;
            console.log("removing icon");
        }

        if (this.follow_mouse) {
            this.icon.pos.x = me.input.mouse.pos.x;
            this.icon.pos.y = me.input.mouse.pos.y;
        }


        var trigger = false;
        if (me.input.mouse.pos.x >= this.pos.x && me.input.mouse.pos.x <= this.pos.x + this.width) {
            if (me.input.mouse.pos.y >= this.pos.y && me.input.mouse.pos.y <= this.pos.y + this.height) {
                trigger = true;
            }
        }

        if (trigger) {
            this.onMouseOver();
        } else {
            this.onMouseOut();
        }

        this.parent();
        return true;
    },
    onMouseOver: function() {
        if (this.tooltip === null && this.icon !== null) {
            var object = me.gamestat.getItemValue("inventory")[this.id];
            if (object.tooltip_text !== null) {
                this.tooltip = new game.gui.Tooltip(this.pos.x + this.width, this.pos.y, object.tooltip_text);
                me.game.add(this.tooltip, this.z + 1);
                me.game.sort();
            }
        }
    },
    onMouseOut: function() {
        if (this.tooltip !== null) {
            me.game.remove(this.tooltip);
            this.tooltip = null;
        }
    },
    mouseUp: function() {
        this.follow_mouse = false;
        this.icon.pos.x = this.pos.x;
        this.icon.pos.y = this.pos.y;
        var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
        player.backpack_icon.backpack.selected_tile = null;
    }
});

game.ExpBar = me.ObjectEntity.extend({
    percent: null,
    font: null,
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
        context.strokeRect(5, 4, 90, 3);

        this.parent(x, y, settings);
        this.percent = 0;
        this.floating = true;

        this.font = game.fonts.good_green;
    },
    update: function() {
        this.percent = Math.floor((me.gamestat.getItemValue("exp") * 100) / me.gamestat.getItemValue("next_level"));

        var context = this.renderable.image.getContext("2d");
        context.strokeStyle = "#958686";
        context.moveTo(6, 5);
        context.lineTo(6 + 88, 5);
        context.stroke();
        var width = Math.floor(0.9 * this.percent);
        if (width >= 1) {
            context.strokeStyle = "green";
            context.lineWidth = 1;
            context.moveTo(6, 5);
            context.lineTo(6 + width, 5);
            context.stroke();
        }
        context.fillStyle = "#958686";
        context.fillRect(3, 9, 90, 10);
        var size = this.font.measureText(context, me.gamestat.getItemValue("exp") + "/" + me.gamestat.getItemValue("next_level"));
        this.font.draw(context, me.gamestat.getItemValue("exp") + "/" + me.gamestat.getItemValue("next_level"), 50 - (size.width / 2), 9);

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
    outline: null,
    inline: null,
    fill: null,
    init: function(x, y, text, title) {
        this.text = text;
        this.title = title;
        this.font = game.fonts.buttons_font;
        settings = {};
        settings.spritewidth = 45;
        settings.spriteheight = 13;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);

        var context = settings.image.getContext("2d");
        this.parent(x, y, settings);

        this.outline = "black";
        this.inline = "#E26D6D";
        this.fill = "#D83939";
        this.drawContext(context);

        this.floating = true;
    }, update: function() {
        var trigger = false;
        if (me.input.mouse.pos.x >= this.pos.x && me.input.mouse.pos.x <= this.pos.x + this.width) {
            if (me.input.mouse.pos.y >= this.pos.y && me.input.mouse.pos.y <= this.pos.y + this.height) {
                trigger = true;
            }
        }

        if (trigger) {
            this.onHover();
            this.outline = "black";
            this.inline = "black";
            this.fill = "#D83939";

            this.drawContext(this.image.getContext("2d"));

        } else {
            this.onHoverOut();
            this.outline = "black";
            this.inline = "#E26D6D";
            this.fill = "#D83939";

            this.drawContext(this.image.getContext("2d"));
        }
    }, onClick: function() {
    }, onHover: function() {
    }, onHoverOut: function() {
    }, drawContext: function(context) {
        context.clearRect(0, 0, this.width, this.height);
        context.fillStyle = this.fill;
        context.fillRect(1, 1, this.width - 1, this.height - 1);
        context.strokeStyle = this.outline;
        context.globalAlpha = 1;
        context.lineWidth = 1;
        context.moveTo(0, this.height);
        context.lineTo(0, 0);
        context.lineTo(this.width, 0);
        context.stroke();
        context.strokeStyle = this.inline;
        context.moveTo(this.width, 1);
        context.lineTo(this.width, this.height);
        context.lineTo(1, this.height);
        context.stroke();
        this.font.draw(context, this.text, 5, 4);
    }
});

game.SmallButton = me.GUI_Object.extend({
    text: null,
    title: null,
    font: null,
    outline: null,
    inline: null,
    fill: null,
    init: function(x, y, text, title) {
        this.text = text;
        this.title = title;
        this.font = game.fonts.buttons_font;
        settings = {};
        settings.spritewidth = 11;
        settings.spriteheight = 11;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);

        var context = settings.image.getContext("2d");
        this.parent(x, y, settings);

        this.outline = "black";
        this.inline = "#E26D6D";
        this.fill = "#D83939";
        this.drawContext(context);


        this.floating = true;
    }, update: function() {
        var trigger = false;
        if (me.input.mouse.pos.x >= this.pos.x && me.input.mouse.pos.x <= this.pos.x + this.width) {
            if (me.input.mouse.pos.y >= this.pos.y && me.input.mouse.pos.y <= this.pos.y + this.height) {
                trigger = true;
            }
        }

        var context = this.image.getContext("2d");
        if (trigger) {
            this.onHover();
            this.outline = "black";
            this.inline = "black";
            this.fill = "#D83939";

            this.drawContext(this.image.getContext("2d"));

        } else {
            this.onHoverOut();
            this.outline = "black";
            this.inline = "#E26D6D";
            this.fill = "#D83939";

            this.drawContext(this.image.getContext("2d"));
        }
    }, onClick: function() {
    }, onHover: function() {
    }, onHoverOut: function() {
    }, drawContext: function(context) {
        context.clearRect(0, 0, this.width, this.height);
        context.fillStyle = this.fill;
        context.fillRect(1, 1, this.width - 1, this.height - 1);
        context.strokeStyle = this.outline;
        context.globalAlpha = 1;
        context.lineWidth = 1;
        context.moveTo(0, this.height);
        context.lineTo(0, 0);
        context.lineTo(this.width, 0);
        context.stroke();
        context.strokeStyle = this.inline;
        context.moveTo(this.width, 1);
        context.lineTo(this.width, this.height);
        context.lineTo(1, this.height);
        context.stroke();
        this.font.draw(context, this.text, 2, 2);
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
            me.gamestat.getItemValue("inventory").splice(player.backpack_icon.backpack.selected_tile, 1);
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
            var selected = me.gamestat.getItemValue("inventory")[player.backpack_icon.backpack.selected_tile];
            switch (selected.type) {
                case "armor":
                    player.backpack_icon.backpack.armor_tile.addIcon(player.backpack_icon.backpack.selected_tile);
                    break;
                case "weapon":
                    player.backpack_icon.backpack.weapon_tile.addIcon(player.backpack_icon.backpack.selected_tile);
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

game.UseButton = game.Button.extend({
    tooltip: null,
    init: function(x, y, text, title) {
        this.parent(x, y, text, title);
        this.tooltip = null;
    },
    onClick: function() {
        this.parent();
        var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
        if (player.backpack_icon.backpack.selected_tile !== null) {
            console.log("use item on tile " + player.backpack_icon.backpack.selected_tile);
            var selected = me.gamestat.getItemValue("inventory")[player.backpack_icon.backpack.selected_tile];
            switch (selected.type) {
                case "consumable":
                    if (typeof selected.attributes.heal !== "undefined") {
                        player.updateHP(selected.attributes.heal);
                    }
                    me.gamestat.getItemValue("inventory").splice(player.backpack_icon.backpack.selected_tile, 1);
                    break;
                case "default":
                    console.log("nothing");
                    break;
            }
        }
    }
});


game.PlusSkillButton = game.SmallButton.extend({
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

game.gui.TextLine = Object.extend({
    text: null,
    font: null,
    init: function(text, font) {
        this.text = text;
        this.font = font;
    }
});

game.gui.Tooltip = me.ObjectEntity.extend({
    lines: null,
    init: function(x_pos, y_pos, text_lines) {

        //creating context
        settings = {};
        var height = 6;
        for (var i = 0; i < text_lines.length; i++) {
            height += text_lines[i].font.measureText(me.video.getScreenContext(), text_lines[i].text).height;
        }
        settings.spriteheight = height;
        settings.spritewidth = 100;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);

        //drawing to context
        var context = settings.image.getContext("2d");
        context.fillStyle = "#958686";
        context.fillRect(0, 0, settings.spritewidth, settings.spriteheight);
        context.strokeStyle = "black";
        context.strokeRect(0, 0, settings.spritewidth, settings.spriteheight);
        var y = 3;
        for (var i = 0; i < text_lines.length; i++) {
            text_lines[i].font.draw(context, text_lines[i].text, 3, y);
            y += text_lines[i].font.measureText(context, text_lines[i].text).height;
        }
        this.parent(x_pos, y_pos, settings);
        this.lines = text_lines;
        this.floating = true;
        this.renderable.setOpacity(0.85);
        //console.log("creating tooltip " + this.pos.x + " " + this.pos.y);
    }
});

game.gui.HumanIcon = me.ObjectEntity.extend({
    init: function(x, y, image) {
        settings = {};
        settings.spritewidth = 32;
        settings.spriteheight = 32;
        settings.image = image;
        this.parent(x, y, settings);
        this.renderable.addAnimation("inactive", [40, 41], 15);
        this.renderable.setCurrentAnimation("inactive");
        this.floating = true;
    }, update: function() {
        this.parent();
        return true;
    }
});

game.gui.Console = me.ObjectEntity.extend({
    lines: null,
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 0;
        settings.spriteheight = 0;
        this.parent(x, y, settings);
        this.floating = true;

        this.lines = [];
    }, post: function(text) {
        for (var i = 0; i < this.lines.length; i++) {
            this.lines[i].pos.y -= 12;
            console.log(this.lines[i].pos.y);
        }
        var line = new game.gui.ConsoleLine(0, game.screenHeight - 32, text);
        this.lines.push(line);
        me.game.add(line, game.guiLayer);
    }, removeLast: function() {
        me.game.remove(this.lines[0]);
        this.lines.splice(0, 1);
        for (var i = 0; i < this.lines.length; i++) {
            this.lines[i].pos.y += 12;
        }
    }
});

game.instances.console = new game.gui.Console(0, 0);
me.game.add(game.instances.console, game.guiLayer);
me.game.sort();

game.gui.ConsoleLine = me.ObjectEntity.extend({
    timer_run: null,
    timer: 8000,
    text: null,
    init: function(x, y, text) {
        settings = {};
        settings.spritewidth = game.fonts.white.measureText(me.video.getScreenContext(), text).width + 4;
        settings.spriteheight = 12;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);

        var context = settings.image.getContext("2d");
        context.fillStyle = "shadow";
        context.fillRect(0, 0, settings.spritewidth, settings.spriteheight);
        game.fonts.white.draw(context, text, 2, 2);
        this.parent(x, y, settings);
        this.floating = true;
        this.text = text;
        this.timer_run = me.timer.getTime();
        this.renderable.setOpacity(0.50);
    }, update: function() {
        if (me.timer.getTime() > (this.timer + this.timer_run)) {
            me.game.remove(this);
            game.instances.console.removeLast();
        }
    }
});

game.gui.Belt = me.ObjectEntity.extend({
    tiles: null,
    init: function() {
        settings = {};
        settings.spritewidth = 0;
        settings.spriteheight = 0;

        this.parent(100, game.screenHeight - 8, settings);
        this.floating = true;

        this.tiles = new Array(8);
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i] = new game.gui.BeltIcon(this.pos.x + i * 16, this.pos.y);
            me.game.add(this.tiles[i], game.guiLayer);
        }
        me.game.sort();
    }, update: function(){
        for (var i = 0; i < this.tiles.length; i++) {
            if(this.tiles[i].icon !== null && typeof me.gamestat.getItemValue("belt")[i] === "undefined"){
                me.game.remove(this.tiles[i].icon);
                this.tiles[i].icon = null;
            }
        }
        this.parent();
        return true;
    }
});

game.gui.BeltIcon = me.ObjectEntity.extend({
    icon: null,
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 0;
        settings.spriteheight = 0;
        settings.image = "inventory_tile";
        this.parent(x, y, settings);
        this.floating = true;
    }
});