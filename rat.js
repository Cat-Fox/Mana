var Rat = me.ObjectEntity.extend({
    hp: 30,
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
        this.type = me.game.ENEMY_OBJECT;
        this.setCurrentAnimation("idle_right");
        this.updateColRect(15, 18, 18, 12);

        this.shadow = new Shadow(this.pos.x + 15, this.pos.y + 15);
        me.game.add(this.shadow, 4);
        me.game.sort();

        me.input.registerMouseEvent('mousemove', this.collisionBox, this.hover.bind(this));
    },
    hover: function() {
        me.game.HUD.setItemValue("EnemyHP", this.hp + ";rat;enemy");
    },
    onDestroyEvent: function() {
        me.input.releaseMouseEvent('mousemove', this.collisionBox);
    }
});