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
    onClick: function() {
        game.mechanic.trigger_backpack();
    }
});

game.gui.InventoryButton = me.GUI_Object.extend({
    text_object: null,
    image_icon: null,
    hovering: null,
    callback: null,
    func: null,
    init: function(x, y, text, image, func) {
        settings = {};
        settings.spritewidth = 80;
        settings.spriteheight = 16;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);

        var context = settings.image.getContext('2d');
        context.fillStyle = "#E26D6D";
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.fillRect(0, 0, settings.spritewidth, settings.spriteheight);
        context.strokeRect(0, 0, settings.spritewidth, settings.spriteheight);

        this.parent(x, y, settings);
        this.floating = true;
        this.text_object = new game.gui.SmallText(x + 20, y + 3, text, game.fonts.basic);
        this.text_object.floating = true;
        this.image_icon = new game.Icon(x + 2, y + 0, image);
        me.game.add(this.image_icon, game.LAYERS.TOP);
        me.game.add(this.text_object, game.LAYERS.TOP);
        me.game.sort();
        this.hovering = false;
        this.func = func;
    },
    update: function() {
        var trigger = false;
        if (me.input.mouse.pos.x >= this.pos.x && me.input.mouse.pos.x <= this.pos.x + this.width) {
            if (me.input.mouse.pos.y >= this.pos.y && me.input.mouse.pos.y <= this.pos.y + this.height) {
                trigger = true;
            }
        }

        if (trigger) {
            this.hovering = true;
        } else {
            if (this.hovering) {
                this.hovering = false;
            }
        }
    }, onClick: function() {
        this.func();
    }, onDestroyEvent: function() {
        me.game.remove(this.text_object);
        this.text_object = null;
        me.game.remove(this.image_icon);
        this.image_icon = null;
    }
});

game.gui.InventoryWindow = me.ObjectEntity.extend({
    entity_layer: game.LAYERS.GUI + 1,
    inventory_type: null,
    inventory_buttons: null,
    init: function(type) {
        this.inventory_type = type;
        settings = {};
        settings.spritewidth = 370;
        settings.spriteheight = 190;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);
        //drawing backpack image
        var context = settings.image.getContext("2d");
        context.fillStyle = "#958686";
        context.fillRect(0, 0, settings.spritewidth, settings.spriteheight);
        context.strokeStyle = "black";
        context.moveTo(0, 0);
        context.lineWidth = 3;
        context.lineTo(settings.spritewidth, 0);
        context.lineTo(settings.spritewidth, settings.spriteheight);
        context.lineTo(0, settings.spriteheight);
        context.lineTo(0, 0);
        context.stroke();

        this.parent(15, 5, settings);
        this.floating = true;
        this.inventory_buttons = {};
        this.inventory_buttons.backpack = new game.gui.InventoryButton(384 - 80, 5 + 2, "Backpack", "backpack_icon", game.mechanic.open_backpack);
        me.game.add(this.inventory_buttons.backpack, this.entity_layer);
        this.inventory_buttons.manabook = new game.gui.InventoryButton(384 - 80, 5 + 2 + 16 + 2, "Mana Book", "book", game.mechanic.open_manabook);
        me.game.add(this.inventory_buttons.manabook, this.entity_layer);
        this.inventory_buttons.options = new game.gui.InventoryButton(384 - 80, 5 + (2 * 2) + (16 * 2) + 2, "Options", "options_icon", game.mechanic.open_options);
        me.game.add(this.inventory_buttons.options, this.entity_layer);
        me.game.sort();
        me.input.registerPointerEvent('mouseup', me.game.viewport, this.mouseUp.bind(this));
    },
    onDestroyEvent: function() {
        me.game.remove(this.inventory_buttons.backpack);
        this.inventory_buttons.backpack = null;
        me.game.remove(this.inventory_buttons.manabook);
        this.inventory_buttons.manabook = null;
        me.game.remove(this.inventory_buttons.options);
        this.inventory_buttons.options = null;
        this.inventory_buttons = null;
        me.input.releasePointerEvent('mouseup', me.game.viewport);
    },
    mouseUp: function() {
    }
});

game.gui.ManaBook = game.gui.InventoryWindow.extend({
    tiles: null,
    belt_tiles: null,
    selected_tile: null,
    init: function() {
        this.parent("manabook");

        var context = this.renderable.image.getContext('2d');
        game.fonts.basic.draw(context, "Mana Book", 150, 7);
        game.fonts.basic.draw(context, "Belt", 30, 152);

        this.selected_tile = null;
        this.tiles = new Array(64);
        var i = 0;
        for (var row = 0; row < 8; row++) {
            for (var column = 0; column < 8; column++) {
                this.tiles[i] = new game.InventoryTile(this.pos.x + 25 + (row * 16), 25 + (column * 16), i, "spells");
                me.game.add(this.tiles[i], this.entity_layer);
                i++;
            }
        }

        this.belt_tiles = new Array(8);
        for (var i = 0; i < this.belt_tiles.length; i++) {
            this.belt_tiles[i] = me.entityPool.newInstanceOf("CharacterTile", this.pos.x + 25 + (i * 16), this.pos.y + 165, "belt", i);
            me.game.add(this.belt_tiles[i], this.entity_layer);
        }
        me.game.sort();
    },
    onDestroyEvent: function() {
        this.parent();
        
        for (var i = 0; i < this.tiles.length; i++) {
            me.game.remove(this.tiles[i]);
            this.tiles[i] = null;
        }

        for (var i = 0; i < this.belt_tiles.length; i++) {
            me.game.remove(this.belt_tiles[i]);
            this.belt_tiles[i] = null;
        }
    },
    getTileFromID: function(id) {
        if (id < this.tiles.length - 1) {
            return {row: 0, column: id};
        } else {
            var row = Math.floor(id / (this.tiles.length - 1));
            var column = id - ((this.tiles.length - 1) * row);
            return {row: row, column: column};
        }
    },
    mouseUp: function() {
        this.parent();
        if (this.selected_tile !== null) {
            var object = me.gamestat.getItemValue("spells")[this.selected_tile];

            //then belt
            for (var i = 0; i < this.belt_tiles.length; i++) {
                this.belt_tiles[i].iconDown(object);
            }

            //then tile
            this.tiles[this.selected_tile].mouseUp();
            console.log(this.tiles[this.selected_tile]);
        }
    }
});

game.gui.InventoryOptions = game.gui.InventoryWindow.extend({
    checkboxes: null,
    buttons: null,
    sliders: null,
    init: function() {
        this.parent("options");
        this.checkboxes = {};
        this.buttons = {};
        this.sliders = {};
        var context = this.renderable.image.getContext("2d");
        game.fonts.white.draw(context, "Enable sounds", 20, 20);
        game.fonts.basic.draw(context, "Options", 150, 7);
        this.checkboxes.enable_sound = new game.gui.CheckBox(this.pos.x + 20, this.pos.y + 30, me.audio.isAudioEnable(), game.instances.audio.switchEnable);
        me.game.add(this.checkboxes.enable_sound, this.entity_layer);
        game.fonts.white.draw(context, "Music volume", 20, 50);
        this.sliders.ambient = new game.gui.SliderContainer(this.pos.x + 10, 68, parseInt(game.instances.audio.channels.ambient.volume * 100), game.instances.audio.channels.ambient);
        me.game.add(this.sliders.ambient, this.entity_layer);
        game.fonts.white.draw(context, "Effects volume", 20, 78);
        this.sliders.effects = new game.gui.SliderContainer(this.pos.x + 10, 95, parseInt(game.instances.audio.channels.effects.volume * 100), game.instances.audio.channels.effects);
        me.game.add(this.sliders.effects, this.entity_layer);
        this.buttons.save = new game.gui.FuncButton(this.pos.x + 10, this.pos.y + 120, "Save Options", "", null, game.mechanic.save_settings);
        me.game.add(this.buttons.save, this.entity_layer);
        this.buttons.save_game = new game.gui.FuncButton(this.pos.x + 10, this.pos.y + 140, "Save Hero", "", null, game.mechanic.save_game);
        me.game.add(this.buttons.save_game, this.entity_layer);
    },
    onDestroyEvent: function() {
        this.parent();

        me.game.remove(this.checkboxes.enable_sound);
        this.checkboxes.enable_sound = null;
        this.checkboxes = null;
        me.game.remove(this.buttons.save);
        this.buttons.save = null;
        me.game.remove(this.buttons.save_game);
        this.buttons.save_game = null;
        this.buttons = null;
        me.game.remove(this.sliders.ambient);
        this.sliders.ambient = null;
        me.game.remove(this.sliders.effects);
        this.sliders.effects = null;
        this.sliders = null;
    }
});

