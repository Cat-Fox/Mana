var HP = me.HUD_Item.extend({
    max: 100,
    min: 0,
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        //this.font = new me.Font("Arial", 9, "red");
        this.font = new me.BitmapFont("8x8Font", 8);
    },
    draw: function(context, x, y) {
        var text = "HP " + this.value + " EXP " + me.gamestat.getItemValue("exp");
        this.font.draw(context, text, this.pos.x + x + this.font.measureText(text).width, this.pos.y + y);
    }
});

var TextHUD = me.HUD_Item.extend({
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.font = new me.BitmapFont("8x8Font", 8);
    },
    draw: function(context, x, y) {
        var text = this.value.split("\n");
        //JS foreach, omg
        var line_height = this.font.measureText(text[0]);
        for (var i = 0; i < xx; i++) {
            this.font.draw(context, text[i], this.pos.x + x, this.pos.y + y + (line_height * i));
        }
    }
});

var EnemyHP = me.HUD_Item.extend({
    textValue: null,
    intValue: null,
    colour: null,
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.font = {};
        this.font['enemy'] = new me.Font("Arial", 9, "red");
        this.font['ally'] = new me.Font("Arial", 9, "green");
        this.value = "0; ;enemy";
    },
    draw: function(context, x, y) {
        var data = this.value.split(";");
        this.intValue = parseInt(data[0]);
        this.textValue = data[1];
        this.colour = data[2];
        if (this.textValue !== " ") {
            this.font[this.colour].draw(context, this.intValue + " " + this.textValue, this.pos.x + x, this.pos.y + y);
        }
    }
});

//TODO
var InventoryTile = me.GUI_Object.extend({
    id: null,
    icon: null,
    type: null,
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
    },
    onClick: function() {
        var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
        if (this.type === "weapon") {
            player.equipWeapon(this.id);
        }
    },
    changeMode: function() {
        if (this.type === "weapon") {
            if (this.icon.isCurrentAnimation("active")) {
                this.icon.setCurrentAnimation("inactive");
            } else {
                this.icon.setCurrentAinamtion("active");
            }
        }
    },
    update: function() {
        if (this.icon === null && me.gamestat.getItemValue("inventory")[this.id] !== null) {
            if (me.gamestat.getItemValue("inventory")[this.id] === "item-sword1") {
                this.icon = new Icon(this.pos.x, this.pos.y, "item-sword1");
                this.type = "weapon";
                me.game.add(this.icon, 8);
                me.game.sort();
            }
        }
        this.parent();
    }

});

var InventoryItems = me.HUD_Item.extend({
    tiles: null,
    init: function(x, y) {
        this.tiles = new Array(4);
        for (var i = 0; i < 4; i++) {
            this.tiles[i] = new Array(4);
        }
        this.parent(x, y);
        for (var row = 0; row < 4; row++) {
            for (var column = 0; column < 4; column++) {
                this.tiles[row][column] = new InventoryTile(this.pos.x + (column * 16), this.pos.y + (row * 16), (row * 4) + column);
                me.game.add(this.tiles[row][column], 7);
            }
        }
        me.game.sort();
    },
    update: function(value) {
        console.log(value + " change mode");
        this.tiles[value].changeMode();
        this.updated = true;
        return true;
    }
});

var Icon = me.AnimationSheet.extend({
    init: function(x, y, image) {
        this.parent(x, y, me.loader.getImage(image), 16, 16);
        this.floating = true;
        this.isPersistent = true;
        this.addAnimation("active", [0, 1, 2, 3, 4]);
        this.addAnimation("inactive", [2]);
        this.setCurrentAnimation("inactive");
    }
});