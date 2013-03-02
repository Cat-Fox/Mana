var HP = me.HUD_Item.extend({
    max: 100,
    min: 0,
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.font = new me.Font("Arial", 9, "red");
    },
    draw: function(context, x, y) {
        this.font.draw(context, this.value, this.pos.x + x, this.pos.y + y);
    }/*,
     update: function(value){
     if((this.value + value) < this.max){
     this.value = this.value + value;
     }  
     }*/
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
