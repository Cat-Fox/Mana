game.gui.Journal = game.gui.InventoryWindow.extend({
    init: function() {
        this.parent("journal");

        var context = this.renderable.image.getContext('2d');
        game.fonts.basic.draw(context, "Journal", 150, 7);
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
        this.checkboxes.helmet = new game.gui.CheckBox(this.pos.x + 20, this.pos.y + 160, me.gamestat.getItemValue("helmet"), game.mechanic.switch_helmet);
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
        game.instances.backpack = this;
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