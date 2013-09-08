game.spells.Fireball = game.consumables.Layout.extend({
    tooltip: null,
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.image = "book";
        this.parent(x, y, settings, false, "Book of Flames", "normal");
    },
    onUse: function() {
        var tooltip_text = [];
        tooltip_text.push(new game.gui.TextLine("Fireball", game.fonts.bad_red));
        tooltip_text.push(new game.gui.TextLine("Deal 15 DMG", game.fonts.bad_red));
        tooltip_text.push(new game.gui.TextLine("Cost 10 mana", game.fonts.magic_blue));
        var item = new game.ItemObject("Fireball", "spell_fireball_icon", "spell", "normal", {fireball: 1, sound: "turn_page", cost: 10}, tooltip_text);

        this.onPickup(item);
    }
});

game.effects.Fireball = me.ObjectEntity.extend({
    direction: null,
    element: "magic",
    dmg_min: 10,
    dmg_max: 15,
    init: function(x, y, direction) {
        this.direction = direction;
        settings = {};
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.image = "spell_fireball_effect";
        this.parent(x, y, settings);
        this.renderable.addAnimation("right", [0, 1, 2, 3, 4, 5], 2);
        this.renderable.addAnimation("up", [6, 7, 8, 9, 10, 11], 2);
        this.renderable.addAnimation("down", [12, 13, 14, 15, 16], 2);
        this.collidable = true;
        this.type = "projectile";
        switch (direction) {
            case "up":
                this.renderable.setCurrentAnimation("up");
                this.setVelocity(0, 2.1);
                this.updateColRect(5, 5, 3, 9);
                break;
            case "left":
                this.renderable.setCurrentAnimation("right");
                this.renderable.flipX(true);
                this.setVelocity(2.1, 0);
                this.updateColRect(3, 9, 6, 5);
                break;
            case "right":
                this.renderable.setCurrentAnimation("right");
                this.setVelocity(2.1, 0);
                this.updateColRect(3, 9, 6, 5);
                break;
            case "down":
                this.renderable.setCurrentAnimation("down");
                this.setVelocity(0, 2.1);
                this.updateColRect(5, 5, 3, 9);
                break;
        }
        this.gravity = 0;
        game.instances.audio.channels.effects.addEffect("fire");
    },
    update: function() {
        if (this.direction === "right") {
            this.vel.x += this.accel.x * me.timer.tick;
        } else if (this.direction === "left") {
            this.vel.x -= this.accel.x * me.timer.tick;
        } else if (this.direction === "up") {
            this.vel.y -= this.accel.y * me.timer.tick;
        } else {
            this.vel.y += this.accel.y * me.timer.tick;
        }

        var res = me.game.collide(this, true);
        if (res.length >= 1) {
            for (var i = 0; i < res.length; i++) {
                if(res[i].obj.type === "npc"){
                    me.game.remove(this);
                }
            }
        }

        var collision = this.updateMovement();
        if (collision.y && collision.yprop.isSolid) {
            me.game.remove(this);
        } else if(collision.x && collision.xprop.isSolid){
            me.game.remove(this);
        }
        this.parent();
        return false;
    },
    onDestroyEvent: function(){
        var explosion = new game.effects.Explosion(this.pos.x + (this.width / 2), this.pos.y + (this.height / 2));
        me.game.add(explosion, game.LAYERS.NPC);
        me.game.sort();
    }
});