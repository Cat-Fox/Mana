var Shadow = me.ObjectEntity.extend ({
    init: function(x, y){
        settings = {};
        settings.image = "shadow16";
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        this.parent(x, y, settings);
    } 
});
