game.npcs.Fox = game.npcs.AllyWalker.extend({
    drop: null,
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 32;
        settings.spriteheight = 32;
        settings.image = me.loader.getImage("npc_firefox");
        this.parent(x, y, settings, true, null);
        this.renderable.anim = [];
        this.renderable.addAnimation("right", [8, 9, 10, 11], 10);
        this.renderable.addAnimation("up", [32, 33, 34, 35, 36, 37, 38, 39]);
        this.renderable.addAnimation("down", [56, 57, 58, 59]);
        this.renderable.addAnimation("iddle_right", [16, 17, 18, 19, 20], 10);
        this.renderable.addAnimation("iddle_up", [40, 41], 20);
        this.renderable.addAnimation("iddle_down", [64, 65], 20);
        this.renderable.addAnimation("attack_down", [48, 49, 50, 51, 52], 3);
        this.renderable.addAnimation("attack_up", [24, 25, 26, 27, 28], 3);
        this.renderable.addAnimation("attack_right", [0, 1, 2, 3, 4], 3);
        this.renderable.setCurrentAnimation("iddle_right");
        this.mode_select = "walking";
        this.shadow_offset = new me.Vector2d(11, 13);
        this.target_offset = new me.Vector2d(11, 13);
        this.name = "Lucky Fox";
        this.drop = new game.mechanic.DropTable(500, 500, 500);
    },
     onUse: function(){
        var speak = new game.effects.SpeakText(this.pos.x, this.pos.y, "Woof!");
        me.game.add(speak, game.LAYERS.GUI);
        me.game.sort();
        game.mechanic.drop(this.pos.x, this.pos.y, 500, this.drop);
        me.game.remove(this);
     },
     onHit: function(){
        var speak = new game.effects.SpeakText(this.pos.x, this.pos.y, "Woof! :(");
        game.instances.player.hurt(5, 10, "normal");
        me.game.add(speak, game.LAYERS.GUI);
        me.game.sort();
        me.game.remove(this);
     }
});

game.npcs.TalkyGuard = game.npcs.AllyNPC.extend({
    init: function(x, y) {
        this.parent(x, y, "Talky Guard", "npc_guard", 24, 2, "dialog_guard");
    },
    onUse: function() {
        if (game.instances.dialog === null) {
            game.instances.dialog = new game.gui.Dialog("dialog_guard", this.GUID);
            me.game.add(game.instances.dialog, game.LAYERS.GUI);
            me.game.sort();
        }
    },
    cleanup: function() {
        game.mechanic.destroy_dialoge(this.GUID);
    }
});

game.npcs.Guard = game.npcs.AllyNPC.extend({
    init: function(x, y) {
        this.parent(x, y, "Guard", "npc_guard", 24, 2, "dialog_guard");
    }
});

game.npcs.King = game.npcs.AllyNPC.extend({
    init: function(x, y) {
        this.parent(x, y, "King", "npc_king", 32, 2, "dialog_king");
        this.updateColRect(10, 10, 8, 18);
    },
    onUse: function() {
        if (game.instances.dialog === null) {
            game.instances.dialog = new game.gui.Dialog("dialog_king", this.GUID);
            me.game.add(game.instances.dialog, game.LAYERS.GUI);
            me.game.sort();
        }
    },
    cleanup: function() {
        game.mechanic.destroy_dialoge(this.GUID);
    }
});

game.npcs.Priest = game.npcs.AllyNPC.extend({
    init: function(x, y) {
        this.parent(x - 5, y - 5, "Priest", "npc_priest", 24, 2, "dialog_priest");
        this.target_offset.x = 4;
    },
    onUse: function() {
        if (game.instances.dialog === null) {
            game.instances.dialog = new game.gui.Dialog("dialog_priest", this.GUID);
            if (me.gamestat.getItemValue("history").npcs_talks.priest) {
                game.instances.dialog.setBranch(1);
            }
            me.game.add(game.instances.dialog, game.LAYERS.GUI);
            me.game.sort();
        }
    },
    cleanup: function() {
        game.mechanic.destroy_dialoge(this.GUID);
    }
});

