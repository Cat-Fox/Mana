var Rat = me.ObjectEntity.extend({
    hp: 30,
    shadow: null,
    target: null,
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.collidable = true;
        this.addAnimation("idle_right", [18, 19], 30);
        this.addAnimation("idle_top", [36, 37, 38, 39], 30);
        this.addAnimation("idle_down", [55, 56, 57, 58], 30);
        this.addAnimation("walk_right", [12, 13, 14], 30);
        this.addAnimation("walk_down", [49, 50, 51, 52], 30);
        this.addAnimation("walk_up", [30, 31, 32, 33], 30);
        this.addAnimation("attack_right", [6, 7, 8, 9, 10, 11]);
        this.addAnimation("attack_top", [24, 25, 26, 27]);
        this.addAnimation("attack_down", [42, 43, 44, 45]);
        this.addAnimation("die", [0, 1, 2, 3, 4], 20);
        this.type = me.game.ENEMY_OBJECT;
        this.setCurrentAnimation("idle_right");
        this.updateColRect(15, 18, 18, 12);

        this.shadow = new Shadow(this.pos.x + 15, this.pos.y + 15);
        me.game.add(this.shadow, 4);
        me.game.sort();
    },
    onDestroyEvent: function() {
        this.collidable = false;
        me.game.remove(this.shadow);
    },
    update: function() {
        if (this.getCurrentAnimationFrame() === 4) {
            me.game.remove(this);
        }
        var targeted = false;
        var res = me.game.collide(this);
        if (res) {
            if (res.obj.type === "human_attack") {
                this.hurt(5);
                me.game.getEntityByGUID(me.gamestat.getItemValue("player")).destroyAttack();
            }
            if (res.obj.type === "human_target") {
                targeted = true;
                me.game.HUD.setItemValue("EnemyHP", this.hp + ";rat;enemy");
                if (this.target === null) {
                    this.target = new Target(this.pos.x + 15, this.pos.y + 16, "red");
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
    hurt: function(value) {
        this.hp = this.hp - value;
        if (this.hp <= 0) {
            this.setCurrentAnimation("die");
            me.game.getEntityByGUID(me.gamestat.getItemValue("player")).updateEXP(15);
        } else {
            this.flicker(20);
        }
    }
});