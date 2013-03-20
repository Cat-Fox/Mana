var Rat = me.ObjectEntity.extend({
    hp: 30,
    shadow: null,
    target: null,
    attacked: false,
    attack_box: null,
    attacking: true,
    dying: false,
    attack: 2,
    armor: 0,
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.collidable = true;
        this.addAnimation("iddle_right", [18, 19], 30);
        this.addAnimation("iddle_top", [36, 37, 38, 39], 30);
        this.addAnimation("iddle_down", [55, 56, 57, 58], 30);
        this.addAnimation("walk_right", [12, 13, 14], 30);
        this.addAnimation("walk_down", [49, 50, 51, 52], 30);
        this.addAnimation("walk_up", [30, 31, 32, 33], 30);
        this.addAnimation("attack_right", [6, 7, 8, 9, 10, 11], 5);
        this.addAnimation("attack_top", [24, 25, 26, 27], 5);
        this.addAnimation("attack_down", [42, 43, 44, 45], 5);
        this.addAnimation("die", [0, 1, 2, 3, 4], 16);
        this.type = me.game.ENEMY_OBJECT;
        this.setCurrentAnimation("iddle_right");
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
        if (this.getCurrentAnimationFrame() === 4 && this.isCurrentAnimation("die")) {
            me.game.remove(this);
        }
        if (this.attacked) {
            var this_vector = new me.Vector2d(this.pos.x + (this.width / 2), this.pos.y + (this.height / 2));
            var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
            var player_vector = new me.Vector2d(player.pos.x + (player.width / 2), player.pos.y + (player.height / 2));
            var angle = (this_vector.angle(player_vector) * (180 / Math.PI));

            if (angle <= 45 && angle >= -45) {
                //right
                this.setCurrentAnimation("attack_right");
                this.flipX(false);
            } else if (angle < -45 && angle >= -120) {
                //top
                this.setCurrentAnimation("attack_top");
            } else if ((angle < -120 && angle >= -180) || (angle > 120 && angle <= 180)) {
                //right_flipped
                this.setCurrentAnimation("attack_right");
                this.flipX(true);
            } else if (angle > 45 && angle <= 120) {
                //down
                this.setCurrentAnimation("attack_down")
            }

        }
        var targeted = false;
        var res = me.game.collide(this);
        if (res && this.dying === false) {
            if (res.obj.type === "human_attack") {
                var player = me.game.getEntityByGUID(me.gamestat.getItemValue("player"));
                this.hurt(player.countDMG(this.armor));
                player.destroyAttack();
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

        if (targeted === false && this.target !== null) {
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
                this.setCurrentAnimation("die");
                me.game.getEntityByGUID(me.gamestat.getItemValue("player")).updateEXP(15);
                this.attacking = false;
                this.attacked = false;
                this.dying = true;
            } else {
                this.flicker(20);
                if (this.attacked === false) {
                    this.attacked = true;
                    smile = new Smile(this.pos.x + (this.width / 2), this.pos.y, "kill");
                    me.game.add(smile, 3);
                    me.game.sort();
                }
            }
        }
    }
});