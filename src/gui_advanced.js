game.gui.StatsBar = me.ObjectEntity.extend({
    percent: null,
    subscribe_exp: null,
    subscribe_mana: null,
    mana_text: null,
    mana_tooltip: null,
    exp_tooltip: null,
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

        this.mana_text = new game.gui.SmallText(310, 209, "0", game.fonts.magic_blue);
        this.mana_text.floating = true;
        me.game.add(this.mana_text, game.LAYERS.GUI + 1);
        console.log(this.mana_text.pos.x + " " + this.mana_text.pos.y);
        me.game.sort();

        this.mana_tooltip = null;
        this.exp_tooltip = null;
        
        this.subscribe_exp = me.event.subscribe("/player/exp", function(a) {
            game.instances.exp_bar.onUpdateExp(a);
        });
        this.subscribe_mana = me.event.subscribe("/player/mana", function(a) {
            game.instances.exp_bar.onUpdateMana(a);
        });
    },
    update: function() {
        var trigger_mana = false;
        if (me.input.mouse.pos.x >= 310 && me.input.mouse.pos.x <= 370) {
            if (me.input.mouse.pos.y >= 209 && me.input.mouse.pos.y <= 220) {
                trigger_mana = true;
            }
        }
        
        var trigger_exp = false;
        if (me.input.mouse.pos.x >= 305 && me.input.mouse.pos.x <= 395) {
            if (me.input.mouse.pos.y >= 204 && me.input.mouse.pos.y <= 208) {
                trigger_exp = true;
            }
        }

        if (trigger_exp) {
            if(this.exp_tooltip === null){
                this.exp_tooltip = new game.DropTooltip(310, 200, "Exp: " + me.gamestat.getItemValue("exp") + "/" + me.gamestat.getItemValue("next_level"), "normal");
                me.game.add(this.exp_tooltip, game.LAYERS.GUI + 2);
                me.game.sort();
            }
        } else {
            if(this.exp_tooltip !== null){
                me.game.remove(this.exp_tooltip);
                this.exp_tooltip = null;
            }
        }

        if (trigger_mana) {
            if(this.mana_tooltip === null){
                this.mana_tooltip = new game.DropTooltip(310, 200, "Amount of Mana", "normal");
                me.game.add(this.mana_tooltip, game.LAYERS.GUI + 2);
                me.game.sort();
            }
        } else {
            if(this.mana_tooltip !== null){
                me.game.remove(this.mana_tooltip);
                this.mana_tooltip = null;
            }
        }


        this.parent();
        return false;
    },
    onUpdateExp: function(exp) {
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
    },
    onUpdateMana: function(mana) {
        this.mana_text.text = "Mana: " + mana.toString();
    },
    onDestroyEvent: function() {
        me.event.unsubscribe(this.subscribe_exp);
        me.event.unsubscribe(this.subscribe_mana);
        me.game.remove(this.mana_text);
        this.mana_text = null;
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

game.gui.Shop = game.gui.Window.extend({
    shop_tiles: null,
    selected_tile: null,
    inventory_tiles: null,
    inventory_money: null,
    entity_layer: null,
    human_icon: null,
    items: null,
    init: function(shop) {
        game.instances.shop_items = game.mechanic.generateShop("blacksmith", 48, 300);
        game.mechanic.shop_sort();
        this.selected_tile = null;
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
        this.parent();
        if (this.selected_tile !== null) {
            for (var row = 0; row < this.inventory_tiles.length; row++) {
                for (var column = 0; column < this.inventory_tiles[row].length; column++) {
                    this.inventory_tiles[row][column].mouseUp();
                }
            }
        }
    }
});

game.gui.Options = game.gui.Window.extend({
    entity_layers: null,
    checkboxes: null,
    buttons: null,
    sliders: null,
    init: function(menu) {
        this.checkboxes = {};
        this.buttons = {};
        this.sliders = {};
        this.parent(20, 10, 300, 170, menu);
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