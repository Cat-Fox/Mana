game.SmallText = me.ObjectEntity.extend({
    text: null,
    font_o: null,
    init: function(x, y, text, font, size, color) {
        settings = {};
        settings.spritewidth = 0;
        settings.spriteheight = 0;
        this.parent(x, y, settings);
        this.font_o = new me.Font(font, size, color);
        this.text = text;
        //console.log("creating SmallText " + this.pos.x + " " + this.pos.y);
    },
    draw: function(context) {
        this.font_o.draw(context, this.text, this.pos.x, this.pos.y);
    },
    onDestroyEvent: function() {
        delete this.font_o;
    }
});

game.BigText = me.ObjectEntity.extend({
    text: null,
    font: null,
    timer: 2500,
    timer_run: null,
    init: function(text) {
        settings = {};
        settings.spritewidth = 0;
        settings.spriteheight = 0;
        var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
        this.parent(0,0, settings);
        this.text = text;
        this.timer_run = me.timer.getTime();
        this.font = new me.BitmapFont("geebeeyay-8x8", 8, 1.0);
        this.floating = true;
        console.log("Creating Big Text");
    }, draw: function(context) {
        this.parent(context);
        var size = this.font.measureText(context, this.text);
        var x = (game.screenWidth / 2) - (size.width / 2);
        var y = (game.screenHeight / 2)  - (size.height / 2);
        this.font.draw(context, this.text, x, y);
    }, update: function() {
        if (me.timer.getTime() > (this.timer_run + this.timer)) {
            me.game.remove(this);
            console.log("DESTROY");
        }
        
        this.parent();
        return true;
    }, onDestroyEvent: function() {
        delete this.font;
    }
});

game.HitText = game.SmallText.extend({
    timer: 0,
    local_pos: null,
    slower: null,
    direction: null,
    start_pos: null,
    init: function(x, y, text, font, size, color) {
        this.parent(x, y, text, font, size, color);
        this.local_pos = new me.Vector2d(0, 0);
        this.slower = true;
        this.direction = Number.prototype.random(0, 1);
    },
    update: function() {
        if (this.local_pos.x >= 20) {
            me.game.remove(this);
        }
        if (this.slower) {
            if (this.direction === 1) {
                this.pos.x += this.local_pos.x;
            } else {
                this.pos.x -= this.local_pos.x;
            }
            this.pos.y += this.local_pos.y;
            this.local_pos.x += 1;
            this.local_pos.y = 20 - Math.floor(Math.abs(Math.pow(this.local_pos.x, 2)) / 12);
            if (this.direction === 1) {
                this.pos.x -= this.local_pos.x;
            } else {
                this.pos.x += this.local_pos.x;
            }
            this.pos.y = this.pos.y - this.local_pos.y;
        }
        this.slower = !this.slower;
        this.parent();
        return true;
    }
});