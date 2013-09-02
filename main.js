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
            version: "0.0.4",
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

                // add "#debug" to the URL to enable the debug Panel
                if (document.location.hash === "#debug") {
                    window.onReady(function() {
                        me.plugin.register.defer(debugPanel, "debug");
                    });
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
                me.entityPool.add("Equip", game.items.Equip.true);
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


                //player stuff
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
                for(var i = 0; i < spells.length; i++){
                    spells[i] = null;
                }
                me.gamestat.add("spells", spells);

                me.sys.fps = 30;

                //audio need to be global and set before menu
                game.instances.audio = new game.audio.Main();

                // start the game
                me.state.change(me.state.MENU);
            }

        };

/* Screen object supporting layer-animation */
game.AnimatedScreen = me.ScreenObject.extend({
    "animations": {},
    "keys": [],
    "init": function init(animationspeed) {
        this.parent(true);
        this.isPersistent = true;
        this.animationspeed = animationspeed || this.animationspeed;

    },
    "update": function update() {
        var isDirty = false;
        var self = this;

        if (game.wantsResort) {
            game.wantsResort = false;
            me.game.sort.defer(game.sort);
        }

        if (!self.keys.length) {
            return false;
        }

        self.keys.forEach(function forEach(key) {
            var animation = self.animations[key];
            if (++animation.count > animation.speed) {
                animation.count = 0;

                animation.layers[animation.idx].visible = false;
                ++animation.idx;
                animation.idx %= animation.layers.length;
                animation.layers[animation.idx].visible = true;

                isDirty = true;
            }
        });

        return isDirty;
    },
    onResetEvent: function onResetEvent() {
        var self = this;
        self.animations = {};
        self.keys = [];

        // Use `in` operator, so we can use 0, if we want. ;)
        var speed = (("animationspeed" in me.game.currentLevel) ?
                me.game.currentLevel.animationspeed :
                (me.sys.fps / 10));

        var layers = me.game.currentLevel.getLayers();
        layers.forEach(function forEach(layer, idx) {
            if (layer.name.toLowerCase().indexOf("animated ") === 0) {
                var key = layer.name.substr(9).replace(/\d+$/, "").trim();

                if (self.animations[key]) {
                    layer.visible = false;
                }
                else {
                    self.keys.push(key);
                    self.animations[key] = {
                        "speed": me.game.currentLevel[key + " speed"] || speed,
                        "layers": [],
                        "count": 0,
                        "idx": 0
                    };
                }
                self.animations[key].layers.push(layer);
            }
        });
    }
});


