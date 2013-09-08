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
        this.logo = new game.entities.Logo(100, 10);
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
                    game.mechanic.trigger_options(false);
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

        //Configura all game.instaces variables
        game.setInstances();

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
        this.message = "";
        switch(Number.prototype.random(0,4)){
            case 0 : 
                this.message = "Be patient, trees growing, people dying, game is loading.";
                break;
            case 1 :
                this.message = "Allocating Fun.";
                break;
            case 2 : 
                this.message = "If you are not having fun, you are not dying enough.";
                break;
            case 3 :
                this.message = "If you find a bug, don't be scared, bugs are friendly.";
                break;
            case 4 :
                this.message = "This game is powered by Fun.";
                break;
        }

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
        this.logo_font = null;
    },
    draw: function(context)
    {
        me.video.clearSurface(context, "black");
        var logo_width = game.fonts.loading.measureText(context, "MANA").width;

        game.fonts.loading.draw(context,
                "MANA",
                ((me.video.getWidth() - logo_width) / 2),
                (me.video.getHeight() - 80) / 2);
        game.fonts.white.draw(context, "The Adventure full of Bugs", (me.video.getWidth() / 2) - 60, (me.video.getHeight() / 2) - 10);
        game.fonts.white.draw(context, this.message, 20, me.video.getHeight() - 30);
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
        var gender, color, name;
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