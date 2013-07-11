game.mechanic.inventory_push = function(item) {
    var inventory = me.gamestat.getItemValue("inventory");
    if (inventory.length === 30) {
        return false;
    } else {
        inventory.push(item);
        return true;
    }
}

game.mechanic.belt_use = function(id) {
    console.log(id);
    var belt = me.gamestat.getItemValue("belt")[id];
    if (typeof belt !== "undefined") {
        game.mechanic.trigger_item(belt);
    }
}

game.mechanic.trigger_item = function(id) {

    var selected = me.gamestat.getItemValue("inventory")[id];
    var player = game.instances.player;
    switch (selected.type) {
        case "consumable":
            if (typeof selected.attributes.heal !== "undefined") {
                player.updateHP(selected.attributes.heal);
            }

            var belt = me.gamestat.getItemValue("belt");
            for (var i = 0; i < belt.length; i++) {
                if (belt[i] === id) {
                    belt.splice(i, 1);
                }
            }
            me.gamestat.getItemValue("inventory").splice(id, 1);
            break;
        case "default":
            console.log("nothing");
            break;
    }
}