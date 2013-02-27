var TextBubble = me.GUI_Object.extend ({
    init: function(x, y){
        settings = {}
        settings.spritewidth = 100;
        settings.spriteheight = 20;
        this.parent(x, y, settings);
        this.font = new me.Font("Arial", 8, "black");
        this.value = "Hello!"
    }, 
    
    draw: function(context, x, y){
        this.font.draw (context, this.value, this.pos.x +x, this.pos.y +y);
    }
})
