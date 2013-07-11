game.Spawn = me.ObjectEntity.extend({
    limit: null,
    respawn: null,
    respawn_timers: null,
    npc: null,
    guids: null,
    width: null,
    height: null,
    npc_width: null,
    npc_height: null,
    init: null,
    init: function(x, y, settings) {
        settings.spritewidth = settings.width;
        settings.spriteheight = settings.height;
        console.log(settings);
        this.parent(x, y, settings);
        this.limit = settings.limit;
        this.respawn = settings.time;
        this.npc = settings.npc;
        this.height = settings.height;
        this.width = settings.width;
        this.npc_height = settings.npc_height;
        this.npc_width = settings.npc_width;
        this.guids = [];
        this.respawn_timers = [];
        this.init = true;
    },
    update: function() {
        if (this.init) {
            for (var i = 0; i < this.limit; i++) {
                this.createNPC();
            }
            this.init = false;
        }
        for (var i = 0; i < this.guids.length; i++) {
            if (me.game.getEntityByGUID(this.guids[i]).alive === false) {
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
        }
        me.game.add(tmp, this.z);
        me.game.sort();
        this.guids.push(tmp.GUID);
    }
});