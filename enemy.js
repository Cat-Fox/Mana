game.WalkerRat = game.npcs.EnemyNPC.extend({
    init: function(x, y) {
        settings = {};
        settings.image = me.loader.getImage("npc_rat");
        settings.spritewidth = 48;
        settings.spriteheight = 48;
        var stats = new game.npcStats(20, 1, 4, "normal", 0, 0, 15, "aggresive");
        this.parent(x - 15, y - 18, settings, true, stats);
        this.renderable.anim = [];
        this.renderable.addAnimation("iddle_right", [18, 19], 30);
        this.renderable.addAnimation("iddle_up", [36, 37, 38, 39], 30);
        this.renderable.addAnimation("iddle_down", [54, 55, 56, 57], 30);
        this.renderable.addAnimation("right", [12, 13, 14], 7);
        this.renderable.addAnimation("down", [49, 50, 51, 52], 7);
        this.renderable.addAnimation("up", [30, 31, 32, 33], 7);
        this.renderable.addAnimation("attack_right", [6, 7, 8, 9, 10, 11], 2);
        this.renderable.addAnimation("attack_up", [24, 25, 26, 27], 2);
        this.renderable.addAnimation("attack_down", [42, 43, 44, 45], 2);
        this.renderable.addAnimation("die", [0, 0, 1, 2, 3, 4, 4], 7);
        this.renderable.setCurrentAnimation("iddle_right");
        this.updateColRect(15, 18, 18, 12);
        this.type = me.game.ENEMY_OBJECT;
        this.attack_cooldown = 1500;
        this.drop = new game.mechanic.DropTable(200, 999, 200);
        this.value = 200;
        this.name = "Rat";
    }
});

game.npcs.Crab = game.npcs.EnemyNPC.extend({
    init: function(x, y) {
        settings = {};
        settings.image = me.loader.getImage("npc_crab");
        settings.spritewidth = 32;
        settings.spriteheight = 32;
        var stats = new game.npcStats(40, 3, 8, "normal", 0, 0, 15);
        this.parent(x, y, settings, true, stats);
        this.renderable.anim = [];
        this.renderable.addAnimation("iddle_right", [18, 19], 30);
        this.renderable.addAnimation("iddle_up", [36, 37, 38, 39], 30);
        this.renderable.addAnimation("iddle_down", [54, 55, 56, 57], 30);
        this.renderable.addAnimation("right", [12, 13, 14], 7);
        this.renderable.addAnimation("down", [49, 50, 51, 52], 7);
        this.renderable.addAnimation("up", [30, 31, 32, 33], 7);
        this.renderable.addAnimation("attack_right", [8, 9, 10, 11, 12, 13, 14], 5);
        this.renderable.addAnimation("attack_up", [24, 25, 26, 27], 5);
        this.renderable.addAnimation("attack_down", [42, 43, 44, 45], 5);
        this.renderable.addAnimation("die", [0, 1, 2, 3, 4, 5, 6, 7], 7);
        this.renderable.setCurrentAnimation("iddle_right");
        this.updateColRect(15, 18, 18, 12);
        this.type = me.game.ENEMY_OBJECT;
        this.attack_cooldown = 1500;
        this.drop = new game.mechanic.DropTable(400, 0, 200);
        this.value = 200;
        this.name = "Crab";
    }
});

