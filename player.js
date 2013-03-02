var Player = me.ObjectEntity.extend({
    shadow: null,
    inventory: null,
    attacking: false,
    init: function(x, y, settings){
        this.parent(x, y, settings);
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS_BOTH);
        
        this.addAnimation("right", [5,6,7,8]);
        this.addAnimation("up", [20,21,22,23]);
        this.addAnimation("down", [35,36,37,38]);
        this.addAnimation("iddle_right", [10,11], 30);
        this.addAnimation("iddle_up", [25,26], 30);
        this.addAnimation("iddle_down", [40,41], 30);
        this.addAnimation("attack_down", [30,31,32,33,34]);
        this.addAnimation("attack_up", [15,16,17,18,19]);
        this.addAnimation("attack_right", [0,1,2,3,4]);
        
        this.setVelocity(1.5,1.5);
        this.gravity = 0;
        this.updateColRect(10, 12, 5, 22);
        this.setCurrentAnimation("iddle_down");
        
        this.shadow = new Shadow(this.pos.x+8,this.pos.y+13);
        me.game.add(this.shadow, 4);
        me.game.sort();
        
    },
    
    update: function(){
        if(this.attacking){
            if(this.getCurrenAnimationFrame() === 34){
                this.attacking = false;
            }
        }
        
        if (me.input.isKeyPressed('attack') && this.attacking === false){
            if(this.isCurrentAnimation("up") || this.isCurrentAnimation("idle_up")){
                this.setCurrentAnimation("attack_up");
            } else if(this.isCurrentAnimation("down") || this.isCurrentAnimation("idle_down")){
                this.setCurrentAnimation("attack_down");
            } else if(this.isCurrentAnimation("right") || this.isCurrentAnimation("idle_right")){
                this.setCurrentAnimation("attack_right");
            }
        } else if (me.input.isKeyPressed('left')) {
            // flip the sprite on horizontal axis
            this.setCurrentAnimation("right");
            this.flipX(true);
            // update the entity velocity
            this.vel.x -= this.accel.x * me.timer.tick;
            this.vel.y = 0;
        } else if (me.input.isKeyPressed('right')) {
            this.setCurrentAnimation("right");
            // unflip the sprite
            this.flipX(false);
            // update the entity velocity
            this.vel.x += this.accel.x * me.timer.tick;
            this.vel.y = 0;
        } else if (me.input.isKeyPressed('up')) {
            this.setCurrentAnimation("up");
            // update the entity velocity
            this.vel.y -= this.accel.x * me.timer.tick;
            this.vel.x = 0;
        } else if (me.input.isKeyPressed('down')) {
            this.setCurrentAnimation("down");
            // unflip the sprite
            this.flipX(false);
            // update the entity velocity
            this.vel.y += this.accel.x * me.timer.tick;
            this.vel.x = 0;
        } else {
            this.vel.x = 0;
            this.vel.y = 0;
            if (this.isCurrentAnimation('right')){
                this.setCurrentAnimation('iddle_right');
            } else if (this.isCurrentAnimation('up')){
                this.setCurrentAnimation('iddle_up');
            } else if(this.isCurrentAnimation('down')){
                this.setCurrentAnimation('iddle_down');
            }
        }
        
        var res = me.game.collide(this);
         
        if(res){
            if((res.obj.type === "npc") || (res.obj.type === me.game.ENEMY_OBJECT)){
                if (res.x !== 0){
                    // x axis
                    if (res.x<0){
                        this.vel.x = -this.vel.x;
                        this.vel.y = 0;
                    }else{
                        this.vel.x = -this.vel.x;
                        this.vel.y = 0;
                    }
                }
                else{
                    // y axis
                    if (res.y<0){
                        this.vel.y = -this.vel.y;
                        this.vel.x = 0;
                    }else{
                        this.vel.y = -this.vel.y;
                        this.vel.x = 0;
                    }
                }
            }
        }
         
        
        // check & update player movement
        this.updateMovement();
        this.shadow.pos.x = this.pos.x + 8;
        this.shadow.pos.y = this.pos.y + 13;
 
        
        // update object animation
        this.parent();
        return true;

    }
});

