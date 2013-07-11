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
            object_layer: 4,
            effects: {},
            onload: function()
            {
                if (!me.video.init('screen', this.screenWidth, this.screenHeight, true, 2.0, true)) {
                    alert("Sorry but your browser does not support html 5 canvas.");
                    return;
                }

                // add "#debug" to the URL to enable the debug Panel
                if (document.location.hash === "#debug") {
                    window.onReady(function() {
                        me.plugin.register.defer(debugPanel, "debug");
                    });
                }

                //set loading screen
                me.state.set(me.state.LOADING, new game.LoadingScreen());
                // initialize the "audio"
                me.audio.init("mp3,ogg");
                // set all resources to be loaded
                me.loader.onload = this.loaded.bind(this);
                // set all resources to be loaded
                me.loader.preload(game.resources);
                // load everything & display a loading screen
                me.state.change(me.state.LOADING);
            },
            /* ---callback when everything is loaded---*/
            loaded: function()
            {
                // set the "Play/Ingame" Screen Object
                me.state.set(me.state.PLAY, new game.PlayScreen());
                me.state.set(me.state.MENU, new game.MenuScreen());
                me.state.set(me.state.CREDITS, new game.CreditsScreen());

                me.entityPool.add("Player", game.Player);
                //------------------ITEMS------------------------
                me.entityPool.add("Burger", game.Burger, true);
                me.entityPool.add("Axe", game.items.Axe, true);
                me.entityPool.add("Item_sword1", game.items.Item_sword1, true);
                me.entityPool.add("LongSword", game.items.Item_sword1, true);
                me.entityPool.add("ShortSword", game.items.Item_sword2, true);
                me.entityPool.add("Item_sword2", game.items.Item_sword2, true);
                me.entityPool.add("Morningstar", game.items.Morningstar, true);
                me.entityPool.add("HealthPotion", game.consumables.HealthPotion, true);
                me.entityPool.add("Gold", game.consumables.Money, true);
                me.entityPool.add("LeatherArmor", game.items.LeatherArmor, true);
                me.entityPool.add("MailArmor", game.items.MailArmor, true);
                //------------------Entities---------------------------
                me.entityPool.add("Shadow", game.Shadow, true);
                me.entityPool.add("Sparks", game.Sparks, true);
                me.entityPool.add("Smile", game.Smile, true);
                me.entityPool.add("Target", game.Target, true);
                me.entityPool.add("Fire", game.Fire);
                me.entityPool.add("CollisionBox", game.CollisionBox, true);
                me.entityPool.add("Message", game.Message);
                //Particles
                me.entityPool.add("ParticleGenerator", game.ParticleGenerator);
                me.entityPool.add("Particle", game.Particle, true);
                //NPCS
                me.entityPool.add("WalkerNPC", game.WalkerNPC, true);
                me.entityPool.add("WalkerRat", game.WalkerRat, true);
                me.entityPool.add("Guard", game.Guard);
                me.entityPool.add("Spawn", game.Spawn);
                //Destroyable
                me.entityPool.add("Barrel", game.destroyable.Barrel, true);
                //---------------------GUI--------------------------------
                me.entityPool.add("Backpack", game.Backpack, true);
                me.entityPool.add("Icon", game.Icon, true);
                me.entityPool.add("InventoryTile", game.InventoryTile, true);
                me.entityPool.add("CharacterTile", game.CharacterTile, true);
                //Texts
                me.entityPool.add("SmallText", game.SmallText, true);
                me.entityPool.add("BigText", game.BigText, true);
                me.entityPool.add("HitText", game.HitText, true);
                me.entityPool.add("DeathSmoke", game.DeathSmoke, true);
                //Buttons
                me.entityPool.add("Button", game.Button, true);
                me.entityPool.add("DropButton", game.DropButton, true);
                me.entityPool.add("EquipButton", game.EquipButton, true);
                me.entityPool.add("PlusSkillButton", game.PlusSkillButton, true);


                //player stuff
                me.gamestat.add("hp", 50);
                me.gamestat.add("maxhp", 50);
                me.gamestat.add("exp", 0);
                me.gamestat.add("level", 1);
                me.gamestat.add("next_level", 100);
                me.gamestat.add("str", 1);
                me.gamestat.add("int", 1);
                me.gamestat.add("agi", 1);
                me.gamestat.add("end", 1);
                me.gamestat.add("skill", 0);
                me.gamestat.add("money", 0);
                var inventory = new Array();
                me.gamestat.add("inventory", inventory);
                var equip = {weapon: null, armor: null, artefact: null};
                me.gamestat.add("equip", equip);
                var belt = new Array(8);
                me.gamestat.add("belt", belt);


                //me.debug.renderHitBox = true;


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
        console.log("loaded");
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

        this.icon = new game.Icon((game.screenWidth / 2) - 20, game.screenHeight / 2, "item-sword1");
        this.icon.renderable.setCurrentAnimation("active");
        me.game.add(this.icon, 8);
        this.buttons.new_game = new game.BigStaticText(game.screenWidth / 2, game.screenHeight / 2, "NEW", this.bmf_gold);
        me.game.add(this.buttons.new_game, 8);
        this.buttons.load_game = new game.BigStaticText(game.screenWidth / 2, game.screenHeight / 2 + 10, "LOAD", this.bmf_gold);
        me.game.add(this.buttons.load_game, 8);
        this.buttons.credits = new game.BigStaticText(game.screenWidth / 2, game.screenHeight / 2 + 20, "CREDITS", this.bmf_gold);
        me.game.add(this.buttons.credits, 8);
        this.label = new game.BigStaticText(20, game.screenHeight - 10, "PRESS ENTER TO SELECT", this.bmf_geebee);
        me.game.add(this.label, 8);
        this.logo = new game.SmallText((game.screenWidth - 60) / 2, (game.screenHeight - 90) / 2, "MANA", game.fonts.loading);
        this.logo.floating = true;
        me.game.add(this.logo, 8);
        this.small_logo = new game.SmallText((game.screenWidth - 80) / 2, (game.screenHeight - 30) / 2, "The Adventure full of Bugs", game.fonts.white);
        this.small_logo.floating = true;
        me.game.add(this.small_logo, 8);
        me.game.sort();

        this.selection = 0;
        this.selection_options = {
            NEW: me.state.PLAY,
            LOAD: me.state.PLAY,
            CREDITS: me.state.CREDITS
        };

        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
        me.input.bindKey(me.input.KEY.UP, "up", true);
        me.input.bindKey(me.input.KEY.DOWN, "down", true);
    },
    update: function() {
        this.parent();
        if (me.input.isKeyPressed('enter')) {
            switch (this.selection) {
                case 0 :
                    me.state.change(me.state.PLAY);
                    break
                case 1 :
                    me.state.change(me.state.PLAY);
                    break
                case 2 :
                    me.state.change(me.state.CREDITS);
                    break
            }
        }
        if (me.input.isKeyPressed('up')) {
            if (this.selection > 0) {
                this.selection--;
            } else {
                this.selection = 2;
            }
        }

        if (me.input.isKeyPressed('down')) {
            if (this.selection < 2) {
                this.selection++;
            } else {
                this.selection = 0;
            }
        }

        this.icon.pos.y = (game.screenHeight / 2) + (this.selection * 10) - 3;
        return true;
    },
    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
        me.input.unbindKey(me.input.KEY.UP, "up", true);
        me.input.unbindKey(me.input.KEY.DOWN, "down", true);
    }
});