game.npcs.MimicWeapon = game.WalkerNPC.extend({
    stealth: null,
    target_color: null,
    target_box: null,
    tooltip: null,
    init: function(x, y) {
        settings = {};
        settings.image = me.loader.getImage("item-axe");
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        var stats = new game.npcStats(20, 3, "normal", 0, 0, 0);
        this.parent(x, y, settings, true, stats);
        this.renderable.anim = [];
        this.renderable.addAnimation("inactive", [0, 1, 2, 3, 4]);
        this.renderable.setCurrentAnimation("inactive");
        this.updateColRect(15, 18, 18, 12);
        this.type = "npc";
        this.attack_cooldown = 1500;
        this.drop = new game.mechanic.DropTable(0, 0, 0);
        this.attack_cooldown_run = false;
        this.mode_select = "idling";
        this.shadow_offset = new me.Vector2d(0, 5);
        this.stealth = true;
        this.target_color = "green";
        this.updateColRect(0, 16, 0, 16);
        this.target_box = null;
        this.tooltip = null;
    },
    update: function() {
        this.targeted = false;
        this.parent();

        if (this.target_box !== null) {
            if (this.targeted === false) {
                me.game.remove(this.target_box);
                this.target_box = null;
                this.destroyTooltip();
            } else {
                this.target_box.pos.x = this.pos.x;
                this.target_box.pos.y = this.pos.y + 5;
            }
        }
    },
    onTarget: function() {
        this.targeted = true;
        if (this.target_box === null) {
            this.target_box = me.entityPool.newInstanceOf("Target", this.pos.x + 0, this.pos.y + 5, this.target_color);
            me.game.add(this.target_box, this.z - 1);
            if (this.stealth) {
                this.tooltip = new game.DropTooltip(this.pos.x - (this.renderable.width / 2), this.pos.y - 5, "Axe", "normal");
                me.game.add(this.tooltip, game.guiLayer - 1);
            }
            me.game.sort();
        }
    },
    onUse: function() {
        if (this.stealth) {
            this.target_color = "red";
            me.game.remove(this.target_box);
            this.target_box = null;
            this.destroyTooltip();
            this.stealth = false;
            var text = new game.effects.SpeakText(this.pos.x, this.pos.y, "HAHAHAHAH!");
            me.game.add(text, this.guiLayer - 2);

            var active_mimic = new game.npcs.MimicWeaponActive(this.pos.x, this.pos.y);
            me.game.add(active_mimic, this.z);
            me.game.sort();

            me.game.remove(this);
        }
    },
    destroyTooltip: function() {
        if (this.tooltip !== null) {
            me.game.remove(this.tooltip);
            this.tooltip = null;
        }
    },
    destroyTargetBox: function() {
        if (this.target_box !== null) {
            me.game.remove(this.target_box);
            this.target_box;
        }
    }, onDestroyEvent: function() {
        this.parent();
        this.destroyTargetBox();
        this.destroyTooltip();
    }
});

game.npcs.MimicWeaponActive = game.npcs.EnemyNPC.extend({
    target_box: null,
    targe_text: null,
    init: function(x, y) {
        settings = {};
        settings.image = me.loader.getImage("axe");
        settings.spritewidth = 48;
        settings.spriteheight = 48;
        var stats = new game.npcStats(45, 5, 10, "normal", 0, 0, 50);
        this.parent(x, y, settings, true, stats);
        this.renderable.anim = [];
        this.renderable.addAnimation("attack_right", [0, 1, 2, 3, 4], 3);
        this.renderable.addAnimation("right", [5, 6, 7, 8]);
        this.renderable.addAnimation("iddle_right", [10, 11], 30);
        this.renderable.addAnimation("attack_up", [15, 16, 17, 18, 19], 3);
        this.renderable.addAnimation("up", [20, 21, 22, 23]);
        this.renderable.addAnimation("iddle_up", [25, 26], 30);
        this.renderable.addAnimation("attack_down", [30, 31, 32, 33, 34], 3);
        this.renderable.addAnimation("down", [35, 36, 37, 38]);
        this.renderable.addAnimation("iddle_down", [40, 41], 30);
        this.renderable.setCurrentAnimation("iddle_right");
        this.updateColRect(10, 16, 22, 16);
        this.type = me.game.ENEMY_OBJECT;
        this.attack_cooldown = 1500;
        this.drop = new game.mechanic.DropTable(200, 50, 200);
        this.attack_cooldown_run = false;
        this.mode_select = "attacking";
        this.shadow_offset = new me.Vector2d(12, 24);
        this.target_box = null;
        this.target_text = null;
        this.name = "Cursed Axe";
        this.setVelocity(1.0, 1.0);
        this.value = 150;
    },
    modeDying: function() {
        if (this.target_text !== null) {
            me.game.remove(this.target_text);
            this.target_text = null;
        }
        if (this.target !== null) {
            me.game.remove(this.target);
            this.target = null;
        }

        this.onDrop();
        var deathSmoke = me.entityPool.newInstanceOf("DeathSmoke", this.pos.x + (this.renderable.width / 2), this.pos.y + (this.renderable.height / 2));
        me.game.add(deathSmoke, this.z);
        me.game.sort();
        me.game.remove(this);
    }
});

