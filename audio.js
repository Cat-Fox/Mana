game.audio.Main = Object.extend({
    channels: null,
    enable: null,
    init: function() {
        this.channels = {};
        this.channels.ambient = new game.audio.Channel();
        this.channels.effects = new game.audio.Channel();
        this.enable = true;
    },
    switchEnable: function(value) {
        if (value) {
            me.audio.enable();
            this.enable = true;
        } else {
            me.audio.disable();
            this.enable = false;
        }
    }
});

game.audio.Channel = Object.extend({
    tracks: null,
    ambient: null,
    volume: null,
    init: function() {
        this.tracks = [];
        this.volume = 1;
        this.ambient = null;
        console.log("init");
    },
    setVolume: function(volume_v) {
        this.volume = volume_v / 100;
        console.log(this.volume + " " + volume_v);
    },
    stopAll: function() {
        for (var i = 0; i < this.tracks.length; i++) {
            me.audio.stop(this.tracks[i]);
        }
    },
    resumeAmbient: function() {
        me.audio.resumeTrack(this.ambient);
    },
    addEffect: function(name) {
        var guid = game.mechanic.guid();
        this.tracks.push(guid);
        me.audio.play(name, false, this.remove(guid), this.volume);
    },
    changeAmbient: function(name) {
        console.log("volume " + this.volume);
        if (this.ambient === null) {
            this.ambient = name;
            me.audio.playTrack(name, this.volume);
        }
        else if (this.ambient !== null && this.ambient !== name) {
            this.stopAmbient();
            this.ambient = name;
            me.audio.playTrack(name, this.volume);
        }

    },
    stopAmbient: function() {
        if (this.ambient !== null) {
            me.audio.stopTrack(this.ambient);
            //me.audio.unload(this.ambient);
            this.ambient = null;
        }
    },
    remove: function(guid) {
        for (var i = 0; i < this.tracks.length; i++) {
            if (guid === this.tracks[i]) {
                this.tracks.splice(i, 1);
            }
        }
    }
});
