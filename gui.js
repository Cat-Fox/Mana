
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
        game.mechanic.trigger_inventory();
    }
});

game.Backpack = me.ObjectEntity.extend({
    tiles: null,
    font: null,
    bm_font: null,
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
    drop_tile: null,
    money_tab: null,
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
                this.tiles[row][column] = me.entityPool.newInstanceOf("InventoryTile", this.pos.x + 135 + (column * 16), this.pos.y + 20 + (row * 16), (row * (this.tiles.length - 1)) + column, "inventory");
                me.game.add(this.tiles[row][column], this.entity_layer);
            }
        }

        this.drop_tile = new game.gui.DropItem(this.pos.x + 225, this.pos.y + 20);
        me.game.add(this.drop_tile, this.entity_layer);

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

        this.belt_tiles = new Array(8);

        for (var i = 0; i < this.belt_tiles.length; i++) {
            this.belt_tiles[i] = me.entityPool.newInstanceOf("CharacterTile", this.pos.x + 135 + (i * 16), this.pos.y + 160, "belt", i);
            me.game.add(this.belt_tiles[i], this.entity_layer);
        }

        this.money_tab = new game.gui.MoneyTab(this.pos.x + 140, this.pos.y + 125);
        me.game.add(this.money_tab, this.entity_layer);
        me.game.sort();

        me.input.registerPointerEvent('mouseup', me.game.viewport, this.mouseUp.bind(this));
    }, update: function() {
        if (me.gamestat.getItemValue("skill") === 0 && this.buttons_add !== null) {
            me.game.remove(this.buttons_add.str);
            me.game.remove(this.buttons_add.agi);
            me.game.remove(this.buttons_add.end);
            me.game.remove(this.buttons_add.int);
        }

        this.money_tab.onUpdate(me.gamestat.getItemValue("money"));

        this.parent();
        return true;
    }, updateEquip: function() {
        var equip = me.gamestat.getItemValue("equip");
        var armor;
        if (equip.armor === null) {
            armor = "clotharmor";
        } else {
            var equip = game.mechanic.get_inventory_item(me.gamestat.getItemValue("equip").armor);
            armor = equip.attributes.image_name;
        }
        this.human_icon.renderable.image = me.loader.getImage(armor);

        if (me.gamestat.getItemValue("equip").weapon !== null) {
            if (this.weapon !== null) {
                me.game.remove(this.weapon);
                this.weapon = null;
            }
            var weapon = game.mechanic.get_inventory_item(me.gamestat.getItemValue("equip").weapon);
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
        var x_pos = this.pos.x + 90;
        this.bm_font.draw(context, me.gamestat.getItemValue("level"), x_pos, height);
        height = height + 2 + this.bm_font.measureText(context, "HP").height;
        this.font.draw(context, me.gamestat.getItemValue("exp") + "/" + me.gamestat.getItemValue("next_level"), x_pos, height);
        height = height + this.font.measureText(context, "HP").height;
        this.font.draw(context, me.gamestat.getItemValue("hp") + "/" + me.gamestat.getItemValue("maxhp"), x_pos, height);
        height = height + this.font.measureText(context, "HP").height;
        this.font.draw(context, me.gamestat.getItemValue("stats").str, x_pos, height);
        if (this.buttons_add !== null) {
            this.buttons_add.str.pos.y = height;
        }
        height = height + this.font.measureText(context, "HP").height;
        this.font.draw(context, me.gamestat.getItemValue("stats").agi, x_pos, height);
        if (this.buttons_add !== null) {
            this.buttons_add.agi.pos.y = height;
        }
        height = height + this.font.measureText(context, "HP").height;
        this.font.draw(context, me.gamestat.getItemValue("stats").end, x_pos, height);
        if (this.buttons_add !== null) {
            this.buttons_add.end.pos.y = height;
        }
        height = height + this.font.measureText(context, "HP").height;
        this.font.draw(context, me.gamestat.getItemValue("stats").int, x_pos, height);
        if (this.buttons_add !== null) {
            this.buttons_add.int.pos.y = height;
        }
        height = height + this.font.measureText(context, "HP").height;
        this.font.draw(context, me.gamestat.getItemValue("skill"), x_pos, height);
    },
    onDestroyEvent: function() {
        me.game.remove(this.human_icon);
        this.human_icon = null;
        me.game.remove(this.money_tab);
        this.money_tab = null;
        if (this.weapon_icon !== null) {
            me.game.remove(this.weapon_icon);
            this.weapon_icon = null;
        }

        for (var row = 0; row < this.tiles.length; row++) {
            for (var column = 0; column < this.tiles[row].length; column++) {
                me.game.remove(this.tiles[row][column]);
            }
        }

        me.game.remove(this.drop_tile);
        this.drop_tile = null;

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

            //then drop tile
            this.drop_tile.mouseUp(this.selected_tile);

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
    }
    , removeItem: function() {
        this.removeIcon();
        if (this.type !== "belt") {
            switch (this.type) {
                case "weapon":
                    me.game.getEntityByGUID(me.gamestat.getItemValue("player")).equipWeapon();
                    break;
                case "armor":
                    me.game.getEntityByGUID(me.gamestat.getItemValue("player")).equipArmor();
                    break;
            }
        } else {

        }
    }, onDestroyEvent: function() {
        this.removeIcon();
    }, addIcon: function(guid) {
        this.removeIcon();

        var object = game.mechanic.get_inventory_item(guid);
        if (this.type !== "belt") {
            me.gamestat.getItemValue("equip")[this.type] = guid;

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

            me.gamestat.getItemValue("belt")[this.id] = guid;

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
                this.addIcon(object.guid);
            }
        }
    }
});

