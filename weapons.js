game.weapons.Sword1 = me.ObjectEntity.extend({
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 32;
        settings.spriteheight = 32;
        settings.image = "sword1";
        this.parent(x, y, settings);
        this.renderable.addAnimation("attack_right", [0, 1, 2, 3, 4], 1);
        this.renderable.addAnimation("right", [5, 6, 7, 8]);
        this.renderable.addAnimation("iddle_right", [10, 11], 30);
        this.renderable.addAnimation("attack_up", [15, 16, 17, 18, 19], 1);
        this.renderable.addAnimation("up", [20, 21, 22, 23]);
        this.renderable.addAnimation("iddle_up", [25, 26], 30);
        this.renderable.addAnimation("attack_down", [30, 31, 32, 33, 34], 1);
        this.renderable.addAnimation("down", [35, 36, 37, 38]);
        this.renderable.addAnimation("iddle_down", [40, 41], 30);
    }
});

game.weapons.Sword2 = me.ObjectEntity.extend({
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 48;
        settings.spriteheight = 48;
        settings.image = "sword2";
        this.parent(x, y, settings);
        this.renderable.addAnimation("attack_right", [0, 1, 2, 3, 4], 1);
        this.renderable.addAnimation("right", [5, 6, 7, 8]);
        this.renderable.addAnimation("iddle_right", [10, 11], 30);
        this.renderable.addAnimation("attack_up", [15, 16, 17, 18, 19], 1);
        this.renderable.addAnimation("up", [20, 21, 22, 23]);
        this.renderable.addAnimation("iddle_up", [25, 26], 30);
        this.renderable.addAnimation("attack_down", [30, 31, 32, 33, 34], 1);
        this.renderable.addAnimation("down", [35, 36, 37, 38]);
        this.renderable.addAnimation("iddle_down", [40, 41], 30);
    }
});

game.weapons.Axe = me.ObjectEntity.extend({
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 48;
        settings.spriteheight = 48;
        settings.image = "axe";
        this.parent(x, y, settings);
        this.renderable.addAnimation("attack_right", [0, 1, 2, 3, 4], 1);
        this.renderable.addAnimation("right", [5, 6, 7, 8]);
        this.renderable.addAnimation("iddle_right", [10, 11], 30);
        this.renderable.addAnimation("attack_up", [15, 16, 17, 18, 19], 1);
        this.renderable.addAnimation("up", [20, 21, 22, 23]);
        this.renderable.addAnimation("iddle_up", [25, 26], 30);
        this.renderable.addAnimation("attack_down", [30, 31, 32, 33, 34], 1);
        this.renderable.addAnimation("down", [35, 36, 37, 38]);
        this.renderable.addAnimation("iddle_down", [40, 41], 30);
    }
});

game.weapons.Morningstar = me.ObjectEntity.extend({
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 38;
        settings.spriteheight = 38;
        settings.image = "morningstar";
        this.parent(x, y, settings);
        this.renderable.addAnimation("attack_right", [0, 1, 2, 3, 4], 1);
        this.renderable.addAnimation("right", [5, 6, 7, 8]);
        this.renderable.addAnimation("iddle_right", [10, 11], 30);
        this.renderable.addAnimation("attack_up", [15, 16, 17, 18, 19], 1);
        this.renderable.addAnimation("up", [20, 21, 22, 23]);
        this.renderable.addAnimation("iddle_up", [25, 26], 30);
        this.renderable.addAnimation("attack_down", [30, 31, 32, 33, 34], 1);
        this.renderable.addAnimation("down", [35, 36, 37, 38]);
        this.renderable.addAnimation("iddle_down", [40, 41], 30);
    }
});

game.weapons.BlueSword = me.ObjectEntity.extend({
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 48;
        settings.spriteheight = 48;
        settings.image = "bluesword";
        this.parent(x, y, settings);
        this.renderable.addAnimation("attack_right", [0, 1, 2, 3, 4], 1);
        this.renderable.addAnimation("right", [5, 6, 7, 8]);
        this.renderable.addAnimation("iddle_right", [10, 11], 30);
        this.renderable.addAnimation("attack_up", [15, 16, 17, 18, 19], 1);
        this.renderable.addAnimation("up", [20, 21, 22, 23]);
        this.renderable.addAnimation("iddle_up", [25, 26], 30);
        this.renderable.addAnimation("attack_down", [30, 31, 32, 33, 34], 1);
        this.renderable.addAnimation("down", [35, 36, 37, 38]);
        this.renderable.addAnimation("iddle_down", [40, 41], 30);
    }
});

game.weapons.RedSword = me.ObjectEntity.extend({
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 48;
        settings.spriteheight = 48;
        settings.image = "redsword";
        this.parent(x, y, settings);
        this.renderable.addAnimation("attack_right", [0, 1, 2, 3, 4], 1);
        this.renderable.addAnimation("right", [5, 6, 7, 8]);
        this.renderable.addAnimation("iddle_right", [10, 11], 30);
        this.renderable.addAnimation("attack_up", [15, 16, 17, 18, 19], 1);
        this.renderable.addAnimation("up", [20, 21, 22, 23]);
        this.renderable.addAnimation("iddle_up", [25, 26], 30);
        this.renderable.addAnimation("attack_down", [30, 31, 32, 33, 34], 1);
        this.renderable.addAnimation("down", [35, 36, 37, 38]);
        this.renderable.addAnimation("iddle_down", [40, 41], 30);
    }
});