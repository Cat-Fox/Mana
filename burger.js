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
