game.Rat = me.ObjectEntity.extend({
    max_hp: 30,
    hp: 30,
    shadow: null,
    target: null,
    attacked: false,
    attack_box: null,
    attacking: true,
    dying: false,
    attack: 2,
    armor: 0,
    rat_text: null,
    targeted: false,
    use_targeted: false,
    init: function(x, y, settings) {
        console.log("creating rat");
        this.parent(x, y, settings);
        this.collidable = true;
        this.renderable.addAnimation("iddle_right", [18, 19], 30);
        this.renderable.addAnimation("iddle_top", [36, 37, 38, 39], 30);
        this.renderable.addAnimation("iddle_down", [55, 56, 57, 58], 30);
        this.renderable.addAnimation("walk_right", [12, 13, 14], 30);
        this.renderable.addAnimation("walk_down", [49, 50, 51, 52], 30);
        this.renderable.addAnimation("walk_up", [30, 31, 32, 33], 30);
        this.renderable.addAnimation("attack_right", [6, 7, 8, 9, 10, 11], 5);
        this.renderable.addAnimation("attack_top", [24, 25, 26, 27], 5);
        this.renderable.addAnimation("attack_down", [42, 43, 44, 45], 5);
        this.renderable.addAnimation("die", [0, 0, 1, 2, 3, 4, 4, 4], 7);
        this.type = me.game.ENEMY_OBJECT;
        this.renderable.setCurrentAnimation("iddle_right");
        this.updateColRect(15, 18, 18, 12);

        this.shadow = new game.Shadow(this.pos.x + 15, this.pos.y + 15);
        me.game.add(this.shadow, 4);
        me.game.sort();

        this.rat_text = new me.Font("Arial", "1em", "white");
    },
    onDestroyEvent: function() {
        this.collidable = false;
        me.game.remove(this.shadow);
    },
    draw: function(context) {
        this.parent(context);
        if(this.targeted){
            this.rat_text.draw(context, this.hp+"/"+this.max_hp, this.pos.x + (this.renderable.width / 4), this.pos.y + (this.renderable.height / 1.5));
        }
        if(this.use_targeted){
            this.rat_text.draw(context, "sqeeak!", this.pos.x + (this.renderable.width / 4), this.pos.y);
        }
    },
    update: function() {
        if (this.renderable.getCurrentAnimationFrame() === 7 && this.renderable.isCurrentAnimation("die")) {
            me.game.remove(this);
        }
        if (this.attacked) {
            var this_vector = new me.Vector2d(this.pos.x + (this.renderable.width / 2), this.pos.y + (this.renderable.height / 2));
            var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
            var player_vector = new me.Vector2d(player.pos.x + (player.width / 2), player.pos.y + (player.height / 2));
            var angle = (this_vector.angle(player_vector) * (180 / Math.PI));

            if (angle <= 45 && angle >= -45) {
                //right
                this.renderable.setCurrentAnimation("attack_right");
                this.flipX(false);
            } else if (angle < -45 && angle >= -120) {
                //top
                this.renderable.setCurrentAnimation("attack_top");
            } else if ((angle < -120 && angle >= -180) || (angle > 120 && angle <= 180)) {
                //right_flipped
                this.renderable.setCurrentAnimation("attack_right");
                this.flipX(true);
            } else if (angle > 45 && angle <= 120) {
                //down
                this.renderable.setCurrentAnimation("attack_down")
            }

        }
        this.targeted = false;
        this.use_targeted = false;
        var res = me.game.collide(this, true);
        if (res.length >= 1 && this.dying === false) {
            for (var i = 0; i < res.length; i++) {
                if (res[i].obj.type === "human_attack") {
                    var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
                    this.hurt(player.countDMG(this.armor));
                    player.destroyAttack();
                }
                if (res[i].obj.type === "human_target") {
                    this.targeted = true;
                    // TODO:CHANGE
                    //me.game.HUD.setItemValue("EnemyHP", this.hp + ";rat;enemy");
                    if (this.target === null) {
                        this.target = new game.Target(this.pos.x + 15, this.pos.y + 16, "red");
                        me.game.add(this.target, 3);
                        me.game.sort();
                    }
                }
                if (res[i].obj.type === "human_use"){
                    this.use_targeted = true;
                }
            }
        }

        if (this.targeted === false && this.target !== null) {
            me.game.remove(this.target);
            this.target = null;
        }
        this.parent();
        return true;
    },
    hurt: function(value) {
        this.hp = this.hp - value;
        if (!this.dying) {
            if (this.hp <= 0) {
                this.renderable.setCurrentAnimation("die");
                me.game.getEntityByGUID(me.gamestat.getItemValue("player")).updateEXP(30);
                this.attacking = false;
                this.attacked = false;
                this.dying = true;
            } else {
                this.renderable.flicker(20);
                if (this.attacked === false) {
                    this.attacked = true;
                    smile = new game.Smile(this.pos.x + (this.renderable.width / 2), this.pos.y, "kill");
                    me.game.add(smile, 3);
                    me.game.sort();
                }
            }
        }
    }
});