var Guard = me.ObjectEntity.extend({
    sparks: null,
    time: null,
    hp: 100,
    target: null,
    shadow: null,
    use: null,
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.collidable = true;
        this.addAnimation("idle", [0, 1], 35);
        this.setCurrentAnimation("idle");
        this.type = "npc";
        this.updateColRect(5, 17, 2, 18);

        this.shadow = new Shadow(this.pos.x + 6, this.pos.y + 8);
        me.game.add(this.shadow, 4);
        me.game.sort();
    },
    update: function() {
        var targeted = false;
        
        var res = me.game.collide(this, true);
        if (res.length >= 1) {
            for (var i = 0; i< res.length; i++) {
                if (res[i].obj.type === "human_target") {
                    targeted = true;
                    me.game.HUD.setItemValue("EnemyHP", this.hp + ";guard;ally");
                    if (this.target === null) {
                        this.target = new Target(this.pos.x + 6, this.pos.y + 8, "green");
                        me.game.add(this.target, 3);
                        me.game.sort();
                    }
                }
                if (res[i].obj.type === "human_use") {
                    if (this.use === null) {
                        console.log("guard_use");
                        var text = "";
                        var rand = Math.floor(Math.random()*6);
                        switch(rand){
                            case 0: text = "Ondro divej se do sve obrazovky";
                                break;
                            case 1: text = "Hello traveler!";
                                break;
                            case 2: text = "Ololol";
                                break;
                            case 3: text = "Javascript sucks, but\n dont tell the programmer";
                                break;
                            case 4: text = "If you kill me, you suck";
                                break;
                            case 5: text = "IVH is boooooooring";
                                break
                        }
                        console.log(rand + " " + text);
                        this.use = new Message(this.pos.x - 25, this.pos.y - 40, text);
                        me.game.add(this.use, 6);
                        me.game.sort();
                    }
                }
            }
        }

        if (targeted === false && this.target !== null) {
            me.game.remove(this.target);
            this.target = null;
            if (this.use !== null) {
                me.game.remove(this.use);
                this.use = null;
            }
        }

        this.parent();
        return true;
    },
    onDestroyEvent: function() {
        //shadow will always be created, but target is dependent on update function
        me.game.remove(this.shadow);
        //me.game.remove(this.target);
    },
    createSparks: function() {
        if (this.sparks === null) {
            this.sparks = new Sparks(this.pos.x, this.pos.y);
            me.game.add(this.sparks, 4);
            me.game.sort();
            this.time = me.timer.getTime();
        }
    }
});