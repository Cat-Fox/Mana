var Guard = me.ObjectEntity.extend({
    sparks: null,
    time: null,
    hp: 100,
    target: null,
    shadow: null,
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.collidable = true;
        this.addAnimation("idle", [0, 1], 35);
        this.setCurrentAnimation("idle");
        this.type = "npc";
        this.updateColRect(5, 17, 2, 18);

        this.shadow = new Shadow(this.pos.x + 6, this.pos.y + 8);
        me.game.add(this.shadow, 4);
        me.game.sort();
    },
    update: function() {
        var targeted = false;
        
        var res = me.game.collide(this);
        if (res) {         
            if (res.obj.type === "human_target") {
                targeted = true;
                me.game.HUD.setItemValue("EnemyHP", this.hp + ";guard;ally");
                if (this.target === null) {
                    this.target = new Target(this.pos.x + 6, this.pos.y + 8, "green");
                    me.game.add(this.target, 3);
                    me.game.sort();
                }
            }
        }
        
        if(targeted === false && this.target !== null){
            me.game.remove(this.target);
            this.target = null;
        }

        this.parent();
        return true;
    },
    onDestroyEvent: function() {
        me.input.releaseMouseEvent('mousemove', this.collisionBox);
        //shadow will always be created, but target is dependent on update function
        me.game.remove(this.shadow);
        //me.game.remove(this.target);
    },
    createSparks: function() {
        if (this.sparks === null) {
            this.sparks = new Sparks(this.pos.x, this.pos.y);
            me.game.add(this.sparks, 4);
            me.game.sort();
            this.time = me.timer.getTime();
        }
    }
});