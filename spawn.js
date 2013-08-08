game.Spawn = me.ObjectEntity.extend({
    limit: null,
    respawn: null,
    respawn_timers: null,
    npc: null,
    guids: null,
    width: null,
    height: null,
    init_v: null,
    init: function(x, y, settings) {
        settings.spritewidth = settings.width;
        settings.spriteheight = settings.height;
        this.parent(x, y, settings);
        this.limit = settings.limit;
        this.respawn = settings.time;
        this.npc = settings.npc;
        this.height = settings.height;
        this.width = settings.width;
        this.guids = [];
        this.respawn_timers = [];
        this.init_v = true;
    },
    update: function() {
        if (this.init_v) {
            for (var i = 0; i < this.limit; i++) {
                this.createNPC();
            }
            this.init_v = false;
        }
        for (var i = 0; i < this.guids.length; i++) {
            if (me.game.getEntityByGUID(this.guids[i]) === null) {
                this.guids.splice(i, 1);
                this.respawn_timers.push(me.timer.getTime());
                console.log(this.respawn_timers.length + " " + this.npc + " will be spawned");
            }
        }

        for (var i = 0; i < this.respawn_timers.length; i++) {
            if (me.timer.getTime() > (this.respawn_timers[i] + (this.respawn * 1000))) {
                this.respawn_timers.splice(i, 1);
                console.log(this.respawn_timers.length + " more " + this.npc + " will be spawned");
                this.createNPC();
            }
        }
    },
    createNPC: function() {
        var r_pos = new me.Vector2d();
        r_pos.x = Number.prototype.random(this.pos.x, this.pos.x + this.width);
        r_pos.y = Number.prototype.random(this.pos.y, this.pos.y + this.height);

        var tmp;
        switch (this.npc) {
            case "rat":
                //tmp = me.entityPool.newInstanceOf("WalkerRat", r_pos.x, r_pos.y);
                tmp = new game.WalkerRat(r_pos.x, r_pos.y);
                break;
            case "goblin":
                tmp = new game.npcs.Goblin(r_pos.x, r_pos.y);
                break;
        }
        tmp.stats.stance = "passive";
        me.game.add(tmp, this.z);
        me.game.sort();
        this.guids.push(tmp.GUID);
    }
});

game.DungeonSpawn = me.ObjectEntity.extend({
    init: function(x, y, settings) {

        this.parent(x, y, settings);

        var spawn_type = settings.spawn_type;
        switch (spawn_type) {
            case "destroyable":
                var width = settings.width / 16;
                var height = settings.height / 16;
                for (var row = 0; row < height; row++) {
                    for (var column = 0; column < width; column++) {
                        var chance = Number.prototype.random(0, 1);
                        if (chance === 1) {
                            var barrel = new game.destroyable.Barrel(this.pos.x + (column * 16), this.pos.y + (row * 16));
                            me.game.add(barrel, 3);
                            //console.log("spawn barrel "+barrel.pos.x+"/"+barrel.pos.y);
                        }
                    }
                }

                break;
            case "npc":
                var spawn_size = settings.spawn_size;
                switch (spawn_size) {
                    case "tiny":
                        var chance = Number.prototype.random(0, 2);
                        if (chance === 1) {
                            var enemy = new game.WalkerRat(this.pos.x, this.pos.y);
                            me.game.add(enemy, 3);
                        } else if (chance === 2) {
                            var enemy = new game.npcs.Goblin(this.pos.x, this.pos.y);
                            me.game.add(enemy, 3);
                        }
                        break;
                    case "medium":
                        //always spawn group of 3
                        var type = Number.prototype.random(0, 1);
                        for (var i = 0; i < 3; i++) {
                            var enemy;
                            if (type === 0) {
                                enemy = new game.WalkerRat(this.pos.x + (i * 16), this.pos.y);
                            } else if (type === 1) {
                                enemy = new game.npcs.Goblin(this.pos.x + (i * 16), this.pos.y);
                            }
                            me.game.add(enemy, 3);
                        }
                        break;
                    default:
                        console.log("spawn_size not recognized");
                        break;
                }
                break;
            case "rare":
                    //rare stuff here
                    
                break;
            case "epic":

                break;
            default:
                console.error("spawn type not recognized");
                break;
        }
        me.game.sort();
        me.game.remove(this);
    }
});