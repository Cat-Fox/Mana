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
    name: "house",
    type: "tmx",
    src: "data/house.tmx"
},  {
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
    name: "item-sword1",
    type: "image",
    src: "data/item-sword1.png"
}, {
    name: "sword1",
    type: "image",
    src: "data/sword1.png"
}, {
    name: "target",
    type: "image",
    src: "data/target.png"
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
    name: "smiles16",
    type: "image",
    src: "data/smiles16.png"
},{
    name: "sparks",
    type: "image",
    src: "data/sparks.png"
},{
    name: "inventory_tile",
    type: "image",
    src: "data/inventory_tile.png"
},{
    name: "message",
    type: "image",
    src: "data/message.png"
},{
    name: "particle",
    type: "image",
    src: "data/particle.png"
},{
    name: "particle2",
    type: "image",
    src: "data/particle2.png"
},{
    name: "particle3",
    type: "image",
    src: "data/particle3.png"
},{
    name: "8x8Font",
    type: "image",
    src: "data/8x8Font-white.png"
}, {
    name: "itempick2",
    type: "audio",
    src: "data/sounds/"
}, {
    name: "metal-clash",
    type: "audio",
    src: "data/sounds/"
}, {
    name: "exp_click",
    type: "audio",
    src: "data/sounds/"
}, {
    name: "fire",
    type: "audio",
    src: "data/sounds/"
},{
    name: "pixfont",
    type: "image",
    src: "data/sprite/pixfont.png"
}];



var jsApp = 
{	
    screenWidth: 400,
    screenHeight: 220,
    onload: function()
    {
		
        //webFonts are unasable for scale 2.0!!!
        if (!me.video.init('jsapp', this.screenWidth, this.screenHeight, true, 2.0, true))
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
        me.entityPool.add("Smile", Smile);
        me.entityPool.add("Target", Target);
        me.entityPool.add("Item_sword1", Item_sword1);
        me.entityPool.add("InventoryTile", InventoryTile);
        me.entityPool.add("Fire", Fire);
        me.entityPool.add("CollisionBox", CollisionBox);
        me.entityPool.add("Message", Message);
        me.entityPool.add("Icon", Icon);
        me.entityPool.add("ParticleGenerator", ParticleGenerator);
        
        me.input.bindKey(me.input.KEY.LEFT, "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.UP, "up");
        me.input.bindKey(me.input.KEY.DOWN, "down");
        me.input.bindKey(me.input.KEY.I, "inventory");
        me.input.bindKey(me.input.KEY.X, "attack");
        me.input.bindKey(me.input.KEY.C, "use");
        
        me.gamestat.add("hp", 50);
        me.gamestat.add("exp", 0);
        var inventory = new Array();
        me.gamestat.add("inventory", inventory);
        
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
        
        me.game.addHUD(0, 0, 400, 220);
        me.game.HUD.addItem("HP", new HP(5,210));
        me.game.HUD.setItemValue("HP", 0);
        me.game.HUD.addItem("EnemyHP", new EnemyHP(130,8));
        me.game.HUD.addItem("Inventory", new InventoryItems(336, 156));
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


    