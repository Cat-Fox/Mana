var game =
        {
            screenWidth: 400,
            screenHeight: 220,
            guiLayer: 15,
            weapons: {},
            consumables: {},
            gui: {},
            fonts: {},
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
                me.entityPool.add("Item_sword1", game.Item_sword1, true);
                me.entityPool.add("Item_sword2", game.Item_sword2, true);
                me.entityPool.add("HealthPotion", game.consumables.HealthPotion, true);
                me.entityPool.add("Money", game.consumables.Money, true);
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
                
                
                //me.debug.renderHitBox = true;


                // start the game
                me.state.change(me.state.MENU);
            }

        };

game.MenuScreen = me.ScreenObject.extend({
    init: function() {
        this.parent(true);

        this.bloxxit_font = null;
        this.geebee_font = null;
        this.icon = null;

        this.selection_options = null;
        this.selection = 0;

    },
    onResetEvent: function() {
        this.bloxxit_font = new me.BitmapFont("gold_8x8", 8, 1.0, "0x41");
        this.geebee_font = new me.BitmapFont("geebeeyay-8x8", 8, 1.0);

        this.icon = new game.Icon((game.screenWidth / 2) - 20, game.screenHeight / 2, "item-sword1");
        me.game.add(this.icon, 8);
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
    draw: function(context) {
        this.parent(context);
        context.fillStyle = "black";
        context.fillRect(0, 0, 400, 220);
        this.bloxxit_font.draw(context, "NEW", game.screenWidth / 2, game.screenHeight / 2);
        this.bloxxit_font.draw(context, "LOAD", game.screenWidth / 2, game.screenHeight / 2 + 10);
        this.bloxxit_font.draw(context, "CREDITS", game.screenWidth / 2, game.screenHeight / 2 + 20);
        this.geebee_font.draw(context, "PRESS ENTER TO SELECT", 20, game.screenHeight - 10);
        this.icon.draw(context);
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

game.PlayScreen = game.AnimatedScreen.extend({
    onResetEvent: function()
    {

        // stuff to reset on state change
        // load a level
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
        me.input.bindKey(me.input.KEY.F, "f");

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

//bootstrap :)
window.onReady(function()
{
    game.onload();
});