game.MenuScreen = game.AnimatedScreen.extend({
    init: function() {
        this.parent(true);

        this.logo = null;
        this.small_logo = null;
        this.version = null;

        this.buttons = {};
        this.icon = null;

        this.label = null;

        this.selection_options = null;
        this.selection = 0;
        this.bmf_geebee = new me.BitmapFont("geebeeyay-8x8", 8, 1.0);
        this.bmf_gold = new me.BitmapFont("gold_8x8", 8, 1.0, "0x41");


    },
    onResetEvent: function() {
        me.levelDirector.loadLevel("sewers_menu");
        me.game.viewport.move(17 * 16, 18 * 16);
        this.parent();

        game.instances.console = new game.gui.Console(0, 0);
        me.game.add(game.instances.console, 9999);


        this.icon = new game.Icon((game.screenWidth / 2) - 20, game.screenHeight / 2, "item-sword1");
        this.icon.renderable.setCurrentAnimation("active");
        me.game.add(this.icon, 8);
        this.buttons.new_game = new game.gui.BigStaticText(game.screenWidth / 2, game.screenHeight / 2, "NEW", this.bmf_gold);
        me.game.add(this.buttons.new_game, 8);
        this.buttons.load_game = new game.gui.BigStaticText(game.screenWidth / 2, game.screenHeight / 2 + 10, "LOAD", this.bmf_gold);
        me.game.add(this.buttons.load_game, 8);
        this.buttons.delete = new game.gui.BigStaticText(game.screenWidth / 2, game.screenHeight / 2 + 20, "DELETE SAVE", this.bmf_gold);
        me.game.add(this.buttons.delete, 8);
        this.buttons.options = new game.gui.BigStaticText(game.screenWidth / 2, game.screenHeight / 2 + 30, "OPTIONS", this.bmf_gold);
        me.game.add(this.buttons.options, 8);
        this.buttons.credits = new game.gui.BigStaticText(game.screenWidth / 2, game.screenHeight / 2 + 40, "CREDITS", this.bmf_gold);
        me.game.add(this.buttons.credits, 8);
        this.label = new game.gui.BigStaticText(20, game.screenHeight - 10, "PRESS ENTER OR C TO SELECT", this.bmf_geebee);
        me.game.add(this.label, 8);
        this.logo = new game.gui.SmallText((game.screenWidth - 60) / 2, (game.screenHeight - 90) / 2, "MANA", game.fonts.loading);
        this.logo.floating = true;
        me.game.add(this.logo, 8);
        this.small_logo = new game.gui.SmallText((game.screenWidth - 80) / 2, (game.screenHeight - 30) / 2, "The Adventure full of Bugs", game.fonts.white);
        this.small_logo.floating = true;
        this.version = new game.gui.SmallText(10, 10, game.version, game.fonts.white);
        this.version.floating = true;
        me.game.add(this.version, 8);
        me.game.add(this.small_logo, 8);
        me.game.sort();



        this.selection = 0;

        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
        me.input.bindKey(me.input.KEY.C, "enter-alternative", true);
        me.input.bindKey(me.input.KEY.UP, "up", true);
        me.input.bindKey(me.input.KEY.DOWN, "down", true);

        game.mechanic.load_settings();
        game.instances.options = null;
    },
    update: function() {
        this.parent();
        if (me.input.isKeyPressed('enter') || me.input.isKeyPressed("enter-alternative")) {
            switch (this.selection) {
                case 0 :
                    me.state.change(me.state.CHARACTER_PICK);
                    break;
                case 1 :
                    if (typeof localStorage.save === "undefined") {
                        game.instances.console.post("No save found");
                    } else {
                        game.mechanic.load_game();
                        me.state.change(me.state.PLAY);
                    }
                    break
                case 2 :
                    delete localStorage.save;
                    game.instances.console.post("save deleted");
                    localStorage.options = false;
                    localStorage.ambient_volume = 0.8;
                    localStorage.effects_volume = 0.8;
                    localStorage.audio_enabled = true;
                    break;
                case 3 :
                    game.mechanic.trigger_options();
                    break;
                case 4 :
                    me.state.change(me.state.CREDITS);
                    break;
            }
        }
        if (me.input.isKeyPressed('up')) {
            game.instances.audio.channels.effects.addEffect("exp_click");
            if (this.selection > 0) {
                this.selection--;
            } else {
                this.selection = 4;
            }
        }

        if (me.input.isKeyPressed('down')) {
            game.instances.audio.channels.effects.addEffect("exp_click");
            if (this.selection < 4) {
                this.selection++;
            } else {
                this.selection = 0;
            }
        }

        this.icon.pos.y = (game.screenHeight / 2) + (this.selection * 10) - 3;
        return true;
    },
    onDestroyEvent: function() {
        me.game.remove(game.instances.console);
        game.instances.console = null;
        me.input.unbindKey(me.input.KEY.ENTER);
        me.input.unbindKey(me.input.KEY.C);
        me.input.unbindKey(me.input.KEY.UP);
        me.input.unbindKey(me.input.KEY.DOWN);
        me.game.remove(this.logo);
        me.game.remove(this.version);
        me.game.remove(this.small_logo);
        me.game.remove(this.icon);
        me.game.remove(this.label);
        me.game.remove(this.buttons.new_game);
        me.game.remove(this.buttons.load_game);
        me.game.remove(this.buttons.credits);
        me.game.remove(this.buttons.delete);
    }
});

game.CreditsScreen = me.ScreenObject.extend({
    init: function() {
        this.parent(true);
        this.gold_font = null;
        this.credits = null;
    },
    onResetEvent: function() {
        console.log("loading credits");
        this.gold_font = new me.BitmapFont("geebeeyay-8x8", 8, 1.0);
        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
        this.credits = new game.gui.Credits(0, 0);
        me.game.add(this.credits, 8);
        me.game.sort();
    },
    update: function() {
        if (me.input.isKeyPressed('enter')) {
            me.state.change(me.state.MENU);
        }
        this.parent();
        return true;
    },
    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
        me.game.remove(this.credits);
        this.credits = null;
    }
});