game.InventoryTile = me.GUI_Object.extend({
    follow_mouse: null,
    id: null,
    icon: null,
    icon_name: null,
    click_timer: 25,
    click_timer_run: null,
    tooltip: null,
    tile_type: null,
    init: function(x, y, id, tile_type) {
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
        this.icon_name = null;
        this.tile_type = tile_type;
    },
    onDestroyEvent: function() {
        this.parent();
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
            if (this.icon !== null) {
                console.log(game.instances.backpack);
                console.log(game.instances.stash);
                if (game.instances.backpack !== null) {
                    game.instances.backpack.selected_tile = this.id;
                    console.log("backpack is open");
                } else if (game.instances.stash !== null) {
                    game.instances.stash.selected_tile = this.id;
                    game.instances.stash.selected_type = this.tile_type;
                    console.log("stash is open " + this.id + " " + this.tile_type);
                }
                this.follow_mouse = true;
            }
        } else if (me.timer.getTime() > (this.click_timer + this.click_timer_run)) {
            this.click_timer_run = 0;
        }
    },
    update: function() {
        var container = me.gamestat.getItemValue(this.tile_type);
        if (this.icon === null && container[this.id] !== null) {
            this.icon_name = container[this.id].icon_name;
            this.icon = me.entityPool.newInstanceOf("Icon", this.pos.x, this.pos.y, this.icon_name);
            me.game.add(this.icon, this.z + 2);
            me.game.sort();
        } else if (this.icon !== null && container[this.id] === null) {
            me.game.remove(this.icon);
            this.icon = null;
            this.icon_name = null;
        } else if (container[this.id] !== null && this.icon_name !== container[this.id].icon_name) {
            this.icon_name = container[this.id].icon_name;
            this.icon.renderable.image = me.loader.getImage(this.icon_name);
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
            var object = me.gamestat.getItemValue(this.tile_type)[this.id];
            if (object.tooltip_text !== null) {
                this.tooltip = new game.gui.Tooltip(this.pos.x + this.width, this.pos.y, object.tooltip_text);
                me.game.add(this.tooltip, this.z + 2);
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
        if (game.instances.backpack !== null) {
            this.follow_mouse = false;
            this.icon.pos.x = this.pos.x;
            this.icon.pos.y = this.pos.y;
            game.instances.backpack.selected_tile = null;
        } else if (game.instances.stash !== null) {
            this.follow_mouse = false;
            this.icon.pos.x = this.pos.x;
            this.icon.pos.y = this.pos.y;
            game.instances.stash.selected_tile = null;
            game.instances.stash.selected_type = null;
        }
    }
});

game.ExpBar = me.ObjectEntity.extend({
    percent: null,
    font: null,
    subscribe: null,
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
        this.subscribe = me.event.subscribe("/player/exp", function(a) {
            game.instances.exp_bar.onUpdate(a);
        });
    }, onUpdate: function(exp) {
        this.percent = Math.floor((100 / me.gamestat.getItemValue("next_level")) * exp);
        console.log(this.percent);
        var context = this.renderable.image.getContext("2d");
        context.strokeStyle = "#958686";
        context.moveTo(6,5);
        context.lineTo(6 + 88, 5);
        context.stroke();
        var width = Math.floor(0.88 * this.percent);
        if (width >= 1) {
            context.strokeStyle = "green";
            context.lineWidth = 1;
            context.moveTo(6, 5);
            context.lineTo(6 + width, 5);
            console.log(6 + width);
            context.stroke();
        }
        context.fillStyle = "#958686";
        context.fillRect(3, 9, 90, 10);
        var size = this.font.measureText(context, exp + "/" + me.gamestat.getItemValue("next_level"));
        this.font.draw(context, exp + "/" + me.gamestat.getItemValue("next_level"), 50 - (size.width / 2), 9);
    },
    onDestroyEvent: function() {
        me.event.unsubscribe(this.subscribe);
    }
});

