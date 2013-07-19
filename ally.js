game.npcs.TalkyGuard = game.npcs.AllyNPC.extend({
    init: function(x, y) {
        this.parent(x, y, "Talky Guard", "npc_guard", 24, 2, "dialog_guard");
    },
    onUse: function() {
        if (game.instances.dialog === null) {
            game.instances.dialog = new game.gui.Dialog("dialog_guard", this.GUID);
            me.game.add(game.instances.dialog, game.guiLayer);
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
    },
    onUse: function() {
        if (game.instances.dialog === null) {
            game.instances.dialog = new game.gui.Dialog("dialog_king", this.GUID);
            me.game.add(game.instances.dialog, game.guiLayer);
            me.game.sort();
        }
    },
    cleanup: function() {
        game.mechanic.destroy_dialoge(this.GUID);
    }
});

game.npcs.Priest = game.npcs.AllyNPC.extend({
    init: function(x, y) {
        this.parent(x, y, "Priest", "npc_priest", 24, 2, "dialog_priest");
    },
    onUse: function() {
        if (game.instances.dialog === null) {
            game.instances.dialog = new game.gui.Dialog("dialog_priest", this.GUID);
            me.game.add(game.instances.dialog, game.guiLayer);
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
            me.game.add(game.instances.dialog, game.guiLayer);
            me.game.sort();
        }
    },
    cleanup: function() {
        game.mechanic.destroy_dialoge(this.GUID);
    }
});

game.npcs.ManaChest = game.npcs.AllyNPC.extend({
    tutorial: null,
    init: function(x, y) {
        this.parent(x, y, "Mana Chest", "chest_player", 16, 1, "dialog_chest");
        this.tutorial = true;
        this.target_offset.x = 0;
        this.target_offset.y = 2;
    },
    onUse: function() {
        if (this.tutorial && game.instances.dialog === null) {
            this.tutorial = false;
            game.instances.dialog = new game.gui.Dialog("dialog_chest", this.GUID);
            me.game.add(game.instances.dialog, game.guiLayer);
            me.game.sort();
        } else if (game.instances.dialog === null) {
            if(game.instances.stash === null){
                 game.instances.stash = new game.gui.Stash();
                 me.game.add(game.instances.stash, game.guiLayer);
                 me.game.sort();
            } else {
                me.game.remove(game.instances.stash);
                game.instances.stash = null;
            }
        }
    },
    cleanup: function() {
        game.mechanic.destroy_dialoge(this.GUID);
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
            me.game.add(game.instances.dialog, game.guiLayer);
            me.game.sort();
        }
    },
    cleanup: function() {
        game.mechanic.destroy_dialoge(this.GUID);
    }
});