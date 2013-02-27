var HP = me.HUD_Item.extend ({
    max: 100,
    min: 0,
    init: function(x, y, settings){
        this.parent(x, y, settings);
        this.font = new me.Font("Arial", 9, "red");
    }, 
    
    draw: function(context, x, y){
        this.font.draw (context, this.value, this.pos.x +x, this.pos.y +y);
    }/*,
    update: function(value){
        if((this.value + value) < this.max){
            this.value = this.value + value;
        }  
    }*/
});