game.Icon = me.ObjectEntity.extend({
    init: function(x, y, image) {
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
        settings.spritewidth = 75;
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
        if (game.instances.backpack.selected_tile !== null) {
            me.gamestat.getItemValue("inventory").splice(game.instances.backpack.selected_tile, 1);
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
        if (game.instances.backpack.selected_tile !== null) {
            console.log("use item on tile " + game.instances.backpack.selected_tile);
            var selected = me.gamestat.getItemValue("inventory")[game.instances.backpack.selected_tile];
            switch (selected.type) {
                case "consumable":
                    if (typeof selected.attributes.heal !== "undefined") {
                        player.updateHP(selected.attributes.heal);
                    }
                    me.gamestat.getItemValue("inventory").splice(game.instances.backpack.selected_tile, 1);
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
    },
    setValue: function(value) {
        this.text.replace("<value>", value);
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
        settings.spritewidth = 140;
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
        this.renderable.addAnimation("inactive", [40, 41], 30);
        this.renderable.setCurrentAnimation("inactive");
        this.floating = true;
    }
});

game.gui.NPCIcon = me.ObjectEntity.extend({
    init: function(x, y, image, size, anim_length) {
        settings = {};
        settings.spritewidth = size;
        settings.spriteheight = size;
        settings.image = image;
        this.parent(x, y, settings);
        var animation = [];
        for (var i = 0; i < anim_length; i++) {
            animation.push(i);
        }
        this.renderable.addAnimation("inactive", animation, 15);
        this.renderable.setCurrentAnimation("inactive");
        this.floating = true;
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
        }
        console.log(text);
        var line = new game.gui.ConsoleLine(0, game.screenHeight - 32, text);
        this.lines.push(line);
        me.game.add(line, game.guiLayer);
        me.game.sort();
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
    }, update: function() {
        for (var i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].icon !== null && typeof me.gamestat.getItemValue("belt")[i] === "undefined") {
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

game.gui.PauseMenu = me.ObjectEntity.extend({
    buttons: null,
    init: function() {
        settings = {};
        settings.spritewidth = 125;
        settings.spriteheight = 50;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);

        var context = settings.image.getContext("2d");
        context.fillStyle = "#958686";
        context.strokeStyle = "black";
        context.lineWidth = 2;

        context.fillRect(0, 0, settings.spritewidth, settings.spriteheight);
        context.strokeRect(0, 0, settings.spritewidth, settings.spriteheight);

        this.parent((game.screenWidth - settings.spritewidth) / 2, (game.screenHeight - settings.spriteheight) / 2, settings);
        this.floating = true;

        this.buttons = {};
        this.buttons.save = new game.gui.SaveButton(this.pos.x + (this.renderable.width / 2) - 40, this.pos.y + 10);
        me.game.add(this.buttons.save, game.guiLayer + 2);
        me.game.sort();
    },
    onDestroyEvent: function() {
        me.game.remove(this.buttons.save);
        this.buttons = null;
    }
});

game.instances.pause_menu = null;

game.gui.SaveButton = game.Button.extend({
    init: function(x, y) {
        this.parent(x, y, "Save Hero", "title");
        this.floating = true;
    },
    onClick: function() {
        this.parent();
        localStorage.level = me.gamestat.getItemValue("level");
        localStorage.next_level = me.gamestat.getItemValue("next_level");
        localStorage.hp = me.gamestat.getItemValue("hp");
        localStorage.max_hp = me.gamestat.getItemValue("maxhp");
        localStorage.exp = me.gamestat.getItemValue("exp");
        localStorage.stats = JSON.stringify(me.gamestat.getItemValue("stats"));
        localStorage.equip = JSON.stringify(me.gamestat.getItemValue("equip"));
        localStorage.inventory = JSON.stringify(me.gamestat.getItemValue("inventory"));
        localStorage.belt = JSON.stringify(me.gamestat.getItemValue("belt"));
        localStorage.skill_points = me.gamestat.getItemValue("skill");
        localStorage.save = true;
        console.log("save");
        game.instances.console.post("Hero has been saved");
    }
});


game.gui.DropItem = me.GUI_Object.extend({
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 48;
        settings.spriteheight = 48;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);

        var context = settings.image.getContext("2d");
        context.strokeStyle = "black";
        context.strokeRect(0, 0, settings.spritewidth, settings.spriteheight);
        game.fonts.basic.draw(context, "DROP", 10, 20);

        this.parent(x, y, settings);
        this.floating = true;
        console.log(this);
    },
    mouseUp: function(selected) {
        if (this.containsPointV(me.input.mouse.pos)) {
            var guid = me.gamestat.getItemValue("inventory")[selected].guid;

            me.gamestat.getItemValue("inventory")[selected] = null;

            //now clean this shit sort, equip and belt
            game.mechanic.inventory_sort();
            var equip = me.gamestat.getItemValue("equip");
            console.log(equip);
            if (equip.weapon === guid) {
                console.log("removig equiped weapon")
                equip.weapon = null;
                game.instances.backpack.weapon_tile.removeItem();
                me.game.remove(game.instances.backpack.weapon_icon);
                game.instances.backpack.weapon_icon = null;
            } else if (equip.armor === guid) {
                equip.armor = null;
                game.instances.backpack.armor_tile.removeItem();
                game.instances.backpack.human_icon.renderable.image = me.loader.getImage("clotharmor");
            } else if (equip.artefact === guid) {
                equip.artefact = null;
                game.instances.backpack.artefact_tile.removeItem();
            }
            var belt = me.gamestat.getItemValue("belt");
            for (var i = 0; i < belt.length; i++) {
                if (belt[i] === guid) {
                    belt[i] = null;
                }
            }
        }
    }
});

game.gui.Credits = me.ObjectEntity.extend({
    init: function(x, y) {
        settings = {};
        settings.spritewidth = game.screenWidth;
        settings.spriteheight = 1000;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);

        var font = new me.BitmapFont("geebeeyay-8x8", 8, 1.0);
        var context = settings.image.getContext("2d");

        context.fillStyle = "black";
        context.fillRect(0, 0, settings.spritewidth, settings.spriteheight);

        game.fonts.loading.draw(context, "MANA", (game.screenWidth - 60) / 2, 70);
        game.fonts.white.draw(context, "The Adventure full of bugs", (game.screenWidth - 80) / 2, 105);

        var height = font.measureText(context, "M").height;
        var total_height = 120;
        font.draw(context, "PROGRAMMING - ZARAKA", 50, total_height);
        total_height += height;
        font.draw(context, "MELONJS GAME ENGINE", 50, total_height);
        total_height += height;
        total_height += height;
        font.draw(context, "TILESETS", 50, total_height);
        total_height += height;
        font.draw(context, "MOZZILA BROWSERQUEST", 50, total_height);
        total_height += height;
        font.draw(context, "OPENGAMEART.ORG", 50, total_height);
        total_height += height;
        font.draw(context, "ADDITIONAL ART - VOX", 50, total_height);
        total_height += height;
        total_height += height;
        font.draw(context, "HELP WANTED! CAN YOU CREATE GAME?", 50, total_height);
        this.parent(x, y, settings);
        this.setVelocity(0.1, -0.1);
    }, update: function() {
        this.vel.y += this.accel.y * me.timer.tick;
        this.updateMovement();
        this.parent();
        return true;
    }
});

game.gui.Dialog = me.ObjectEntity.extend({
    dialog: null,
    branch: null,
    message: null,
    human_icon: null,
    text_object: null,
    human_test: null,
    guid: null,
    init: function(dialog, guid) {
        this.dialog = me.loader.getJSON(dialog);
        this.branch = 0;
        this.message = 0;
        this.human_icon = null;
        this.human_test = new RegExp("(armor)$");
        this.guid = guid;
        settings = {};
        settings.spritewidth = 370;
        settings.spriteheight = 40;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);

        var context = settings.image.getContext("2d");
        context.fillStyle = "#958686";
        context.strokeStyle = "black";
        context.lineWidth = 2;

        context.fillRect(0, 0, settings.spritewidth, settings.spriteheight);
        context.fillStyle = "black";
        context.fillRect(0, 0, 40, 40)
        context.strokeRect(0, 0, settings.spritewidth, settings.spriteheight);


        this.parent(10, 20, settings);
        this.floating = true;

        this.text_object = new game.SmallText(this.pos.x + 45, this.pos.y + 5, this.getCurrentMessage(), game.fonts.white);
        this.text_object.floating = true;
        me.game.add(this.text_object, game.guiLayer + 1);
        this.createCurrentIcon();
        me.game.sort();

    }, update: function() {
        if (me.input.isKeyPressed('use')) {
            this.nextMessage();
        }

        this.parent();
        return true;
    }, getCurrentMessage: function() {
        var message_object = this.dialog.branches[this.branch].messages[this.message];

        if (message_object.type === "QUIT") {
            me.game.remove(game.instances.dialog);
            game.instances.dialog = null;
            return false;
        }

        return message_object.message;
    },
    createCurrentIcon: function() {
        if (this.human_icon !== null) {
            me.game.remove(this.human_icon);
            this.human_icon = null;
        }
        var message_object = this.dialog.branches[this.branch].messages[this.message];
        switch (message_object.type) {
            case "NPC":
                this.human_icon = new game.gui.NPCIcon(this.pos.x + 8, this.pos.y + 8, this.dialog.npc_image, this.dialog.image_size, this.dialog.anim_length);
                me.game.add(this.human_icon, game.guiLayer + 1);
                break;
            case "PLAYER":
                var armor;
                if (me.gamestat.getItemValue("equip").armor === null) {
                    armor = "clotharmor";
                } else {
                    var armor = game.mechanic.get_inventory_item(me.gamestat.getItemValue("equip").armor);

                    armor = armor.attributes.image_name;
                }
                this.human_icon = new game.gui.HumanIcon(this.pos.x + 5, this.pos.y + 2, armor);
                me.game.add(this.human_icon, game.guiLayer + 1);
                break;
        }
        me.game.sort();
    }, nextMessage: function() {
        this.message++;
        if (this.message === this.dialog.branches[this.branch].length) {
            this.message = 0;
        }
        var text = this.getCurrentMessage();
        if (text !== false) {
            this.text_object.text = text;
            this.createCurrentIcon();
        }
    }, onDestroyEvent: function() {
        me.game.remove(this.text_object);
        this.text_object = null;
        me.game.remove(this.human_icon);
        this.human_icon = null;
    }
});

