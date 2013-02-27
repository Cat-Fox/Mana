var Guard = me.ObjectEntity.extend ({
    sparks: null,
    time: null,
    init: function(x, y, settings){
        this.parent(x, y, settings);
        this.collidable = true;
        this.addAnimation("idle", [0,1], 30);
        this.setCurrentAnimation("idle");
        this.type = "npc";
        this.updateColRect(5,17,2,18);
        me.input.registerMouseEvent('mousemove', this.collisionBox, this.createSparks.bind(this));
    },
    onCollision: function(){
        //me.game.add((new TextBubble(this.pos.x - 20,this.pos.y - 10)));
        me.game.sort();
    },
    createSparks: function(){
        if(this.sparks == null){
            this.sparks = new Sparks(this.pos.x, this.pos.y)
            me.game.add(this.sparks, 4);
            me.game.sort();
            this.time = me.timer.getTime();
        }
    },
    update: function(){
        if((this.spark != null) && ((me.timer.getTime() - this.time) > 2500)){
            me.game.remove(this.sparks);
            this.sparks = null;
        }
        this.parent();
    }
});