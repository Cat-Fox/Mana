me.state.CHARACTER_PICK = me.state.USER;

var game =
        {
            screenWidth: 400,
            screenHeight: 220,
            guiLayer: 15,
            weapons: {},
            consumables: {},
            armors: {},
            items: {},
            gui: {},
            fonts: {},
            destroyable: {},
            mechanic: {},
            instances: {},
            entities: {},
            object_layer: 4,
            effects: {},
            npcs: {},
            audio: {},
            pathfinding: {},
            spells: {},
            LAYERS: {GUI: 15, NPC: 5, ITEMS: 4, TOP: 20},
            version: "0.0.5",
            onload: function()
            {
                if (!me.video.init('screen', this.screenWidth, this.screenHeight, true, 2.0, true)) {
                    alert("Sorry but your browser does not support html 5 canvas.");
                    return;
                }

                if (!me.sys.localStorage) {
                    alert("Sorry, but your browser does not support Local Web Storage");
                    return;
                }

                if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
                    alert('The File APIs are not fully supported in this browser.');
                    return;
                }
                
                me.state.set(me.state.LOADING, new game.LoadingScreen());
                me.audio.init("mp3,ogg");
                me.loader.onload = this.loaded.bind(this);
                me.loader.preload(game.resources);
                me.state.change(me.state.LOADING);
            },
            /* ---callback when everything is loaded---*/
            loaded: function()
            {
                // set the "Play/Ingame" Screen Object
                me.state.set(me.state.PLAY, new game.PlayScreen());
                me.state.set(me.state.MENU, new game.MenuScreen());
                me.state.set(me.state.CREDITS, new game.CreditsScreen());
                me.state.set(me.state.CHARACTER_PICK, new game.CharacterPickScreen());

                me.entityPool.add("Player", game.Player);
                //------------------ITEMS------------------------
                me.entityPool.add("Burger", game.consumables.Burger, true);
                me.entityPool.add("Equip", game.items.Equip, true);
                me.entityPool.add("HealthPotion", game.consumables.HealthPotion, true);
                me.entityPool.add("Gold", game.consumables.Money, true);
                //-------------------SPELLS------------------------
                me.entityPool.add("Fireball", game.spells.Fireball, true);
                //------------------Entities---------------------------

                me.entityPool.add("Shadow", game.Shadow, true);
                me.entityPool.add("Sparks", game.Sparks, true);
                me.entityPool.add("Smile", game.Smile, true);
                me.entityPool.add("Target", game.Target, true);
                me.entityPool.add("Firecamp", game.entities.Firecamp);
                me.entityPool.add("CollisionBox", game.CollisionBox, true);
                me.entityPool.add("Message", game.Message);
                me.entityPool.add("Exit", game.Exit);
                me.entityPool.add("ChangeLevel", game.ChangeLevel);
                //Particles
                me.entityPool.add("ParticleGenerator", game.ParticleGenerator);
                me.entityPool.add("Particle", game.Particle, true);
                me.entityPool.add("RainDrop", game.effects.RainDrop, true);
                //----------------------NPCS--------------------------
                //ENEMY
                me.entityPool.add("MimicWeapon", game.npcs.MimicWeapon, true);
                me.entityPool.add("WalkerNPC", game.WalkerNPC, true);
                me.entityPool.add("WalkerRat", game.WalkerRat, true);
                me.entityPool.add("Goblin", game.npcs.Goblin, true);
                me.entityPool.add("Bat", game.npcs.Bat, true);
                //ALLY
                me.entityPool.add("Guard", game.npcs.Guard);
                me.entityPool.add("TalkyGuard", game.npcs.TalkyGuard);
                me.entityPool.add("King", game.npcs.King);
                me.entityPool.add("Priest", game.npcs.Priest);
                me.entityPool.add("Octocat", game.npcs.Octocat);
                me.entityPool.add("ManaChest", game.npcs.ManaChest);
                me.entityPool.add("Zaraka", game.npcs.Zaraka);
                me.entityPool.add("Villager", game.npcs.Villager);
                me.entityPool.add("Blacksmith", game.npcs.Blacksmith);
                me.entityPool.add("Wizard", game.npcs.Wizard);
                me.entityPool.add("Spawn", game.Spawn);
                me.entityPool.add("DungeonSpawn", game.DungeonSpawn);
                me.entityPool.add("Fox", game.npcs.Fox);
                //Destroyable
                me.entityPool.add("Barrel", game.destroyable.Barrel, true);
                //---------------------GUI--------------------------------
                me.entityPool.add("Backpack", game.Backpack, true);
                me.entityPool.add("Icon", game.Icon, true);
                me.entityPool.add("InventoryTile", game.InventoryTile, true);
                me.entityPool.add("CharacterTile", game.CharacterTile, true);
                //Texts
                me.entityPool.add("SmallText", game.gui.SmallText, true);
                me.entityPool.add("BigText", game.gui.BigText, true);
                me.entityPool.add("HitText", game.HitText, true);
                me.entityPool.add("DeathSmoke", game.DeathSmoke, true);
                //Buttons
                me.entityPool.add("Button", game.Button, true);
                me.entityPool.add("DropButton", game.DropButton, true);
                me.entityPool.add("PlusSkillButton", game.PlusSkillButton, true);


                //Setup Gamestat
                me.gamestat.add("hp", 50);
                me.gamestat.add("maxhp", 50);
                me.gamestat.add("exp", 0);
                me.gamestat.add("level", 1);
                me.gamestat.add("next_level", 100);
                var stats = new game.mechanic.Stats(1, 1, 1, 1, true);
                me.gamestat.add("stats", stats);
                me.gamestat.add("skill", 0);
                me.gamestat.add("money", 0);
                var inventory = new Array(30);
                for (var i = 0; i < inventory.length; i++) {
                    inventory[i] = null;
                }
                me.gamestat.add("inventory", inventory);
                var stash = new Array(40);
                for (var i = 0; i < stash.length; i++) {
                    stash[i] = null;
                }
                me.gamestat.add("stash", stash);
                var equip = {weapon: null, armor: null, artefact: null};
                me.gamestat.add("stash_money", 0);
                me.gamestat.add("equip", equip);
                var belt = new Array(8);
                for (var i = 0; i < belt.length; i++) {
                    belt[i] = null;
                }
                me.gamestat.add("belt", belt);
                var history = new game.mechanic.History();
                me.gamestat.add("history", history);
                var spells = new Array(64);
                for (var i = 0; i < spells.length; i++) {
                    spells[i] = null;
                }
                me.gamestat.add("spells", spells);
                me.gamestat.add("mana", 0);
                me.gamestat.add("helmet", 0);

                me.sys.fps = 30;

                //audio need to be global and set before menu
                game.instances.audio = new game.audio.Main();

                // start the game
                me.state.change(me.state.MENU);
            }
        };



window.onReady(function() {
    game.onload();
});