game.gui.CloseButton = me.GUI_Object.extend({
    parent_class: null,
    init: function(x, y, parent) {
        this.parent_class = parent;
        settings = {};
        settings.spritewidth = 8;
        settings.spriteheight = 8;
        settings.image = "close_button";
        this.parent(x, y, settings);
        this.floating = true;
    },
    onClick: function() {
        me.game.remove(this.parent_class);
    }
});

game.gui.Window = me.ObjectEntity.extend({
    close_button: null,
    init: function(x, y, width, height) {
        settings = {};
        settings.spritewidth = width;
        settings.spriteheight = height;
        settings.image = me.video.createCanvas(width, height);

        var context = settings.image.getContext("2d");
        context.fillStyle = "#958686";
        context.strokeStyle = "black";
        context.lineWidth = 2;

        context.fillRect(0, 0, settings.spritewidth, settings.spriteheight);
        context.strokeRect(0, 0, settings.spritewidth, settings.spriteheight);

        this.parent(x, y, settings);
        this.floating = true;
        this.close_button = new game.gui.CloseButton(this.pos.x + width - 8, this.pos.y, this);
        me.game.add(this.close_button, game.guiLayer + 1);
        me.game.sort();
    },
    onDestroyEvent: function() {
        me.game.remove(this.close_button);
        this.close_button = null;
    }
});