game.CreditsScreen = me.ScreenObject.extend({
    init: function() {
        this.parent(true);
        this.gold_font = null;
    },
    onResetEvent: function() {
        console.log("loading credits");
        this.gold_font = new me.BitmapFont("geebeeyay-8x8", 8, 1.0);
        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
    },
    draw: function(context) {
        this.parent(context);

        context.fillStyle = "black";
        context.fillRect(0, 0, 400, 220);
        this.gold_font.draw(context, "AUTHOR NIKITA ZARAKA VANKU", (game.screenWidth / 2) - 30, 20);
        this.gold_font.draw(context, "SPRITE TILESETS", game.screenWidth / 2, 40);
        this.gold_font.draw(context, "MOZZILA BROWSERQUEST", game.screenWidth / 2, 50);
        this.gold_font.draw(context, "OPENGAMEART.ORG", game.screenWidth / 2, 60);

        this.gold_font.draw(context, "PRESS ENTER TO GET BACK", 20, game.screenHeight - 10);
    },
    update: function() {
        if (me.input.isKeyPressed('enter')) {
            me.state.change(me.state.MENU);
        }
        return true;
    },
    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
    }
});

game.PlayScreen = game.AnimatedScreen.extend({
    onResetEvent: function()
    {
        console.log("loading level");
        me.levelDirector.loadLevel("test_map");
        console.log("level loaded");
        this.parent(); //animation

        me.input.bindKey(me.input.KEY.LEFT, "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.UP, "up");
        me.input.bindKey(me.input.KEY.DOWN, "down");
        me.input.bindKey(me.input.KEY.B, "inventory");
        me.input.bindKey(me.input.KEY.X, "attack");
        me.input.bindKey(me.input.KEY.C, "use");
        me.input.bindKey(me.input.KEY.ALT, "alt");
        
        me.input.bindKey(me.input.KEY.NUM1, "1");
        me.input.bindKey(me.input.KEY.NUM2, "2");
        me.input.bindKey(me.input.KEY.NUM3, "3");
        me.input.bindKey(me.input.KEY.NUM4, "4");
        me.input.bindKey(me.input.KEY.NUM5, "5");
        me.input.bindKey(me.input.KEY.NUM6, "6");
        me.input.bindKey(me.input.KEY.NUM7, "7");
        me.input.bindKey(me.input.KEY.NUM8, "8");
        
        me.input.registerPointerEvent('mousemove', me.game.viewport, this.mouse);

    },
    /* ---action to perform when game is finished (state change)---*/
    onDestroyEvent: function()
    {
        me.input.unbindKey(me.input.KEY.LEFT, "left");
        me.input.unbindKey(me.input.KEY.RIGHT, "right");
        me.input.unbindKey(me.input.KEY.UP, "up");
        me.input.unbindKey(me.input.KEY.DOWN, "down");
        me.input.unbindKey(me.input.KEY.B, "inventory");
        me.input.unbindKey(me.input.KEY.X, "attack");
        me.input.unbindKey(me.input.KEY.C, "use");

        me.input.releasePointerEvent('mousemove', me.game.viewport);
    }, mouse: function() {
        //console.log(me.input.mouse.pos.x + " " + me.input.mouse.pos.y);
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

window.onReady(function()
{
    game.onload();
});


