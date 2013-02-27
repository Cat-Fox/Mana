/*!
 * 
 *   melonJS
 *   http://www.melonjs.org
 *		
 *   Step by step game creation tutorial
 *
 **/

// game resources
var g_resources = [{
    name: "tilesheet",
    type: "image",
    src: "data/tilesheet.png"
}, {
    name: "test_map",
    type: "tmx",
    src: "data/test_map.tmx"
}, {
    name: "human",
    type: "image",
    src: "data/human.png"
}, {
    name: "human_up",
    type: "image",
    src: "data/human_up.png"
}, {
    name: "human_right",
    type: "image",
    src: "data/human_right.png"
}, {
    name: "human_down",
    type: "image",
    src: "data/human_down.png"
}, {
    name: "burger",
    type: "image",
    src: "data/burger.png"
}, {
    name: "npc_guard",
    type: "image",
    src: "data/npc_guard.png"
}, {
    name: "npc_rat",
    type: "image",
    src: "data/npc_rat.png"
}, {
    name: "shadow16",
    type: "image",
    src: "data/shadow16.png"
}, {
    name: "itempick2",
    type: "audio",
    src: "data/sounds/"
},{
    name: "pixfont",
    type: "image",
    src: "data/sprite/pixfont.png"
},{
    name: "sparks",
    type: "image",
    src: "data/sparks.png"
}];



var jsApp = 
{	
    /* ---Initialize the jsApp---*/
    onload: function()
    {
		
        // init the video
        if (!me.video.init('jsapp', 400, 220, true, 2.0, true))
        {
            alert("Sorry but your browser does not support html 5 canvas.");
            return;
        }
				
        // initialize the "audio"
        me.audio.init("mp3,ogg");
		
        // set all resources to be loaded
        me.loader.onload = this.loaded.bind(this);
		
        // set all resources to be loaded
        me.loader.preload(g_resources);

        // load everything & display a loading screen
        me.state.change(me.state.LOADING);
    },
	
	
    /* ---callback when everything is loaded---*/
    loaded: function ()
    {
        // set the "Play/Ingame" Screen Object
        me.state.set(me.state.PLAY, new PlayScreen());
        me.entityPool.add("Player", Player);
        me.entityPool.add("Burger", Burger);
        me.entityPool.add("Guard", Guard);
        me.entityPool.add("Rat", Rat);
        me.entityPool.add("Shadow", Shadow);
        me.entityPool.add("Sparks", Sparks);
        
        me.input.bindKey(me.input.KEY.LEFT, "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.UP, "up");
        me.input.bindKey(me.input.KEY.DOWN, "down");
        me.input.bindKey(me.input.KEY.I, "inventory");
        me.input.bindKey(me.input.KEY.X, "attack");
        
        //me.debug.renderHitBox = true;
        
        
        // start the game 
        me.state.change(me.state.PLAY);
    }

}; // jsApp

/* the in game stuff*/
var PlayScreen = me.ScreenObject.extend(
{

    onResetEvent: function()
    {	
        // stuff to reset on state change
        // load a level
        me.levelDirector.loadLevel("test_map");
        
        me.game.addHUD(0, 200, 400, 20);
        me.game.HUD.addItem("HP", new HP(3,15));
        me.game.HUD.setItemValue("HP", 50);
        me.game.sort();
    },
	
	
    /* ---action to perform when game is finished (state change)---*/
    onDestroyEvent: function()
    {
	me.game.DisableHud();
    }

});


//bootstrap :)
window.onReady(function() 
{
    jsApp.onload();
});


    