game.mechanic.History = Object.extend({
    killed_monsters: null,
    previous_level: null,
    npcs_talks: null,
    init: function(killed_monsters, npcs_talks) {
        killed_monsters = typeof killed_monsters !== 'undefined' ? killed_monsters : 0;
        this.previous_level = null;
        npcs_talks = typeof npcs_talks !== 'undefined' ? npcs_talks : {blacksmith: false, priest :false, stash: false, wizard: false};
        this.killed_monsters = killed_monsters;
        this.npcs_talks = npcs_talks;
    }
});
