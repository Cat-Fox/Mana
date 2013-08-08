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
        this.parent(x, y, "Mana Chest", "chest_player", 16, 1, "dialog_chest");
        this.tutorial = true;
        this.target_offset.x = 0;
        this.target_offset.y = 2;
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
            game.mechanic.close_stash();
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