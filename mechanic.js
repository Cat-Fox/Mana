game.mechanic.inventory_push = function(item){
    var inventory = me.gamestat.getItemValue("inventory");
    if(inventory.length === 30){
        return false;
    } else {
        inventory.push(item);
        return true;
    }
}