game.Backpack = game.gui.InventoryWindow.extend({
    tiles: null,
    font: null,
    bm_font: null,
    buttons_add: null,
    weapon_tile: null,
    armor_tile: null,
    artefact_tile: null,
    belt_tiles: null,
    selected_tile: null,
    human_icon: null,
    weapon_icon: null,
    money_icon: null,
    drop_tile: null,
    money_tab: null,
    attributes: null,
    init: function() {
        this.parent("backpack");
        var context = this.renderable.image.getContext('2d');

        context.fillStyle = "black";
        context.fillRect(42, 15, 40, 40);

        //Texts
        this.font = game.fonts.basic;
        this.bm_font = new me.BitmapFont("geebeeyay-8x8", 8);

        var height = 58;

        this.font.draw(context, "Armor", 7, height);
        this.font.draw(context, "Weapon", 43, height);
        this.font.draw(context, "Artefact", 87, height);

        this.font.draw(context, "Inventory", 15 + 135, 5 + 2);
        this.font.draw(context, "Belt", 15 + 135, 147);

        this.bm_font.draw(context, me.gamestat.getItemValue("body").name, 10, 92);
        var height = 105, attr_height;
        this.bm_font.draw(context, "LEVEL", 15, height);
        attr_height = height;
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

        this.attributes = {};
        this.labels = {};
        height = attr_height;
        height += 4;
        this.labels.level = new game.effects.BMF_Font(105, height, me.gamestat.getItemValue("level"));
        this.labels.level.floating = true;
        me.game.add(this.labels.level, this.entity_layer);
        height = height + this.labels.level.font.measureText(context, "L").height;
        this.labels.exp = new game.gui.SmallText(105, height, me.gamestat.getItemValue("exp") + "/" + me.gamestat.getItemValue("next_level"), game.fonts.basic);
        this.labels.exp.floating = true;
        me.game.add(this.labels.exp, this.entity_layer);
        height = height + this.font.measureText(context, "HP").height;
        this.labels.hp = new game.gui.SmallText(105, height, me.gamestat.getItemValue("hp") + "/" + me.gamestat.getItemValue("maxhp"), game.fonts.basic);
        this.labels.hp.floating = true;
        me.game.add(this.labels.hp, this.entity_layer);
        height = height + this.font.measureText(context, "HP").height;
        this.attributes.str = new game.gui.AttributeText(105, height, "str");
        me.game.add(this.attributes.str, this.entity_layer);
        height = height + this.font.measureText(context, "HP").height;
        this.attributes.agi = new game.gui.AttributeText(105, height, "agi");
        me.game.add(this.attributes.agi, this.entity_layer);
        height = height + this.font.measureText(context, "HP").height;
        this.attributes.end = new game.gui.AttributeText(105, height, "end");
        me.game.add(this.attributes.end, this.entity_layer);
        height = height + this.font.measureText(context, "HP").height;
        this.attributes.int = new game.gui.AttributeText(105, height, "int");
        me.game.add(this.attributes.int, this.entity_layer);
        height = height + this.font.measureText(context, "HP").height;
        this.labels.skill = new game.gui.SmallText(105, height, me.gamestat.getItemValue("skill"), game.fonts.basic);
        this.labels.skill.floating = true;
        me.game.add(this.labels.skill, this.entity_layer);

        this.human_icon = new game.gui.HumanIcon(60, 23, "predefined");
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
            var height = this.font.measureText(context, "HP").height;
            var y_pos = 95 + 2 + 12 + (height * 2);
            this.buttons_add.str = me.entityPool.newInstanceOf("PlusSkillButton", x_pos, y_pos, "str");
            me.game.add(this.buttons_add.str, this.entity_layer);
            y_pos += height;
            this.buttons_add.agi = me.entityPool.newInstanceOf("PlusSkillButton", x_pos, y_pos, "agi");
            me.game.add(this.buttons_add.agi, this.entity_layer);
            y_pos += height;
            this.buttons_add.end = me.entityPool.newInstanceOf("PlusSkillButton", x_pos, y_pos, "end");
            me.game.add(this.buttons_add.end, this.entity_layer);
            y_pos += height;
            this.buttons_add.int = me.entityPool.newInstanceOf("PlusSkillButton", x_pos, y_pos, "int");
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

    }, update: function() {
        if (me.gamestat.getItemValue("skill") === 0 && this.buttons_add !== null) {
            me.game.remove(this.buttons_add.str);
            this.buttons_add.str = null;
            me.game.remove(this.buttons_add.agi);
            this.buttons_add.agi = null;
            me.game.remove(this.buttons_add.end);
            this.buttons_add.end = null;
            me.game.remove(this.buttons_add.int);
            this.buttons_add.int = null;
            this.buttons_add = null;
        }

        this.labels.skill.text = me.gamestat.getItemValue("skill");
        this.labels.exp.text = me.gamestat.getItemValue("exp") + "/" + me.gamestat.getItemValue("next_level");
        this.labels.hp.text = me.gamestat.getItemValue("hp") + "/" + me.gamestat.getItemValue("maxhp");

        this.money_tab.onUpdate(me.gamestat.getItemValue("money"));

        this.parent();
        return true;
    }, updateEquip: function() {
        me.game.remove(this.human_icon);
        this.human_icon = new game.gui.HumanIcon(60, 23, "predefined");
        me.game.add(this.human_icon, this.entity_layer);

        if (this.weapon_icon !== null) {
            me.game.remove(this.weapon_icon);
            this.weapon_icon = null;
        }

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
    },
    onDestroyEvent: function() {
        this.parent();
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

        me.game.remove(this.attributes.str);
        this.attributes.str = null;
        me.game.remove(this.attributes.agi);
        this.attributes.agi = null;
        me.game.remove(this.attributes.end);
        this.attributes.end = null;
        me.game.remove(this.attributes.int);
        this.attributes.int = null;
        this.attributes = null;

        me.game.remove(this.labels.level);
        this.labels.level = null;
        me.game.remove(this.labels.exp);
        this.labels.exp = null;
        me.game.remove(this.labels.hp);
        this.labels.hp = null;
        me.game.remove(this.labels.skill);
        this.labels.skill = null;
        this.labels = null;


        for (var i = 0; i < this.belt_tiles.length; i++) {
            me.game.remove(this.belt_tiles[i]);
        }
        this.belt_tiles = null;

        this.selected_tile = null;
    },
    getTileFromID: function(id) {
        if (id < this.tiles.length - 1) {
            return {row: 0, column: id};
        } else {
            var row = Math.floor(id / (this.tiles.length - 1));
            var column = id - ((this.tiles.length - 1) * row);
            return {row: row, column: column};
        }
    },
    mouseUp: function() {
        this.parent();
        if (this.selected_tile !== null) {
            var selected = this.getTileFromID(this.selected_tile);

            var object = me.gamestat.getItemValue("inventory")[this.selected_tile];
            //noticed equip first
            this.weapon_tile.iconDown(object);
            this.armor_tile.iconDown(object);
            this.artefact_tile.iconDown(object);

            //then belt
            for (var i = 0; i < this.belt_tiles.length; i++) {
                this.belt_tiles[i].iconDown(object);
            }

            if (me.input.mouse.pos.x >= this.pos.x + 42 && me.input.mouse.pos.x <= this.pos.x + 42 + 40) {
                if (me.input.mouse.pos.y >= this.pos.y + 15 && me.input.mouse.pos.y <= this.pos.y + 15 + 40) {
                    game.mechanic.trigger_item(me.gamestat.getItemValue("inventory")[this.selected_tile].guid);
                }
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
    tooltip: null,
    init: function(x, y, type, id) {
        settings = {};
        settings.image = "inventory_tile";
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        this.parent(x, y, settings);
        this.floating = true;
        this.type = type;
        this.id = id;
        this.tooltip = null;
        if (this.type !== "belt") {
            if (me.gamestat.getItemValue("equip")[this.type] !== null) {
                this.addIcon(me.gamestat.getItemValue("equip")[this.type]);
            }
        } else {
            if (me.gamestat.getItemValue("belt")[this.id] !== null) {
                this.addIcon(me.gamestat.getItemValue("belt")[this.id]);
            }
        }
    },
    update: function() {
        if (this.containsPointV(me.input.mouse.pos)) {
            this.onMouseOver();
        } else {
            this.onMouseOut();
        }

        if (this.type !== "belt") {
            if (me.gamestat.getItemValue("equip")[this.type] !== null && this.icon === null) {
                this.addIcon(me.gamestat.getItemValue("equip")[this.type]);
            } else if (me.gamestat.getItemValue("equip")[this.type] !== null && this.icon !== null) {
                if ((game.mechanic.get_inventory_item(me.gamestat.getItemValue("equip")[this.type]).icon_name !== this.icon.image)) {
                    this.addIcon(me.gamestat.getItemValue("equip")[this.type]);
                }
            }
        }

        this.parent();
    },
    removeItem: function() {
        this.removeIcon();
        if (this.type !== "belt") {
            switch (this.type) {
                case "weapon":
                    game.instances.player.equipWeapon();
                    break;
                case "armor":
                    game.instances.player.equipArmor();
                    break;
            }
        }
    },
    onDestroyEvent: function() {
        this.removeIcon();
        this.onMouseOut();
    },
    addIcon: function(guid) {
        this.removeIcon();

        var object;
        object = game.mechanic.get_inventory_item(guid);
        if (!object) {
            object = game.mechanic.get_manabook_item(guid);
        }
        if (this.type !== "belt") {
            var success = false;
            switch (object.type) {
                case "weapon":
                    success = game.mechanic.trigger_item(guid);
                    break;
                case "armor":
                    success = game.mechanic.trigger_item(guid);
                    break;
                case "artefact":
                    success = game.mechanic.trigger_item(guid);
                    break;
            }
            if (success) {
                this.icon = new game.Icon(this.pos.x, this.pos.y, object.icon_name);
                me.game.add(this.icon, this.z + 1);
                me.game.sort();
            }
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

            me.game.add(this.icon, this.z + 1);
            me.game.sort();
        }

        return true;

    },
    removeIcon: function() {
        if (this.icon !== null) {
            me.game.remove(this.icon);
            this.icon = null;
        }

    },
    onClick: function() {

    },
    iconDown: function(object) {
        if (this.containsPoint(me.input.mouse.pos.x, me.input.mouse.pos.y)) {
            if (object.type === this.type || this.type === "belt") {
                this.addIcon(object.guid);
            }
        }
    },
    onMouseOver: function() {
        if (this.tooltip === null && this.icon !== null) {
            var object;
            if (this.type === "belt") {
                object = game.mechanic.get_inventory_item(me.gamestat.getItemValue(this.type)[this.id]);
            } else {
                object = game.mechanic.get_inventory_item(me.gamestat.getItemValue("equip")[this.type]);
            }
            if (object.tooltip_text !== null) {
                this.tooltip = new game.gui.Tooltip(this.pos.x + this.width, this.pos.y, object.tooltip_text);
                me.game.add(this.tooltip, this.z + 3);
                me.game.sort();
            }
        }
    },
    onMouseOut: function() {
        if (this.tooltip !== null) {
            me.game.remove(this.tooltip);
            this.tooltip = null;
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
                game.instances.audio.channels.effects.addEffect(me.gamestat.getItemValue(this.tile_type)[this.id].attributes.sound);
                if (game.instances.backpack !== null) {
                    game.instances.backpack.selected_tile = this.id;
                } else if (game.instances.stash !== null) {
                    game.instances.stash.selected_tile = this.id;
                    game.instances.stash.selected_type = this.tile_type;
                } else if (game.instances.shop !== null) {
                    game.instances.shop.selected_tile = this.id;
                    game.instances.shop.selected_type = this.tile_type;
                } else if (game.instances.manabook !== null) {
                    game.instances.manabook.selected_tile = this.id;
                    console.log(game.instances.manabook.selected_tile);
                }
                this.follow_mouse = true;
            }
        } else if (me.timer.getTime() > (this.click_timer + this.click_timer_run)) {
            this.click_timer_run = 0;
        }
    },
    update: function() {
        //container is Array storing Items in memory
        var container;
        if (this.tile_type === "shop") {
            container = game.instances.shop_items;
        } else if (this.tile_type === "spells") {
            container = me.gamestat.getItemValue("spells");
        } else {
            container = me.gamestat.getItemValue(this.tile_type);
        }
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
            var object; //stores Item_Object
            object = me.gamestat.getItemValue(this.tile_type)[this.id];
            if (object.tooltip_text !== null) {
                this.tooltip = new game.gui.Tooltip(this.pos.x + this.width, this.pos.y, object.tooltip_text);
                me.game.add(this.tooltip, this.z + 3);
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
        if (game.instances.backpack !== null) {
            game.instances.backpack.selected_tile = null;
        } else if (game.instances.stash !== null) {
            game.instances.stash.selected_tile = null;
            game.instances.stash.selected_type = null;
        } else if (game.instances.shop !== null) {
            game.instances.shop.selected_tile = null;
            game.instances.shop.selected_type = null;
        } else if (game.instances.manabook !== null) {
            game.instances.manabook.selected_tile = null;
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
        var context = this.renderable.image.getContext("2d");
        context.strokeStyle = "#958686";
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(6, 5);
        context.lineTo(94, 5);
        context.stroke();
        var width = Math.floor(0.88 * this.percent);
        if (width >= 1) {
            context.strokeStyle = "green";
            context.beginPath();
            context.moveTo(6, 5);
            context.lineTo(6 + width, 5);
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
    image: null,
    init: function(x, y, image) {
        image = typeof image !== 'undefined' ? image : "undefined";
        settings = {};
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.image = me.loader.getImage(image);
        this.parent(x, y, settings);
        this.floating = true;
        if (settings.image.naturalWidth > 16) {
            this.renderable.addAnimation("active", [0, 1, 2, 3, 4]);
            this.renderable.addAnimation("inactive", [0]);
        } else {
            this.renderable.addAnimation("inactive", [0]);
        }
        this.renderable.setCurrentAnimation("inactive");
        this.image = image;
    }
});

game.Button = me.GUI_Object.extend({
    text: null,
    title: null,
    font: null,
    outline: null,
    inline: null,
    fill: null,
    tooltip: null,
    hovering: null,
    init: function(x, y, text, title) {
        this.text = text;
        this.title = title;
        this.font = game.fonts.basic;
        this.tooltip = null;
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
        this.hovering = false;
    }, update: function() {
        var trigger = false;
        if (me.input.mouse.pos.x >= this.pos.x && me.input.mouse.pos.x <= this.pos.x + this.width) {
            if (me.input.mouse.pos.y >= this.pos.y && me.input.mouse.pos.y <= this.pos.y + this.height) {
                trigger = true;
            }
        }

        if (trigger) {
            this.hovering = true;
            this.onHover();
            this.outline = "black";
            this.inline = "black";
            this.fill = "#D83939";

            this.drawContext(this.image.getContext("2d"));

        } else {
            if (this.hovering) {
                this.hovering = false;
                this.onHoverOut();
                this.outline = "black";
                this.inline = "#E26D6D";
                this.fill = "#D83939";

                this.drawContext(this.image.getContext("2d"));
            }
        }
    }, onClick: function() {
    }, onHover: function() {
        if (this.tooltip === null && this.title !== "") {
            this.tooltip = new game.gui.Tooltip(this.pos.x + this.width, this.pos.y, [new game.gui.TextLine(this.title, game.fonts.white)]);
            me.game.add(this.tooltip, this.z + 1);
            me.game.sort();
        }
    }, onHoverOut: function() {
        if (this.tooltip !== null) {
            me.game.remove(this.tooltip);
            this.tooltip = null;
        }
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
        this.font.draw(context, this.text, 5, 2);
    }, onDestroyEvent: function() {
        this.parent();

        if (this.tooltip !== null) {
            me.game.remove(this.tooltip);
            this.tooltip = null;
        }
    }
});

game.SmallButton = me.GUI_Object.extend({
    text: null,
    title: null,
    font: null,
    outline: null,
    inline: null,
    fill: null,
    tooltip: null,
    hovering: null,
    init: function(x, y, text, title) {
        this.text = text;
        this.title = title;
        this.tooltip = null;
        this.font = game.fonts.buttons_font;
        this.hovering = false;
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
            this.hovering = true;
            this.onHover();
            this.outline = "black";
            this.inline = "black";
            this.fill = "#D83939";

            this.drawContext(this.image.getContext("2d"));

        } else {
            if (this.hovering) {
                this.hovering = false;
                this.onHoverOut();
                this.outline = "black";
                this.inline = "#E26D6D";
                this.fill = "#D83939";

                this.drawContext(this.image.getContext("2d"));
            }
        }
    }, onClick: function() {
    }, onHover: function() {
        if (this.tooltip === null) {
            this.tooltip = new game.gui.Tooltip(this.pos.x + this.width, this.pos.y + this.height, this.title);
            me.game.add(this.tooltip, this.z + 1);
            me.game.sort();
        }
    }, onHoverOut: function() {
        if (this.tooltip !== null) {
            me.game.remove(this.tooltip);
            this.tooltip = null;
        }
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
    }, onDestroyEvent: function() {
        this.parent();

        if (this.tooltip !== null) {
            me.game.remove(this.tooltip);
            this.tooltip = null;
        }
    }
});

game.DropButton = game.Button.extend({
    init: function(x, y, text, title) {
        this.parent(x, y, text, title);
    },
    onClick: function() {
        this.parent();
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
    init: function(x, y, skill) {
        var title = [
            new game.gui.TextLine(" 0-20 = 1 point", game.fonts.white),
            new game.gui.TextLine("20-40 = 2 points", game.fonts.white),
            new game.gui.TextLine("40-60 = 3 points", game.fonts.white),
            new game.gui.TextLine("60-80 = 4 points", game.fonts.white)
        ];
        this.parent(x, y, "+", title);
        this.skill = skill;
    },
    onClick: function() {
        game.mechanic.attributeUp(this.skill);
        return true;
    }
});

game.gui.TextLine = Object.extend({
    text: null,
    font: null,
    init: function(text, font) {
        this.text = text;
        if (this.text.length > 23) {
            this.text.splice(23, 0, '\n');
        }
        this.font = font;
    },
    setValue: function(value) {
        this.text = this.text.replace("$value$", value.toString());
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
        this.renderable.setOpacity(0.9);
    },
    onDestroyEvent: function() {
        this.lines = null;
    }
});

game.gui.HumanIcon = me.ObjectEntity.extend({
    init: function(x, y, image) {
        settings = {};
        settings.spritewidth = 32;
        settings.spriteheight = 32;
        if (image === "predefined") {
            settings.image = game.createPlayerCanvas();
        } else {
            settings.image = image;
        }
        this.parent(x, y, settings);
        this.renderable.addAnimation("right", [5, 6, 7, 8]);
        this.renderable.addAnimation("up", [20, 21, 22, 23]);
        this.renderable.addAnimation("down", [35, 36, 37, 38]);
        this.renderable.addAnimation("iddle_right", [10, 11], 30);
        this.renderable.addAnimation("iddle_up", [25, 26], 30);
        this.renderable.addAnimation("iddle_down", [40, 41], 30);
        this.renderable.addAnimation("attack_down", [30, 31, 32, 33, 34], 1);
        this.renderable.addAnimation("attack_up", [15, 16, 17, 18, 19], 1);
        this.renderable.addAnimation("attack_right", [0, 1, 2, 3, 4], 1);
        this.renderable.setCurrentAnimation("iddle_down");
        this.floating = true;
    }
});

game.gui.NPCIcon = me.ObjectEntity.extend({
    init: function(x, y, image, size, anim_length) {
        settings = {};
        if (Object.prototype.toString.call(size) === '[object Array]') {
            settings.spritewidth = size[0];
            settings.spriteheight = size[1];
        } else {
            settings.spritewidth = size;
            settings.spriteheight = size;
        }
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
    },
    clearAll: function() {
        for (var i = 0; i < this.lines.length; i++) {
            this.removeLast();
        }
    }
});

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
            if (this.tiles[i].icon !== null && me.gamestat.getItemValue("belt")[i] === null) {
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
        me.game.add(this.buttons.save, game.LAYERS.GUI + 2);
        this.buttons.options = new game.gui.FuncButton(this.pos.x + (this.renderable.width / 2) - 40, this.pos.y + 25, "Options", "", null, game.mechanic.trigger_options);
        me.game.add(this.buttons.options, game.LAYERS.GUI + 2);
        me.game.sort();
    },
    onDestroyEvent: function() {
        me.game.remove(this.buttons.save);
        this.buttons.save = null;
        me.game.remove(this.buttons.options);
        this.buttons.option = null;
        this.buttons = null;
    }
});

game.instances.pause_menu = null;

game.gui.SaveButton = game.Button.extend({
    init: function(x, y) {
        this.parent(x, y, "Save Hero", "Will Save hero to your LocalStorage");
        this.floating = true;
    },
    onClick: function() {
        this.parent();
        game.mechanic.save_game();
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
    },
    mouseUp: function(selected) {
        if (this.containsPointV(me.input.mouse.pos)) {
            var guid = me.gamestat.getItemValue("inventory")[selected].guid;

            me.gamestat.getItemValue("inventory")[selected] = null;

            //now clean this shit sort, equip and belt
            game.mechanic.inventory_sort();
            var equip = me.gamestat.getItemValue("equip");
            if (equip.weapon === guid) {
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

        var total_height = 120;
        font.draw(context,
                "PROGRAMMING - ZARAKA\n\
        MELONJS GAME ENGINE\n\
        \n\
        TILESETS\n\
        MOZZILA BROWSERQUEST\n\
        OPENGAMEART.ORG\n\
        ADITIONAL ART\n\
        ANAFOX\n\
        VOX\n\
        \n\
        MUSIC\n\
        ORI DACHOVSKY\n\
        HELP WANTED! CAN YOU CREATE GAME?",
                50,
                total_height);
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
    question_mode: null,
    option: null,
    option_object: null,
    init: function(dialog, guid) {
        this.dialog = me.loader.getJSON(dialog);
        this.branch = 0;
        this.message = 0;
        this.human_icon = null;
        this.human_test = new RegExp("(armor)$");
        this.guid = guid;
        this.question_mode = false;
        this.option = null;
        this.option_object = null;
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

        this.text_object = new game.gui.SmallText(this.pos.x + 45, this.pos.y + 5, this.getCurrentMessage(), game.fonts.white);
        this.text_object.floating = true;
        me.game.add(this.text_object, game.guiLayer + 1);
        this.createCurrentIcon();
        me.game.sort();

    },
    update: function() {
        if (me.input.isKeyPressed('use')) {
            if (this.question_mode) {
                this.question_mode = false;
                var message_object = this.dialog.branches[this.branch].messages[this.message];
                var branch = message_object.answers[this.option_object.option].branch;
                me.game.remove(this.option_object);
                this.option_object = null;
                this.setBranch(branch);
            } else {
                this.nextMessage();
            }
        }

        this.parent();
        return true;
    },
    setBranch: function(branch) {
        this.branch = branch;
        var text = this.getCurrentMessage();
        if (text !== false) {
            this.text_object.text = text;
            this.createCurrentIcon();
        }
    },
    getCurrentMessage: function() {
        var message_object = this.dialog.branches[this.branch].messages[this.message];
        if (message_object.type === "QUIT") {
            me.game.remove(game.instances.dialog);
            game.instances.dialog = null;
            return false;
        } else if (message_object.type === "SET_HISTORY") {
            me.gamestat.getItemValue("history").npcs_talks[message_object.variable] = message_object.value;
            this.nextMessage();
            return false;
        } else if (message_object.type === "HEAL") {
            me.gamestat.setValue("hp", me.gamestat.getItemValue("maxhp"));
            this.nextMessage();
            return false;
        } else if (message_object.type === "QUESTION") {
            this.question_mode = true;
            this.option = 0;
            this.option_object = new game.gui.DialogOptions(message_object.answers);
            me.game.add(this.option_object, game.LAYERS.GUI);
            me.game.sort();
        } else if (message_object.type === "SHOP") {
            game.instances.shop = new game.gui.Shop(this.dialog);
            me.game.add(game.instances.shop, game.LAYERS.GUI);
            me.game.remove(game.instances.dialog);
            game.instances.dialog = null;
            return false;
        } else if (message_object.type === "STASH") {
            game.mechanic.trigger_stash(this.guid);
            me.game.remove(game.instances.dialog);
            game.instances.dialog = null;
            return false;
        } else if (message_object.type === "SPECIAL") {
            switch (message_object.special_type) {
                case "rain":
                    game.mechanic.trigger_rain();
                    break;
            }
            this.nextMessage();
            return false;
        } else if (message_object.type === "REQUIREMENT") {
            switch (message_object.req_type) {
                case "GOLD":
                    if (message_object.value <= me.gamestat.getItemValue("money")) {
                        game.instances.audio.channels.effects.addEffect("coins");
                        me.gamestat.updateValue("money", -message_object.value);
                        this.setBranch(message_object.r_true);
                        return false;
                    } else {
                        this.setBranch(message_object.r_false);
                        return false;
                    }
                    break;
            }
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
                this.human_icon = new game.gui.HumanIcon(this.pos.x + 5, this.pos.y + 2, "predefined");
                me.game.add(this.human_icon, game.guiLayer + 1);
                me.game.sort();
                break;
            case "QUESTION":
                this.human_icon = new game.gui.NPCIcon(this.pos.x + 8, this.pos.y + 8, this.dialog.npc_image, this.dialog.image_size, this.dialog.anim_length);
                me.game.add(this.human_icon, game.guiLayer + 1);
                me.game.sort();
                break;
            default:
                console.error("dialog message type not recognized");
                break;
        }
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
        if (this.option_object !== null) {
            me.game.remove(this.option_object);
            this.option_object = null;
        }
    }
});

game.gui.DialogOptions = me.ObjectEntity.extend({
    cursor: null,
    option: null,
    option_length: null,
    cursor_start: null,
    init: function(options) {
        settings = {};
        settings.spritewidth = 200;
        var f_height = game.fonts.white.measureText(me.video.getScreenContext(), "M").height;
        var height = f_height * (options.length + 1) + 2 * (options.length + 1);
        height += 4;
        settings.spriteheight = height;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);

        var context = settings.image.getContext("2d");
        context.fillStyle = "#958686";
        context.strokeStyle = "black";
        context.lineWidth = 2;

        context.fillRect(0, 0, settings.spritewidth, settings.spriteheight);
        context.strokeRect(0, 0, settings.spritewidth, settings.spriteheight);
        game.fonts.white.draw(context, "A for up, S for down", 5, 2);
        for (var i = 0; i < options.length; i++) {
            game.fonts.white.draw(context, options[i].message, 25, 2 + (f_height * (i + 1) + (i * 2)));
        }
        this.parent(50, 62, settings);
        this.floating = true;
        this.option = 0;
        this.option_length = options.length - 1;
        this.cursor_start = 62 + 2 + f_height;
        this.cursor = new game.Icon(50 + 4, this.cursor_start, "item-sword1");
        this.cursor.floating = true;
        me.game.add(this.cursor, game.LAYERS.GUI + 1);
        me.game.sort();
    },
    update: function() {
        if (me.input.isKeyPressed("option_up")) {
            game.instances.audio.channels.effects.addEffect("exp_click");
            if (this.option === 0) {
                this.option = this.option_length;
            } else {
                this.option--;
            }
        } else if (me.input.isKeyPressed("option_down")) {
            game.instances.audio.channels.effects.addEffect("exp_click");
            if (this.option === this.option_length) {
                this.option = 0;
            } else {
                this.option++;
            }
        }

        this.cursor.pos.y = this.cursor_start + this.option * game.fonts.white.measureText(me.video.getScreenContext(), "M").height;

        this.parent();
        return true;
    },
    onDestroyEvent: function() {
        me.game.remove(this.cursor);
        this.cursor = null;
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
    init_v: null,
    init: function(x, y, width, height) {
        this.init_v = true;
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
    },
    update: function() {
        if (this.init_v) {
            this.init_v = false;
            me.game.add(this.close_button, this.z + 1);
            me.game.sort();
        }

        this.parent();
        return true;
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
    buttons: null,
    modal: null,
    init: function() {
        this.modal = null;
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

        this.buttons = {};
        this.buttons.money2inventory = new game.gui.ImageButton(this.pos.x + 88, this.pos.y + 150, "arrow_right", this, "showDialogInventory");
        me.game.add(this.buttons.money2inventory, this.entity_layer);
        this.buttons.money2stash = new game.gui.ImageButton(this.pos.x + 97, this.pos.y + 150, "arrow_left", this, "showDialogStash");
        me.game.add(this.buttons.money2stash, this.entity_layer);
        me.game.sort();

        me.input.registerPointerEvent('mouseup', me.game.viewport, this.mouseUp.bind(this));
    },
    showDialogStash: function() {
        this.showDialog("stash");
    },
    showDialogInventory: function() {
        this.showDialog("inventory");
    },
    showDialog: function(where) {
        if (this.modal === null) {
            this.modal = new game.gui.MoneyInput(50, 50, where);
            me.game.add(this.modal, this.z + 2);
        }
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
        me.game.remove(this.buttons.money2stash);
        this.buttons.money2stash = null;
        me.game.remove(this.buttons.money2inventory);
        this.buttons.money2inventory = null;
        this.buttons = {};
        me.input.releasePointerEvent('mouseup', me.game.viewport);
    },
    mouseUp: function() {
        if (this.selected_tile !== null) {
            if (this.selected_type === "stash") {
                var flag = false;
                for (var row = 0; row < this.inventory_tiles.length; row++) {
                    for (var column = 0; column < this.inventory_tiles[row].length; column++) {
                        if (this.inventory_tiles[row][column].containsPointV(me.input.mouse.pos)) {
                            var item = me.gamestat.getItemValue("stash")[this.selected_tile];
                            game.mechanic.inventory_push(item, "inventory");
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
                            var item = me.gamestat.getItemValue("inventory")[this.selected_tile];
                            game.mechanic.stash_push(item);
                            game.mechanic.inventory_drop(item.guid);
                            flag = true;
                            break;
                        }
                    }
                    if (flag) {
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
        this.icon = new game.Icon(this.pos.x, this.pos.y + 1, "money-1");
        this.icon.floating = true;
        me.game.add(this.icon, game.guiLayer + 1);
        this.font = game.fonts.white;
        this.label = new game.gui.SmallText(this.pos.x + 20, this.pos.y + 4, "0", this.font);
        this.label.floating = true;
        me.game.add(this.label, game.guiLayer + 1);
        me.game.sort();
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

game.gui.EnemyPanel = me.ObjectEntity.extend({
    font: null,
    name: null,
    name_object: null,
    percent: null,
    init: function() {
        this.font = game.fonts.white;
        this.name = "";
        this.percent = 0;
        settings = {};
        settings.spritewidth = 102;
        settings.spriteheight = 12;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);

        var context = settings.image.getContext("2d");
        context.fillStyle = "#958686";
        context.strokeStyle = "black";
        context.lineWidth = 2;

        context.fillRect(0, 0, settings.spritewidth, settings.spriteheight);
        context.strokeRect(0, 0, settings.spritewidth, settings.spriteheight);
        this.parent((game.screenWidth / 2) - (settings.spritewidth / 2), 0, settings);
        this.floating = true;
        this.name_object = new game.gui.SmallText(this.pos.x + 3, 1, this.name, game.fonts.white);
        this.name_object.floating = true;
        me.game.add(this.name_object, game.guiLayer + 1);
        me.game.sort();
    },
    setName: function(name) {
        this.name = name;
        this.name_object.text = this.name;
    },
    onUpdate: function(percent) {
        if (percent <= 0) {
            me.game.remove(this);
            game.instances.enemy_panel = null;
            return;
        }
        var context = this.renderable.image.getContext("2d");
        context.fillStyle = "#958686";
        context.strokeStyle = "black";
        context.lineWidth = 2;

        context.fillRect(0, 0, this.renderable.width, this.renderable.height);
        context.fillStyle = "#E26D6D";
        context.fillRect(1, 1, percent, 14);
        context.strokeRect(0, 0, this.renderable.width, this.renderable.height);

    },
    onDestroyEvent: function() {
        me.game.remove(this.name_object);
        this.name_object = null;
    }
});

game.instances.enemy_panel = null;

game.mechanic.set_enemy_panel = function(name, percent) {
    if (game.instances.enemy_panel === null) {
        game.instances.enemy_panel = new game.gui.EnemyPanel();
        me.game.add(game.instances.enemy_panel, game.guiLayer);
        me.game.sort();
    }

    game.instances.enemy_panel.setName(name);
    game.instances.enemy_panel.onUpdate(percent);
};

game.gui.Shop = game.gui.Window.extend({
    shop_tiles: null,
    inventory_tiles: null,
    inventory_money: null,
    entity_layer: null,
    human_icon: null,
    items: null,
    init: function(shop) {
        game.instances.shop_items = new Array(48);
        for (var i = 0; i < game.instances.shop_items.length; i++) {
            game.instances.shop_items[i] = null;
        }
        console.log(this.items);
        this.entity_layer = game.LAYERS.GUI + 1;
        this.parent(20, 10, 300, 180);
        var context = this.renderable.image.getContext("2d");
        context.fillStyle = "black";
        context.fillRect(20, 20, 40, 40);
        game.fonts.basic.draw(context, shop.npc_name, 15, 5);
        game.fonts.basic.draw(context, "You", 225, 5);

        this.human_icon = new game.gui.NPCIcon(this.pos.x + 20 + 8, this.pos.y + 20 + 8, shop.npc_image, shop.image_size, shop.anim_length);
        me.game.add(this.human_icon, game.guiLayer + 1);

        this.inventory_tiles = new Array(6);
        for (var i = 0; i < this.inventory_tiles.length; i++) {
            this.inventory_tiles[i] = new Array(5);
        }
        for (var row = 0; row < this.inventory_tiles.length; row++) {
            for (var column = 0; column < this.inventory_tiles[row].length; column++) {
                this.inventory_tiles[row][column] = me.entityPool.newInstanceOf("InventoryTile", this.pos.x + 200 + (column * 16), this.pos.y + 15 + (row * 16), (row * (this.inventory_tiles.length - 1)) + column, "inventory");
                me.game.add(this.inventory_tiles[row][column], this.entity_layer);
            }
        }

        this.shop_tiles = new Array(8);
        for (var i = 0; i < this.shop_tiles.length; i++) {
            this.shop_tiles[i] = new Array(6);
        }

        var i = 0;
        for (var row = 0; row < this.shop_tiles.length; row++) {
            for (var column = 0; column < this.shop_tiles[row].length; column++) {
                this.shop_tiles[row][column] = me.entityPool.newInstanceOf("InventoryTile", this.pos.x + 75 + (column * 16), this.pos.y + 15 + (row * 16), i, "shop");
                me.game.add(this.shop_tiles[row][column], this.entity_layer);
                i++;
            }
        }

        this.inventory_money = new game.gui.MoneyTab(this.pos.x + 215, this.pos.y + 150);
        me.game.add(this.inventory_money, this.entity_layer);
        me.game.sort();
        me.input.registerPointerEvent('mouseup', me.game.viewport, this.mouseUp.bind(this));
    },
    onDestroyEvent: function() {
        this.parent();

        for (var row = 0; row < this.inventory_tiles.length; row++) {
            for (var column = 0; column < this.inventory_tiles[row].length; column++) {
                me.game.remove(this.inventory_tiles[row][column]);
                this.inventory_tiles[row][column] = null;
            }
        }

        for (var row = 0; row < this.shop_tiles.length; row++) {
            for (var column = 0; column < this.shop_tiles[row].length; column++) {
                me.game.remove(this.shop_tiles[row][column]);
                this.shop_tiles[row][column] = null;
            }
        }

        me.game.remove(this.human_icon);
        this.human_icon = null;

        me.game.remove(this.inventory_money);
        this.inventory_money = null;
        game.instances.shop = null;

        me.input.releasePointerEvent('mouseup', me.game.viewport);
    },
    mouseUp: function() {

    }
});

game.gui.FuncButton = game.Button.extend({
    func: null,
    object: null,
    init: function(x, y, text, title, object, func) {
        this.parent(x, y, text, title);
        this.floating = true;
        this.func = func;
        this.object = object;
    },
    onClick: function() {
        this.parent();
        if (this.object === null) {
            this.func();
        } else {
            this.object[this.func]();
        }
        return true
    }
});

game.gui.ImageButton = me.GUI_Object.extend({
    func: null,
    object: null,
    init: function(x, y, image, object, func) {
        this.func = func;
        this.object = object;
        settings = {};
        settings.spritwidth = 16;
        settings.spriteheight = 16;
        settings.image = image;
        this.parent(x, y, settings);
        this.floating = true;
    },
    onClick: function() {
        this.parent();
        if (this.object === null) {
            this.func();
        } else {
            this.object[this.func]();
        }
        return true;
    }
});

game.gui.ColorButton = me.GUI_Object.extend({
    object: null,
    func: null,
    init: function(x, y, color, object, func) {
        this.object = object;
        this.func = func;
        settings = {};
        settings.spritwidth = 10;
        settings.spriteheight = 10;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);
        var context = settings.image.getContext('2d');
        context.fillStyle = color;
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.fillRect(0, 0, settings.spritewidth, settings.spriteheight);
        context.strokeRect(0, 0, settings.spritewidth, settings.spriteheight);

        this.parent(x, y, settings);
        this.floating = true;
    },
    onClick: function() {
        this.parent();
        if (this.object === null) {
            this.func();
        } else {
            this.object[this.func]();
        }
        return true;
    }
});

game.gui.CheckBox = me.GUI_Object.extend({
    checked: null,
    update_func: null,
    init: function(x, y, state, update_func) {
        this.update_func = update_func;
        this.checked = state;
        settings = {};
        settings.spritewidth = 12;
        settings.spriteheight = 12;
        if (state) {
            settings.image = "checkbox_checked";
        } else {
            settings.image = "checkbox_unchecked";
        }
        this.parent(x, y, settings);
        this.floating = true;
    },
    onClick: function() {
        if (this.checked) {
            this.image = me.loader.getImage("checkbox_unchecked");
            this.checked = false;
        } else {
            this.image = me.loader.getImage("checkbox_checked");
            this.checked = true;
        }
        this.update_func(this.checked);
        return true;
    }
});

game.gui.AttributeText = game.gui.SmallText.extend({
    attribute: null,
    hovering: null,
    tooltip: null,
    init: function(x, y, attribute) {
        this.hovering = false;
        this.attribute = attribute;
        this.parent(x, y, this.getText(), this.getFont());
        this.floating = true;
    },
    getText: function() {
        var result = me.gamestat.getItemValue("stats").getBonusAttr(this.attribute);
        return result.toString();
    },
    getFont: function() {
        if (me.gamestat.getItemValue("stats")["bons_" + this.attribute] > 0) {
            return game.fonts.teal;
        } else {
            return game.fonts.basic;
        }
    },
    update: function() {
        this.text = this.getText();
        this.font = this.getFont();

        var trigger = false;
        if (me.input.mouse.pos.x >= this.pos.x && me.input.mouse.pos.x <= this.pos.x + this.font.measureText(me.video.getScreenContext(), this.text).width) {
            if (me.input.mouse.pos.y >= this.pos.y && me.input.mouse.pos.y <= this.pos.y + this.font.measureText(me.video.getScreenContext(), this.text).height) {
                trigger = true;
            }
        }

        if (trigger) {
            this.hovering = true;
            if (this.tooltip === null) {
                this.tooltip = new game.gui.Tooltip(this.pos.x + this.font.measureText(me.video.getScreenContext(), this.text).width, this.pos.y, game.mechanic.get_attribute_tooltip(this.attribute));
                me.game.add(this.tooltip, game.LAYERS.TOP);
                me.game.sort();
            }
        } else {
            if (this.hovering) {
                this.hovering = false;
                if (this.tooltip !== null) {
                    me.game.remove(this.tooltip);
                    this.tooltip = null;
                }
            }
        }
        this.parent();
        return true;
    },
    onDestroyEvent: function() {
        this.parent();
        if (this.tooltip !== null) {
            me.game.remove(this.tooltip);
            this.tooltip = null;
        }
    }
});

game.gui.SliderContainer = me.ObjectEntity.extend({
    slider: null,
    func: null,
    mouse_rect: null,
    activated: null,
    init: function(x, y, init_v, func) {
        this.func = func;
        this.activated = false;
        settings = {};
        settings.spritewidth = 100;
        settings.spriteheight = 10;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);

        var context = settings.image.getContext("2d");
        context.strokeStyle = "black";
        context.fillStyle = "red";
        context.lineWidth = 2;
        context.fillRect(0, 0, settings.spritewidth, settings.spriteheight);
        context.strokeRect(0, 0, settings.spritewidth, settings.spriteheight);
        context.strokeRect(0, 0, settings.spritewidth, settings.spriteheight);

        this.parent(x, y, settings);
        this.floating = true;

        this.slider = new game.gui.Slider(this.pos.x + init_v, this.pos.y - 2, this);
        me.game.add(this.slider, game.LAYERS.TOP + 4);
        me.game.sort();

        me.input.registerPointerEvent("mouseup", me.game.viewport, this.mouseUp.bind(this));
    },
    onDestroyEvent: function() {
        me.game.remove(this.slider);
        this.slider = null;
        me.input.releasePointerEvent("mouseup", me.game.viewport);
    },
    mouseUp: function() {
        if (this.activated) {
            this.slider.mouseUp();
        }
    }
});

game.gui.Slider = me.GUI_Object.extend({
    parent_container: null,
    moving: null,
    init: function(x, y, parent_c) {
        this.parent_container = parent_c;
        settings = {};
        settings.spritewidth = 5;
        settings.spriteheight = 14;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);

        var context = settings.image.getContext("2d");
        context.strokeStyle = "black";
        context.fillStyle = "#958686";
        context.lineWidth = 2;
        context.fillRect(0, 0, settings.spritewidth, settings.spriteheight);
        context.strokeRect(0, 0, settings.spritewidth, settings.spriteheight);
        context.strokeRect(0, 0, settings.spritewidth, settings.spriteheight);

        this.parent(x, y, settings);
        this.floating = true;
        this.moving = false;
    },
    update: function() {
        if (this.parent_container.activated) {
            if (me.input.mouse.pos.x < this.parent_container.pos.x) {
                this.pos.x = this.parent_container.pos.x;
            } else if (me.input.mouse.pos.x > (this.parent_container.pos.x + 100)) {
                this.pos.s = this.parent_container.pos.x + 100;
            } else {
                this.pos.x = me.input.mouse.pos.x;
            }
            var value = this.pos.x - this.parent_container.pos.x;
            this.parent_container.func.setVolume(value);
            return true;
        }

        this.parent();
        return false;
    },
    onClick: function() {
        this.parent_container.activated = true;
    },
    mouseUp: function() {
        this.moving = false;
        this.parent_container.activated = false;
    }
});

game.gui.Background = me.ObjectEntity.extend({
    init: function() {
        settings = {};
        settings.spritewidth = game.screenWidth;
        settings.spriteheight = game.screenHeight;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);

        var context = settings.image.getContext('2d');
        context.fillStyle = "black";
        context.fillRect(0, 0, settings.spritewidth, settings.spriteheight);

        var bmf_font = new me.BitmapFont("geebeeyay-8x8", 8, 1.0)
        bmf_font.draw(context, "CHOOSE YOUR HERO", 125, 10);
        bmf_font.draw(context, "YOUR NAME", 60, 134);
        this.parent(0, 0, settings);
        this.floating = true;

    }
});

game.gui.TextInput = me.ObjectEntity.extend({
    focus: null,
    text: null,
    text_object: null,
    array: null,
    max_char: null,
    type_input: null,
    init: function(x, y, type, length) {
        this.type_input = type;
        this.max_char = length;
        settings = {};
        settings.spritewidth = 2 + (9 * this.max_char);
        settings.spriteheight = 15;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);
        var context = settings.image.getContext('2d');
        context.strokeStyle = "white";
        context.lineWidth = 2;
        context.strokeRect(0, 0, settings.spritewidth, settings.spriteheight);
        this.parent(x, y, settings);
        this.floating = true;
        this.text_object = new game.effects.BMF_Font(this.pos.x + 2, this.pos.y + 4, "");
        this.text_object.floating = true;
        me.game.add(this.text_object, game.LAYERS.TOP + 1);
        me.game.sort();

        if (this.type_input === "text") {
            this.text = "";
            me.input.bindKey(me.input.KEY.A, "A", true);
            me.input.bindKey(me.input.KEY.B, "B", true);
            me.input.bindKey(me.input.KEY.C, "C", true);
            me.input.bindKey(me.input.KEY.D, "D", true);
            me.input.bindKey(me.input.KEY.E, "E", true);
            me.input.bindKey(me.input.KEY.F, "F", true);
            me.input.bindKey(me.input.KEY.G, "G", true);
            me.input.bindKey(me.input.KEY.H, "H", true);
            me.input.bindKey(me.input.KEY.I, "I", true);
            me.input.bindKey(me.input.KEY.J, "J", true);
            me.input.bindKey(me.input.KEY.K, "K", true);
            me.input.bindKey(me.input.KEY.L, "L", true);
            me.input.bindKey(me.input.KEY.M, "M", true);
            me.input.bindKey(me.input.KEY.N, "N", true);
            me.input.bindKey(me.input.KEY.O, "O", true);
            me.input.bindKey(me.input.KEY.P, "P", true);
            me.input.bindKey(me.input.KEY.R, "R", true);
            me.input.bindKey(me.input.KEY.S, "S", true);
            me.input.bindKey(me.input.KEY.T, "T", true);
            me.input.bindKey(me.input.KEY.U, "U", true);
            me.input.bindKey(me.input.KEY.V, "V", true);
            me.input.bindKey(me.input.KEY.W, "W", true);
            me.input.bindKey(me.input.KEY.X, "X", true);
            me.input.bindKey(me.input.KEY.Y, "Y", true);
            me.input.bindKey(me.input.KEY.Z, "Z", true);
            me.input.bindKey(me.input.KEY.NUM0, "0", true);
            me.input.bindKey(me.input.KEY.NUM1, "1", true);
            me.input.bindKey(me.input.KEY.NUM2, "2", true);
            me.input.bindKey(me.input.KEY.NUM3, "3", true);
            me.input.bindKey(me.input.KEY.NUM4, "4", true);
            me.input.bindKey(me.input.KEY.NUM5, "5", true);
            me.input.bindKey(me.input.KEY.NUM6, "6", true);
            me.input.bindKey(me.input.KEY.NUM7, "7", true);
            me.input.bindKey(me.input.KEY.NUM8, "8", true);
            me.input.bindKey(me.input.KEY.NUM9, "9", true);
            me.input.bindKey(me.input.KEY.SPACE, "SPACE", true);
        } else if (this.type_input === "numbers") {
            if (typeof me.state.current().isGame() !== "undefined") {
                me.input.unbindKey(me.input.KEY.NUM0);
                me.input.unbindKey(me.input.KEY.NUM1);
                me.input.unbindKey(me.input.KEY.NUM2);
                me.input.unbindKey(me.input.KEY.NUM3);
                me.input.unbindKey(me.input.KEY.NUM4);
                me.input.unbindKey(me.input.KEY.NUM5);
                me.input.unbindKey(me.input.KEY.NUM6);
                me.input.unbindKey(me.input.KEY.NUM7);
                me.input.unbindKey(me.input.KEY.NUM8);
            }
            this.text = 0;
            me.input.bindKey(me.input.KEY.NUM0, "0", true);
            me.input.bindKey(me.input.KEY.NUM1, "1", true);
            me.input.bindKey(me.input.KEY.NUM2, "2", true);
            me.input.bindKey(me.input.KEY.NUM3, "3", true);
            me.input.bindKey(me.input.KEY.NUM4, "4", true);
            me.input.bindKey(me.input.KEY.NUM5, "5", true);
            me.input.bindKey(me.input.KEY.NUM6, "6", true);
            me.input.bindKey(me.input.KEY.NUM7, "7", true);
            me.input.bindKey(me.input.KEY.NUM8, "8", true);
            me.input.bindKey(me.input.KEY.NUM9, "9", true);
        }
        me.input.bindKey(me.input.KEY.ESC, "BACKSPACE", true);

        this.array = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    }, update: function() {
        if (this.type_input === "text" && this.text.length < 18) {
            for (var i = 0; i < this.array.length; i++) {
                if (me.input.isKeyPressed(this.array[i])) {
                    this.text = this.text + this.array[i];
                    this.text_object.text = this.text_object.text + this.array[i];
                }
            }

            if (me.input.isKeyPressed("SPACE")) {
                this.text = this.text + " ";
                this.text_object.text = this.text_object.text + " ";
            }

            if (me.input.isKeyPressed("BACKSPACE")) {
                this.text = this.text.substring(0, this.text.length - 1);
                this.text_object.text = this.text_object.text.substring(0, this.text_object.text.length - 1);
            }
        } else if (this.type_input === "numbers") {
            if (this.text_object.text.length < this.max_char) {
                if (me.input.isKeyPressed("0")) {
                    if (this.text > 0) {
                        this.text = this.text * 10;

                    }
                } else if (me.input.isKeyPressed("1")) {
                    this.text = this.text * 10;
                    this.text = this.text + 1;
                } else if (me.input.isKeyPressed("2")) {
                    this.text = this.text * 10;
                    this.text = this.text + 2;
                } else if (me.input.isKeyPressed("3")) {
                    this.text = this.text * 10;
                    this.text = this.text + 3;
                } else if (me.input.isKeyPressed("4")) {
                    this.text = this.text * 10;
                    this.text = this.text + 4;
                } else if (me.input.isKeyPressed("5")) {
                    this.text = this.text * 10;
                    this.text = this.text + 5;
                } else if (me.input.isKeyPressed("6")) {
                    this.text = this.text * 10;
                    this.text = this.text + 6;
                } else if (me.input.isKeyPressed("7")) {
                    this.text = this.text * 10;
                    this.text = this.text + 7;
                } else if (me.input.isKeyPressed("8")) {
                    this.text = this.text * 10;
                    this.text = this.text + 8;
                } else if (me.input.isKeyPressed("9")) {
                    this.text = this.text * 10;
                    this.text = this.text + 9;
                }
                this.text_object.text = this.text.toString();
            }
            if (me.input.isKeyPressed("BACKSPACE")) {
                if (this.text_object.text.length > 1) {
                    this.text_object.text = this.text_object.text.substring(0, this.text_object.text.length - 1);
                    this.text = parseInt(this.text_object.text);
                } else {
                    this.text_object.text = "0";
                    this.text = 0;
                }
            }
        }

        this.parent();
        return false;
    }, onDestroyEvent: function() {
        if (this.type_input === "text") {
            me.input.unbindKey(me.input.KEY.A);
            me.input.unbindKey(me.input.KEY.B);
            me.input.unbindKey(me.input.KEY.C);
            me.input.unbindKey(me.input.KEY.D);
            me.input.unbindKey(me.input.KEY.E);
            me.input.unbindKey(me.input.KEY.F);
            me.input.unbindKey(me.input.KEY.G);
            me.input.unbindKey(me.input.KEY.H);
            me.input.unbindKey(me.input.KEY.I);
            me.input.unbindKey(me.input.KEY.J);
            me.input.unbindKey(me.input.KEY.K);
            me.input.unbindKey(me.input.KEY.L);
            me.input.unbindKey(me.input.KEY.M);
            me.input.unbindKey(me.input.KEY.N);
            me.input.unbindKey(me.input.KEY.O);
            me.input.unbindKey(me.input.KEY.P);
            me.input.unbindKey(me.input.KEY.Q);
            me.input.unbindKey(me.input.KEY.R);
            me.input.unbindKey(me.input.KEY.S);
            me.input.unbindKey(me.input.KEY.T);
            me.input.unbindKey(me.input.KEY.U);
            me.input.unbindKey(me.input.KEY.V);
            me.input.unbindKey(me.input.KEY.W);
            me.input.unbindKey(me.input.KEY.X);
            me.input.unbindKey(me.input.KEY.Y);
            me.input.unbindKey(me.input.KEY.Z);
            me.input.unbindKey(me.input.KEY.NUM0);
            me.input.unbindKey(me.input.KEY.NUM1);
            me.input.unbindKey(me.input.KEY.NUM2);
            me.input.unbindKey(me.input.KEY.NUM3);
            me.input.unbindKey(me.input.KEY.NUM4);
            me.input.unbindKey(me.input.KEY.NUM5);
            me.input.unbindKey(me.input.KEY.NUM6);
            me.input.unbindKey(me.input.KEY.NUM7);
            me.input.unbindKey(me.input.KEY.NUM8);
            me.input.unbindKey(me.input.KEY.NUM9);
            me.input.unbindKey(me.input.KEY.SPACE);
        } else if (this.type_input === "numbers") {
            me.input.unbindKey(me.input.KEY.NUM0);
            me.input.unbindKey(me.input.KEY.NUM1);
            me.input.unbindKey(me.input.KEY.NUM2);
            me.input.unbindKey(me.input.KEY.NUM3);
            me.input.unbindKey(me.input.KEY.NUM4);
            me.input.unbindKey(me.input.KEY.NUM5);
            me.input.unbindKey(me.input.KEY.NUM6);
            me.input.unbindKey(me.input.KEY.NUM7);
            me.input.unbindKey(me.input.KEY.NUM8);
            me.input.unbindKey(me.input.KEY.NUM9);

            if (typeof me.state.current().isGame() !== "undefined") {
                me.input.bindKey(me.input.KEY.NUM1, "belt1", true);
                me.input.bindKey(me.input.KEY.NUM2, "belt2", true);
                me.input.bindKey(me.input.KEY.NUM3, "belt3", true);
                me.input.bindKey(me.input.KEY.NUM4, "belt4", true);
                me.input.bindKey(me.input.KEY.NUM5, "belt5", true);
                me.input.bindKey(me.input.KEY.NUM6, "belt6", true);
                me.input.bindKey(me.input.KEY.NUM7, "belt7", true);
                me.input.bindKey(me.input.KEY.NUM8, "belt8", true);
            }
        }
        me.input.unbindKey(me.input.KEY.ESC);
        me.game.remove(this.text_object);
        this.text_object = null;
    }
});


game.gui.MoneyInput = me.ObjectEntity.extend({
    where: null,
    input: null,
    button: null,
    money_icon: null,
    init: function(x, y, where) {
        this.where = where;

        settings = {};
        settings.spritewidth = 150;
        settings.spriteheight = 50;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);

        var context = settings.image.getContext('2d');
        context.fillStyle = "#958686";
        context.strokeStyle = "black";
        context.lineWidth = 2;

        context.fillRect(0, 0, settings.spritewidth, settings.spriteheight);
        context.strokeRect(0, 0, settings.spritewidth, settings.spriteheight);
        this.parent(x, y, settings);
        this.floating = true;

        this.money_icon = new game.Icon(x + 15, y + 5, "money-1");
        me.game.add(this.money_icon, game.LAYERS.TOP);
        this.input = new game.gui.TextInput(x + 30, y + 5, "numbers", 10);
        me.game.add(this.input, game.LAYERS.TOP);
        this.button = new game.gui.FuncButton(x + 50, y + 30, "Ok", "", this, "onSubmit");
        me.game.add(this.button, game.LAYERS.TOP);
        me.game.sort();
    }, onDestroyEvent: function() {
        me.game.remove(this.input);
        this.input = null;
        me.game.remove(this.button);
        this.button = null;
        me.game.remove(this.money_icon);
        this.money_icon = null;
    }, onSubmit: function() {
        if (this.where === "inventory") {
            var value = this.input.text;
            if (me.gamestat.getItemValue("stash_money") >= value) {
                me.gamestat.updateValue("stash_money", -value);
                me.gamestat.updateValue("money", value);
            } else {
                me.gamestat.updateValue("money", me.gamestat.getItemValue("stash_money"));
                me.gamestat.setValue("stash_money", 0);
            }
        } else {
            console.log("to stash");
            var value = this.input.text;
            if (me.gamestat.getItemValue("money") >= value) {
                me.gamestat.updateValue("money", -value);
                me.gamestat.updateValue("stash_money", value);
            } else {
                me.gamestat.updateValue("stash_money", me.gamestat.getItemValue("money"));
                me.gamestat.setValue("money", 0);
            }
        }
        me.game.remove(this);
        game.instances.stash.modal = null;
    }
});

game.gui.Options = game.gui.Window.extend({
    entity_layers: null,
    checkboxes: null,
    buttons: null,
    sliders: null,
    init: function() {
        this.checkboxes = {};
        this.buttons = {};
        this.sliders = {};
        this.parent(20, 10, 300, 170);
        var context = this.renderable.image.getContext("2d");
        game.fonts.white.draw(context, "Enable sounds", 20, 20);
        var bmf = new me.BitmapFont("geebeeyay-8x8", 8, 1.0);
        bmf.draw(context, "OPTIONS", (300 - bmf.measureText(context, "OPTIONS").width) / 2, 5);
        this.checkboxes.enable_sound = new game.gui.CheckBox(45, 43, me.audio.isAudioEnable(), game.instances.audio.switchEnable);
        me.game.add(this.checkboxes.enable_sound, game.LAYERS.TOP + 1);
        game.fonts.white.draw(context, "Music volume", 20, 50);
        this.sliders.ambient = new game.gui.SliderContainer(45, 72, parseInt(game.instances.audio.channels.ambient.volume * 100), game.instances.audio.channels.ambient);
        me.game.add(this.sliders.ambient, game.LAYERS.TOP + 1);
        game.fonts.white.draw(context, "Effects volume", 20, 78);
        this.sliders.effects = new game.gui.SliderContainer(45, 100, parseInt(game.instances.audio.channels.effects.volume * 100), game.instances.audio.channels.effects);
        me.game.add(this.sliders.effects, game.LAYERS.TOP + 1);
        this.buttons.save = new game.gui.FuncButton(30, 160, "Save", "", null, game.mechanic.save_settings);
        me.game.add(this.buttons.save, game.LAYERS.TOP + 1);


        me.game.sort();
    },
    onDestroyEvent: function() {
        this.parent();

        me.game.remove(this.checkboxes.enable_sound);
        this.checkboxes.enable_sound = null;
        this.checkboxes = null;
        me.game.remove(this.buttons.save);
        this.buttons.save = null;
        this.buttons = null;
        me.game.remove(this.sliders.ambient);
        this.sliders.ambient = null;
        me.game.remove(this.sliders.effects);
        this.sliders.effects = null;
        this.sliders = null;
    }
});