game.npcs.Goblin = game.npcs.EnemyNPC.extend({
    target_box: null,
    targe_text: null,
    init: function(x, y) {
        settings = {};
        settings.image = me.loader.getImage("npc_goblin");
        settings.spritewidth = 26;
        settings.spriteheight = 26;
        var stats = new game.npcStats(30, 2, 12, "normal", 2, 0, 50, "aggresive");
        this.parent(x - 10, y - 22, settings, true, stats);
        this.renderable.anim = [];
        this.renderable.addAnimation("attack_right", [0, 1, 2], 9);
        this.renderable.addAnimation("right", [4, 5, 6]);
        this.renderable.addAnimation("iddle_right", [8, 9], 30);
        this.renderable.addAnimation("attack_up", [12, 13, 14], 9);
        this.renderable.addAnimation("up", [16, 17, 18, 19]);
        this.renderable.addAnimation("iddle_up", [20, 21], 30);
        this.renderable.addAnimation("attack_down", [24, 25, 26], 9);
        this.renderable.addAnimation("down", [28, 29, 30, 31]);
        this.renderable.addAnimation("iddle_down", [32, 33], 30);
        this.renderable.setCurrentAnimation("iddle_right");
        this.updateColRect(10, 16, 22, 16);
        this.type = me.game.ENEMY_OBJECT;
        this.attack_cooldown = 1500;
        this.drop = new game.mechanic.DropTable(200, 50, 200);
        this.attack_cooldown_run = false;
        this.target_box = null;
        this.target_text = null;
        this.name = "Goblin";
        this.setVelocity(1.0, 1.0);
        this.value = 75;
        this.target_offset.x = 5;
        this.target_offset.y = 11;
        this.shadow_offset.x = 5;
        this.shadow_offset.y = 10;
        this.updateColRect(5, 16, 10, 16);
    },
    modeDying: function() {
        this.alive = false;
        if (this.target_text !== null) {
            me.game.remove(this.target_text);
            this.target_text = null;
        }
        if (this.target !== null) {
            me.game.remove(this.target);
            this.target = null;
        }

        this.onDrop();
        var deathSmoke = me.entityPool.newInstanceOf("DeathSmoke", this.pos.x + (this.renderable.width / 2), this.pos.y + (this.renderable.height / 2));
        me.game.add(deathSmoke, this.z);
        me.game.sort();
        me.game.remove(this);
    }
});

game.npcs.Bat = game.npcs.EnemyNPC.extend({
    target_box: null,
    targe_text: null,
    init: function(x, y) {
        settings = {};
        settings.image = me.loader.getImage("npc_bat");
        settings.spritewidth = 32;
        settings.spriteheight = 48;
        var stats = new game.npcStats(15, 2, 5, "normal", 2, 0, 50, "passive");
        this.parent(x, y, settings, true, stats);
        this.renderable.anim = [];
        this.renderable.addAnimation("attack_right", [0, 1, 2, 3, 4], 2);
        this.renderable.addAnimation("right", [0, 1, 2, 3, 4], 6);
        this.renderable.addAnimation("iddle_right", [0, 1, 2, 3, 4], 6);
        this.renderable.addAnimation("attack_up", [5, 6, 7, 8, 9], 2);
        this.renderable.addAnimation("up", [5, 6, 7, 8, 9], 6);
        this.renderable.addAnimation("iddle_up", [5, 6, 7, 8, 9], 6);
        this.renderable.addAnimation("attack_down", [10, 11, 12, 13, 14], 2);
        this.renderable.addAnimation("down", [10, 11, 12, 13, 14], 6);
        this.renderable.addAnimation("iddle_down", [10, 11, 12, 13, 14], 6);
        this.renderable.setCurrentAnimation("iddle_right");
        this.updateColRect(10, 16, 22, 16);
        this.type = me.game.ENEMY_OBJECT;
        this.attack_cooldown = 900;
        this.drop = new game.mechanic.DropTable(400, 50, 200);
        this.attack_cooldown_run = false;
        this.target_box = null;
        this.target_text = null;
        this.name = "Bat";
        this.setVelocity(1.0, 1.0);
        this.value = 75;
        this.target_offset.x = 9;
        this.target_offset.y = 20;
        this.shadow_offset.x = 9;
        this.shadow_offset.y = 20;
        this.updateColRect(5, 16, 10, 16);
    },
    modeDying: function() {
        this.alive = false;
        if (this.target_text !== null) {
            me.game.remove(this.target_text);
            this.target_text = null;
        }
        if (this.target !== null) {
            me.game.remove(this.target);
            this.target = null;
        }

        this.onDrop();
        var deathSmoke = me.entityPool.newInstanceOf("DeathSmoke", this.pos.x + (this.renderable.width / 2), this.pos.y + (this.renderable.height / 2));
        me.game.add(deathSmoke, this.z);
        me.game.sort();
        me.game.remove(this);
    }
});