game.gui.Stash = game.gui.Window.extend({
    inventory_tiles: null,
    stash_tiles: null,
    entity_layer: null,
    selected_tile: null,
    selected_type: null,
    inventory_money: null,
    stash_money: null,
    init: function() {
        this.selected_tile = null;
        this.selected_type = null;
        this.entity_layer = game.guiLayer + 1;
        this.parent(10, 10, 200, 175);
        var context = this.renderable.image.getContext("2d");
        game.fonts.basic.draw(context, "Stash", 35, 5);
        game.fonts.basic.draw(context, "Inventory", 115, 5);

        this.inventory_tiles = new Array(6);
        for (var i = 0; i < this.inventory_tiles.length; i++) {
            this.inventory_tiles[i] = new Array(5);
        }
        for (var row = 0; row < this.inventory_tiles.length; row++) {
            for (var column = 0; column < this.inventory_tiles[row].length; column++) {
                this.inventory_tiles[row][column] = me.entityPool.newInstanceOf("InventoryTile", this.pos.x + 105 + (column * 16), this.pos.y + 15 + (row * 16), (row * (this.inventory_tiles.length - 1)) + column, "inventory");
                me.game.add(this.inventory_tiles[row][column], this.entity_layer);
            }
        }

        this.stash_tiles = new Array(8);
        for (var i = 0; i < this.stash_tiles.length; i++) {
            this.stash_tiles[i] = new Array(5);
        }
        var i = 0;
        for (var row = 0; row < this.stash_tiles.length; row++) {
            for (var column = 0; column < this.stash_tiles[row].length; column++) {
                this.stash_tiles[row][column] = me.entityPool.newInstanceOf("InventoryTile", this.pos.x + 15 + (column * 16), this.pos.y + 15 + (row * 16), i, "stash");
                i++;
                me.game.add(this.stash_tiles[row][column], this.entity_layer);
            }
        }

        this.stash_money = new game.gui.MoneyTab(this.pos.x + 20, this.pos.y + 150);
        me.game.add(this.stash_money, this.entity_layer);
        this.inventory_money = new game.gui.MoneyTab(this.pos.x + 115, this.pos.y + 150);
        me.game.add(this.inventory_money, this.entity_layer);

        me.game.sort();

        me.input.registerPointerEvent('mouseup', me.game.viewport, this.mouseUp.bind(this));
    },
    update: function() {
        this.inventory_money.onUpdate(me.gamestat.getItemValue("money"));
        this.stash_money.onUpdate(me.gamestat.getItemValue("stash_money"));

        this.parent();
        return true;
    },
    onDestroyEvent: function() {
        this.parent();

        for (var row = 0; row < this.inventory_tiles.length; row++) {
            for (var column = 0; column < this.inventory_tiles[row].length; column++) {
                me.game.remove(this.inventory_tiles[row][column]);
                this.inventory_tiles[row][column] = null;
            }
        }

        for (var row = 0; row < this.stash_tiles.length; row++) {
            for (var column = 0; column < this.stash_tiles[row].length; column++) {
                me.game.remove(this.stash_tiles[row][column]);
                this.stash_tiles[row][column] = null;
            }
        }

        me.game.remove(this.inventory_money);
        this.inventory_money = null;
        me.game.remove(this.stash_money);
        this.stash_money = null;
        me.input.releasePointerEvent('mouseup', me.game.viewport);
    },
    mouseUp: function() {
        console.log("tile " + this.selected_tile);
        if (this.selected_tile !== null) {
            console.log("type " + this.selected_type);
            if (this.selected_type === "stash") {
                var flag = false;
                for (var row = 0; row < this.inventory_tiles.length; row++) {
                    for (var column = 0; column < this.inventory_tiles[row].length; column++) {
                        if (this.inventory_tiles[row][column].containsPointV(me.input.mouse.pos)) {
                            console.log("inventory " + row + "/" + column);
                            var item = me.gamestat.getItemValue("stash")[this.selected_tile];
                            game.mechanic.inventory_push(item);
                            game.mechanic.stash_drop(item.guid);
                            flag = true;
                            break;
                        }
                    }
                    if (flag) {
                        break;
                    }
                }
            }

            if (this.selected_type === "inventory") {
                for (var row = 0; row < this.stash_tiles.length; row++) {
                    for (var column = 0; column < this.stash_tiles[row].length; column++) {
                        if (this.stash_tiles[row][column].containsPointV(me.input.mouse.pos)) {
                            console.log("stash " + row + "/" + column);
                            var item = me.gamestat.getItemValue("inventory")[this.selected_tile];
                            game.mechanic.stash_push(item);
                            game.mechanic.inventory_drop(item.guid);
                            flag = true;
                            break;
                        }
                    }
                    if(flag){
                        break;
                    }
                }
            }

            var selected_row, selected_column;
            if (this.selected_type === "inventory") {
                selected_row = this.selected_tile / 6;
                selected_column = this.selected_tile % 5;
                this.inventory_tiles[selected_row][selected_column].mouseUp();
            } else if (this.selected_type === "stash") {
                selected_row = this.selected_tile / 8;
                selected_column = this.selected_tile % 5;
                this.stash_tiles[selected_row][selected_column].mouseUp();
            }
        }
    }
});

