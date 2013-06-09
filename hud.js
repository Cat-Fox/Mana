var HP = me.HUD_Item.extend({
    max: 100,
    min: 0,
    init: function(x, y, settings) {
        console.log("creating HUD HP");
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
        console.log("creating HUD EnemyHP");
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