var Burger = me.CollectableEntity.extend ({
    shadow : null,
    init: function(x, y, settings){
        this.parent(x, y, settings);
        this.addAnimation("always", [0,1,2,3,4,5]);
        this.setCurrentAnimation("always");
        this.shadow = new Shadow(this.pos.x,this.pos.y+7);
        me.game.add(this.shadow, 4);
        me.game.sort();
    },
    
    onCollision: function(){
        me.audio.play("itempick2");
        me.game.remove(this.shadow);
        me.game.remove(this);
        me.game.HUD.updateItemValue("HP", 15);
        this.collidable = false;
    }
    
});

var Target = me.ObjectEntity.extend ({
    init: function(x, y, colour){
        settings = {};
        settings.image = "target";
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        this.parent(x, y, settings);
        this.addAnimation("green", [0,1,2,3]);
        this.addAnimation("red", [0,1,2,3]);
        this.setCurrentAnimation(colour);
    }
});

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

var Shadow = me.ObjectEntity.extend ({
    init: function(x, y){
        settings = {};
        settings.image = "shadow16";
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        this.parent(x, y, settings);
    } 
});

