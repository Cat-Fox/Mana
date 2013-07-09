game.destroyable.Barrel = me.ObjectEntity.extend({
    target_box: null,
    destryoing: null,
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.image = "barrel";
        this.parent(x, y, settings);
        this.renderable.addAnimation("inactive", [0]);
        this.renderable.addAnimation("destroy", [0, 1, 2, 3, 4], 3);
        this.renderable.setCurrentAnimation("inactive");
        this.destroying = false;
        this.collidable = true;
        this.type = "solid_object"
    }, update: function() {
        if (this.destroying) {
            if (this.renderable.getCurrentAnimationFrame() === 4) {
                me.game.remove(this);
                this.collidable = false;
            }
        }

        var res = me.game.collide(this, true);
        var targeted = false;
        if (res.length >= 1) {
            for (var i = 0; i < res.length; i++) {
                //this is quite horrible solution
                if (res[i].obj.type === "human_target") {
                    targeted = true;
                } else if (res[i].obj.type === "human_use") {
                    this.onUse();
                } else if (res[i].obj.type === "human_attack") {
                    if (this.destroying === false) {
                        this.destroying = true;
                        this.renderable.setCurrentAnimation("destroy");
                    }
                }
            }
        }

        if (targeted) {
            this.showTargetBox();
        } else {
            this.destroyTargetBox();
        }
        
        this.parent();
        return true;
    },
    showTargetBox: function() {
        if (this.target_box === null) {
            this.target_box = new game.Target(this.pos.x, this.pos.y + 3, "red");
            me.game.add(this.target_box, this.z - 1);
            me.game.sort();
        }
    },
    destroyTargetBox: function() {
        if (this.target_box !== null) {
            me.game.remove(this.target_box);
            this.target_box = null;
        }
    },
    onUse: function() {
    },
    onDestroyEvent: function() {
        this.destroyTargetBox();
    },
    dropLoot: function(){
        
    }
});