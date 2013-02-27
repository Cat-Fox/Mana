var Sparks = me.ObjectEntity.extend ({
    init: function(x, y){
        settings = {};
        settings.image = "sparks";
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        this.parent(x, y, settings);
        this.addAnimation("idle", [0,1,2,3,4]);
        this.setCurrentAnimation("idle");
        this.time = me.timer.getTime();
    }
});