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
            if (this.tile_type === "shop") {
                object = game.instances.shop_items[this.id];
            } else {
                object = me.gamestat.getItemValue(this.tile_type)[this.id];
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
        context.fillRect(0, 0, 40, 40);
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
                this.createIconNPC();
                break;
            case "PLAYER":
                this.human_icon = new game.gui.HumanIcon(this.pos.x + 5, this.pos.y + 2, "predefined");
                me.game.add(this.human_icon, game.guiLayer + 1);
                me.game.sort();
                break;
            case "QUESTION":
                this.createIconNPC();
                break;
            default:
                this.createIconNPC();
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
        if (this.option_object !== null) {
            me.game.remove(this.option_object);
            this.option_object = null;
        }
    }, createIconNPC: function() {
        this.human_icon = new game.gui.NPCIcon(this.pos.x + 8, this.pos.y + 8, this.dialog.npc_image, this.dialog.image_size, this.dialog.anim_length);
        me.game.add(this.human_icon, game.LAYERS.GUI + 1);
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

game.mechanic.set_enemy_panel = function(name, percent) {
    if (game.instances.enemy_panel === null) {
        game.instances.enemy_panel = new game.gui.EnemyPanel();
        me.game.add(game.instances.enemy_panel, game.guiLayer);
        me.game.sort();
    }

    game.instances.enemy_panel.setName(name);
    game.instances.enemy_panel.onUpdate(percent);
};

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
        return true;
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