game.gui.MoneyTab = me.ObjectEntity.extend({
    icon: null,
    font: null,
    label: null,
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 65;
        settings.spriteheight = 16;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);

        var context = settings.image.getContext("2d");
        context.lineWidth = 1;
        context.strokeStyle = "black";
        context.fillStyle = "black";
        //140 125
        context.strokeRect(0, 0, 16, 16);
        context.strokeRect(0, 0, 16, 16);
        context.strokeRect(0, 0, 16, 16);
        context.strokeRect(0, 0, 65, 16);
        context.strokeRect(0, 0, 65, 16);
        context.strokeRect(0, 0, 65, 16);
        this.parent(x, y, settings);
        this.floating = true;
        this.icon = new game.Icon(this.pos.x, this.pos.y, "money-1");
        this.icon.floating = true;
        me.game.add(this.icon, game.guiLayer + 1);
        this.font = game.fonts.white;
        this.label = new game.SmallText(this.pos.x + 20, this.pos.y + 4, "0", this.font);
        this.label.floating = true;
        me.game.add(this.label, game.guiLayer + 1);
        me.game.sort();
        console.log("hey");
    },
    onDestroyEvent: function() {
        me.game.remove(this.icon);
        this.icon = null;
        me.game.remove(this.label);
        this.label = null;
    },
    onUpdate: function(value) {
        this.label.text = value;

        if (value < 6) {
            this.icon.renderable.image = me.loader.getImage("money-1");
        } else if (value < 26) {
            this.icon.renderable.image = me.loader.getImage("money-2");
        } else if (value < 101) {
            this.icon.renderable.image = me.loader.getImage("money-3");
        } else {
            this.icon.renderable.image = me.loader.getImage("money-4");
        }
    }
});
