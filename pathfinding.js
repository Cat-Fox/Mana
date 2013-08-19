game.pathfinding.CollisionMap = Object.extend({
    array: null,
    init: function() {
        var collisionLayer;
        var current_level = me.game.currentLevel;
        for (var i = 0; i < current_level.mapLayers.length; i++) {
            if (current_level.mapLayers[i].name === "collision") {
                collisionLayer = current_level.mapLayers[i];
                break;
            }
        }

        this.array = new Array(collisionLayer.rows);
        for (var i = 0; i < this.array.length; i++) {
            this.array[i] = new Array(collisionLayer.cols);
        }

        for (var column = 0; column < collisionLayer.cols; column++) {
            for (var row = 0; row < collisionLayer.rows; row++) {
                if (collisionLayer.layerData[row][column] === null) {
                    this.array[row][column] = true;
                } else {
                    this.array[row][column] = false;
                }
            }
        }
        /*
        for (var column = 0; column < this.array[1].length; column++) {
            for (var row = 0; row < this.array.length; row++) {
                var node;
                if (this.array[row][column]) {
                    node = new game.pathfinding.Node(row , column);
                } else
                {
                    node = new game.pathfinding.CollisionNode(row , column);

                }
                me.game.add(node, game.LAYERS.ITEMS);

            }
        }
        me.game.sort();*/ 
   }
});

game.pathfinding.Node = me.ObjectEntity.extend({
    timer: null,
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);

        var context = settings.image.getContext("2d");
        context.strokeStyle = "green";
        context.lineWidth = 2;
        context.strokeRect(0, 0, settings.spritewidth, settings.spriteheight);
        this.parent(x * 16, y * 16, settings);
        this.timer = me.timer.getTime();
    },
    update: function() {
        /*
         if (me.timer.getTime() > (this.timer + 5000)) {
         me.game.remove(this);
         }
         
         this.parent();
         return false;*/
    }
});

game.pathfinding.CollisionNode = me.ObjectEntity.extend({
    timer: null,
    init: function(x, y) {
        settings = {};
        settings.spritewidth = 16;
        settings.spriteheight = 16;
        settings.image = me.video.createCanvas(settings.spritewidth, settings.spriteheight);

        var context = settings.image.getContext("2d");
        context.strokeStyle = "red";
        context.lineWidth = 2;
        context.strokeRect(0, 0, settings.spritewidth, settings.spriteheight);
        this.parent(x * 16, y * 16, settings);
        this.timer = me.timer.getTime();
    },
    update: function() {/*
     if (me.timer.getTime() > (this.timer + 5000)) {
     me.game.remove(this);
     }
     
     this.parent();
     return false;*/
    }
});

game.pathfinding.getPlayerNode = function() {
    if (game.instances.player === null) {
        return null;
    }
    var result = new me.Vector2d(0, 0);
    result.x = Math.floor((game.instances.player.pos.x + 10) / 16);
    result.y = Math.floor((game.instances.player.pos.y + 13) / 16);
    return result;
};

game.pathfinding.getObjectNode = function(object) {
    var result = new me.Vector2d(0, 0);
    result.x = Math.floor((object.pos.x + object.collisionBox.colPos.x) / 16);
    result.y = Math.floor((object.pos.y + object.collisionBox.colPos.y) / 16);
    return result;
};

game.pathfinding.findPath = function(node_a, node_b) {
    var path = [];
    var current_node = node_a.clone();
    path.push(current_node.clone());
    var closed_list = [];
    closed_list.push(current_node.clone());
    var cost = 0;
    while (Math.floor(current_node.distance(node_b)) !== 0) {
        var a_star = new game.pathfinding.AStarNode(cost, current_node, node_b, closed_list);
        var lowest = a_star.getLowest();
        var draw = new game.pathfinding.Node(a_star.nodes[lowest].x, a_star.nodes[lowest].y);
        me.game.add(draw, game.LAYERS.ITEMS);
        me.game.sort();
        cost += 1;
        current_node.x = a_star.nodes[lowest].x;
        current_node.y = a_star.nodes[lowest].y;
        closed_list.push(current_node.clone());
        path.push(current_node.clone());
    }
    return path;
};

game.pathfinding.manhatan = function(node_a, node_b) {
    var width = Math.abs(node_a.x - node_b.x);
    var height = Math.abs(node_a.y - node_b.y);
    return width + height;
};

game.pathfinding.getSuroundingNodes = function(node) {
    var result = [];
    var possible = [];
    possible.push(new me.Vector2d(node.x, node.y + 1));
    possible.push(new me.Vector2d(node.x, node.y - 1));
    possible.push(new me.Vector2d(node.x + 1, node.y));
    possible.push(new me.Vector2d(node.x - 1, node.y));
    for (var i = 0; i < possible.length; i++) {
        var collision = game.instances.collisionMap.array[possible[i].x][possible[i].y];
        if (collision) {
            result.push(new me.Vector2d(possible[i].x, possible[i].y));
        }
    }
    //me.game.sort();
    return result;
};

game.pathfinding.AStarNode = Object.extend({
    manhatans: null,
    nodes: null,
    cost: null,
    init: function(cost, current, target, closed_list) {
        this.cost = cost + 1;
        this.nodes = game.pathfinding.getSuroundingNodes(current);
        for (var i = 0; i < this.nodes.length; i++) {
            for (var j = 0; j < closed_list.length; j++) {
                if (this.nodes[i].equals(closed_list[j])) {
                    this.nodes.splice(i, 1);
                    i = this.nodes.length;
                    break;
                }
            }
        }
        this.manhatans = [];
        for (var i = 0; i < this.nodes.length; i++) {
            this.manhatans.push(game.pathfinding.manhatan(this.nodes[i], target));
        }
    },
    getLowest: function() {
        var lowest = 0;
        for (var i = 0; i < this.manhatans.length; i++) {
            if (this.manhatans[i] < this.manhatans[lowest]) {
                lowest = i;
            }
        }
        return lowest;
    }
});