game.npcs.Octocat = game.npcs.AllyNPC.extend({
    init: function(x, y) {
        this.parent(x, y, "Octocat", "npc_octocat", 32, 4, "dialog_octocat");
    },
    onUse: function() {
        if (game.instances.dialog === null) {
            game.instances.dialog = new game.gui.Dialog("dialog_octocat", this.GUID);
            me.game.add(game.instances.dialog, game.LAYERS.GUI);
            me.game.sort();
        }
    },
    cleanup: function() {
        game.mechanic.destroy_dialoge(this.GUID);
    }
});

game.npcs.ManaChest = game.npcs.AllyNPC.extend({
    init: function(x, y) {
        this.parent(x, y - 16, "Mana Chest", "chest_player", [16, 32], 1, "dialog_chest");
        this.renderable.anim = [];
        this.renderable.addAnimation("closed", [0]);
        this.renderable.addAnimation("open", [1]);
        this.renderable.setCurrentAnimation("closed");
        this.tutorial = true;
        this.target_offset.x = 0;
        this.target_offset.y = 2 + 16;
    },
    onUse: function() {
        if (game.instances.dialog === null) {
            game.instances.dialog = new game.gui.Dialog("dialog_chest", this.GUID);
            me.game.add(game.instances.dialog, game.LAYERS.GUI);
            me.game.sort();
            if (me.gamestat.getItemValue("history").npcs_talks.stash) {
                game.instances.dialog.setBranch(1);
            }

        }
    },
    cleanup: function() {
        game.mechanic.destroy_dialoge(this.GUID);
        if (game.instances.stash !== null) {
            game.mechanic.close_stash(this.GUID);
        }
    }
});

game.npcs.Zaraka = game.npcs.AllyNPC.extend({
    init: function(x, y) {
        this.parent(x, y, "Zaraka", "npc_zaraka", 24, 2, "dialog_zaraka");
        this.target_offset.x -= 2;
    },
    onUse: function() {
        if (game.instances.dialog === null) {
            game.instances.dialog = new game.gui.Dialog("dialog_zaraka", this.GUID);
            me.game.add(game.instances.dialog, game.LAYERS.GUI);
            me.game.sort();
        }
    },
    cleanup: function() {
        game.mechanic.destroy_dialoge(this.GUID);
    }
});

game.npcs.Villager = game.npcs.AllyNPC.extend({
    init: function(x, y) {
        this.parent(x, y, "Villager", "npc_villager", 24, 2, "dialog_villager");
        this.target_offset.x -= 2;
        this.updateColRect(5, 16, 10, 16);
    }
});

game.npcs.Blacksmith = game.npcs.AllyNPC.extend({
    init: function(x, y) {
        this.parent(x, y, "Blacksmith", "npc_blacksmith", 24, 2, "dialog_blacksmith");
        this.target_offset.x -= 2;
        this.updateColRect(5, 16, 10, 16);
    },
    onUse: function() {
        if (game.instances.dialog === null && game.instances.shop === null) {
            game.instances.dialog = new game.gui.Dialog("dialog_blacksmith", this.GUID);
            if (me.gamestat.getItemValue("history").npcs_talks.blacksmith) {
                game.instances.dialog.setBranch(1);
            }
            me.game.add(game.instances.dialog, game.LAYERS.GUI);
            me.game.sort();
        }
    },
    cleanup: function() {
        game.mechanic.destroy_dialoge(this.GUID);
    }
});

game.npcs.Wizard = game.npcs.AllyNPC.extend({
    init: function(x, y) {
        this.parent(x, y, "Wizard", "npc_sorcerer", 26, 6, "dialog_wizard");
        this.target_offset.x -= 2;
        this.target_offset.y += 2;
        //this.shadow_offset.y += 2;
        this.updateColRect(5, 16, 10, 16);
    },
    onUse: function() {
        if (game.instances.dialog === null) {
            game.instances.dialog = new game.gui.Dialog("dialog_wizard", this.GUID);
            if (me.gamestat.getItemValue("history").npcs_talks.wizard) {
                game.instances.dialog.setBranch(1);
            }
            me.game.add(game.instances.dialog, game.LAYERS.GUI);
            me.game.sort();
        }
    },
    cleanup: function() {
        game.mechanic.destroy_dialoge(this.GUID);
    }
});