game.PlayScreen = game.AnimatedScreen.extend({
    onResetEvent: function()
    {
        game.instances.console = new game.gui.Console(0, 0);
        me.game.add(game.instances.console, 9999);
        me.game.sort();


        me.levelDirector.loadLevel("test_map");
        this.parent(); //animation

        me.input.bindKey(me.input.KEY.LEFT, "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.UP, "up");
        me.input.bindKey(me.input.KEY.DOWN, "down");
        me.input.bindKey(me.input.KEY.B, "inventory", true);
        me.input.bindKey(me.input.KEY.X, "attack");
        me.input.bindKey(me.input.KEY.C, "use", true);
        me.input.bindKey(me.input.KEY.ALT, "alt");
        me.input.bindKey(me.input.KEY.ESC, "esc", true);
        me.input.bindKey(me.input.KEY.F, "debug", true);
        me.input.bindKey(me.input.KEY.M, "mana", true);
        me.input.bindKey(me.input.KEY.A, "option_up", true);
        me.input.bindKey(me.input.KEY.S, "option_down", true);
        me.input.bindKey(me.input.KEY.G, "collision", true);

        me.input.bindKey(me.input.KEY.NUM1, "belt1", true);
        me.input.bindKey(me.input.KEY.NUM2, "belt2", true);
        me.input.bindKey(me.input.KEY.NUM3, "belt3", true);
        me.input.bindKey(me.input.KEY.NUM4, "belt4", true);
        me.input.bindKey(me.input.KEY.NUM5, "belt5", true);
        me.input.bindKey(me.input.KEY.NUM6, "belt6", true);
        me.input.bindKey(me.input.KEY.NUM7, "belt7", true);
        me.input.bindKey(me.input.KEY.NUM8, "belt8", true);

        game.instances.backpack = null;
        game.instances.stash = null;
        game.instances.manabook = null;
        game.instances.dialog = null;
        game.instances.shop = null;
        game.instances.options = null;
        game.instances.rain = null;
        game.instances.battle_mode = new game.mechanic.BattleMode();

        me.input.registerPointerEvent('mousemove', me.game.viewport, this.mouse);

        console.log(me.game.currentLevel);

        game.mechanic.initialize_level();
        game.instances.console.clearAll();

    },
    /* ---action to perform when game is finished (state change)---*/
    onDestroyEvent: function()
    {
        me.game.remove(game.instances.console);
        game.instances.console = null;
        me.input.unbindKey(me.input.KEY.LEFT);
        me.input.unbindKey(me.input.KEY.RIGHT);
        me.input.unbindKey(me.input.KEY.UP);
        me.input.unbindKey(me.input.KEY.DOWN);
        me.input.unbindKey(me.input.KEY.B);
        me.input.unbindKey(me.input.KEY.X);
        me.input.unbindKey(me.input.KEY.C);
        me.input.unbindKey(me.input.KEY.ALT);
        me.input.unbindKey(me.input.KEY.ESC);
        me.input.unbindKey(me.input.KEY.F);
        me.input.unbindKey(me.input.KEY.M);
        me.input.unbindKey(me.input.KEY.A);
        me.input.unbindKey(me.input.KEY.S);

        me.input.unbindKey(me.input.KEY.NUM1);
        me.input.unbindKey(me.input.KEY.NUM2);
        me.input.unbindKey(me.input.KEY.NUM3);
        me.input.unbindKey(me.input.KEY.NUM4);
        me.input.unbindKey(me.input.KEY.NUM5);
        me.input.unbindKey(me.input.KEY.NUM6);
        me.input.unbindKey(me.input.KEY.NUM7);
        me.input.unbindKey(me.input.KEY.NUM8);

        me.input.releasePointerEvent('mousemove', me.game.viewport);
    }, mouse: function() {
        //console.log(me.input.mouse.pos.x + " " + me.input.mouse.pos.y);
    }, isGame: function() {
        return true;
    }

});

game.LoadingScreen = me.ScreenObject.extend({
    init: function()
    {
        // pass true to the parent constructor
        // as we draw our progress bar in the draw function
        this.parent(true);
        this.invalidate = false;
        this.loadPercent = 0;
        me.loader.onProgress = this.onProgressUpdate.bind(this);

    },
    onProgressUpdate: function(progress)
    {
        this.loadPercent = progress;
        this.invalidate = true;
    },
    update: function()
    {
        if (this.invalidate === true)
        {
            this.invalidate = false;
            return true;
        }
        return false;
    },
    onDestroyEvent: function()
    {
        // "nullify" all fonts
        this.logo_font = null;
    },
    draw: function(context)
    {
        me.video.clearSurface(context, "black");

        var logo_width = game.fonts.loading.measureText(context, "MANA").width;

        game.fonts.loading.draw(context,
                "MANA",
                ((me.video.getWidth() - logo_width) / 2),
                (me.video.getHeight() - 60) / 2);

        game.fonts.white.draw(context, "The Adventure full of Bugs", (me.video.getWidth() / 2) - 52, me.video.getHeight() / 2);

        var width = Math.floor(this.loadPercent * me.video.getWidth());

        // draw the progress bar
        context.strokeStyle = "silver";
        context.strokeRect(0, (me.video.getHeight() / 2) + 40, me.video.getWidth(), 6);
        context.fillStyle = "#D83939";
        context.fillRect(2, (me.video.getHeight() / 2) + 42, width - 4, 2);
    }
});

game.CharacterPickScreen = me.ScreenObject.extend({
    init: function() {
        this.hair = null;
        this.color = null;
        this.body = null;
        this.buttons = {};

        this.pick_gender = null;
        this.pick_color = null;
        this.current_color = null;
        this.pick_hair_m = null;
        this.pick_hair_f = null;
        this.current_hair = null;
        this.current_gender = null;

        this.text_input = null;

        this.background = null;
    },
    onResetEvent: function() {
        game.instances.console = new game.gui.Console(0, 0);
        me.game.add(game.instances.console, 9999);
        me.game.sort();
        this.pick_gender = ["male", "female"];
        this.pick_color = ["blond", "brown", "black", "green", "blue", "purple", "red"];
        this.current_color = 0;
        this.current_gender = 0;
        this.pick_hair_m = ["short", "bald", "mohawk"];
        this.pick_hair_f = ["long", "mohawk", "mikado", "dreads", "emo"];
        this.current_hair = 0;
        this.background = new game.gui.Background();
        me.game.add(this.background, 0);

        this.hair_down = new game.gui.HumanIcon(140, 40, "m_short_blond");
        this.hair_down.renderable.setCurrentAnimation("iddle_down");
        me.game.add(this.hair_down, 1);
        this.body_down = new game.gui.HumanIcon(140, 40, "m_body");
        this.body_down.renderable.setCurrentAnimation("iddle_down");
        me.game.add(this.body_down, 1);
        this.hair_right = new game.gui.HumanIcon(170, 40, "m_short_blond");
        this.hair_right.renderable.setCurrentAnimation("iddle_right");
        me.game.add(this.hair_right, 1);
        this.body_right = new game.gui.HumanIcon(170, 40, "m_body");
        this.body_right.renderable.setCurrentAnimation("iddle_right");
        me.game.add(this.body_right, 1);
        this.hair_up = new game.gui.HumanIcon(200, 40, "m_short_blond");
        this.hair_up.renderable.setCurrentAnimation("iddle_up");
        me.game.add(this.hair_up, 1);
        this.body_up = new game.gui.HumanIcon(200, 40, "m_body");
        this.body_up.renderable.setCurrentAnimation("iddle_up");
        me.game.add(this.body_up, 1);

        this.buttons.male = new game.gui.FuncButton(100, 100, "Male", "", this, "makeMale");
        me.game.add(this.buttons.male, 1);
        this.buttons.female = new game.gui.FuncButton(200, 100, "Female", "", this, "makeFemale");
        me.game.add(this.buttons.female, 1);
        this.buttons.hair_right = new game.gui.ImageButton(235, 35, "arrow_right", this, "hairRight");
        me.game.add(this.buttons.hair_right, 1);
        this.buttons.hair_left = new game.gui.ImageButton(125, 35, "arrow_left", this, "hairLeft");
        me.game.add(this.buttons.hair_left, 1);
        this.buttons.color_right = new game.gui.ImageButton(235, 50, "arrow_right", this, "colorRight");
        me.game.add(this.buttons.color_right, 1);
        this.buttons.color_left = new game.gui.ImageButton(125, 50, "arrow_left", this, "colorLeft");
        me.game.add(this.buttons.color_left, 1);
        this.buttons.ok = new game.gui.FuncButton(160, 180, "Done", "", this, "play");
        me.game.add(this.buttons.ok, 1);

        this.text_input = new game.gui.TextInput(140, 130, "text", 18);
        me.game.add(this.text_input, 1);

        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
    },
    update: function() {
        if (me.input.isKeyPressed("enter")) {
            console.log("enter");
            this.play();
        }
        return false;
    },
    makeMale: function() {
        this.current_gender = 0;
        this.current_hair = 0;
        this.current_color = 0;

        this.updateHair();
    },
    makeFemale: function() {
        this.current_gender = 1;
        this.current_hair = 0;
        this.current_color = 0;

        this.updateHair();
    },
    hairLeft: function() {
        this.current_hair--;
        if (this.current_hair < 0) {
            if (this.current_gender === 0) {
                this.current_hair = this.pick_hair_m.length - 1;
            } else {
                this.current_hair = this.pick_hair_f.length - 1;
            }

        }
        this.updateHair();
    },
    hairRight: function() {
        this.current_hair++;
        if (this.current_gender === 0) {
            if (this.current_hair === this.pick_hair_m.length) {
                this.current_hair = 0;
            }
        } else {
            if (this.current_hair === this.pick_hair_f.length) {
                this.current_hair = 0;
            }
        }
        this.updateHair();
    },
    colorLeft: function() {
        this.current_color--;
        if (this.current_color < 0) {
            this.current_color = this.pick_color.length - 1;
        }
        this.updateHair();
    },
    colorRight: function() {
        this.current_color++;
        if (this.current_color === this.pick_color.length) {
            this.current_color = 0;
        }
        this.updateHair();
    },
    updateHair: function() {
        var gender, hair, color, name;
        if (this.pick_gender[this.current_gender] === "male") {
            gender = "m";
        } else {
            gender = "f";
        }
        if (this.current_gender === 0 && this.pick_hair_m[this.current_hair] === "bald") {
            color = null;
        }
        if (color === null) {
            if (gender === "m") {
                name = gender + "_" + this.pick_hair_m[this.current_hair];
            } else {
                name = gender + "_" + this.pick_hair_f[this.current_hair];
            }
        } else {
            if (gender === "m") {
                name = gender + "_" + this.pick_hair_m[this.current_hair] + "_" + this.pick_color[this.current_color];
            } else {
                name = gender + "_" + this.pick_hair_f[this.current_hair] + "_" + this.pick_color[this.current_color];
            }
        }
        this.hair_right.renderable.image = me.loader.getImage(name);
        this.hair_up.renderable.image = me.loader.getImage(name);
        this.hair_down.renderable.image = me.loader.getImage(name);
        this.body_right.renderable.image = me.loader.getImage(gender + "_body");
        this.body_up.renderable.image = me.loader.getImage(gender + "_body");
        this.body_down.renderable.image = me.loader.getImage(gender + "_body");
    },
    play: function() {
        if (this.text_input.text.length === 0) {
            game.instances.console.post("You can't have nameless hero");
            return;
        }
        var gender, hair, color;
        if (this.pick_gender[this.current_gender] === "male") {
            gender = "m";
        } else {
            gender = "f";
        }
        if (gender === "m" && this.pick_hair_m[this.current_hair] === "bald") {
            color = null;
        } else {
            color = this.pick_color[this.current_color];
        }

        if (gender === "m") {
            hair = this.pick_hair_m[this.current_hair];
        } else {
            hair = this.pick_hair_f[this.current_hair];
        }
        var body = {
            gender: gender,
            hair: hair,
            color: color,
            name: this.text_input.text
        };
        me.gamestat.add("body", body);

        me.state.change(me.state.PLAY);
    },
    onDestroyEvent: function() {
        me.game.remove(game.instances.console);
        game.instances.console = null;
        me.game.remove(this.background);
        this.background = null;

        me.game.remove(this.hair_right);
        this.hair_right = null;
        me.game.remove(this.body_right);
        this.body_right = null;
        me.game.remove(this.hair_up);
        this.hair_up = null;
        me.game.remove(this.body_up);
        this.body_up = null;
        me.game.remove(this.hair_down);
        this.hair_down = null;
        me.game.remove(this.body_down);
        this.body_down = null;

        me.game.remove(this.buttons.ok);
        this.buttons.ok = null;
        me.game.remove(this.buttons.male);
        this.buttons.male = null;
        me.game.remove(this.buttons.female);
        this.buttons.female = null;
        me.game.remove(this.buttons.hair_left);
        this.buttons.hair_left = null;
        me.game.remove(this.buttons.hair_right);
        this.buttons.hair_right = null;
        me.game.remove(this.buttons.color_left);
        this.buttons.color_left = null;
        me.game.remove(this.buttons.color_right);
        this.buttons.color_right = null;

        me.input.unbindKey(me.input.KEY.ENTER);
    }
});

window.onReady(function()
{
    game.onload();
});