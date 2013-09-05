game.setInstances = function() {
    game.instances.pause_menu = null;
    game.instances.enemy_panel = null;
    game.instances.backpack = null;
    game.instances.stash = null;
    game.instances.manabook = null;
    game.instances.dialog = null;
    game.instances.shop = null;
    game.instances.options = null;
    game.instances.rain = null;
    game.instances.battle_mode = new game.mechanic.BattleMode();
};