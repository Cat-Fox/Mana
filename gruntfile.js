module.exports = function(grunt) {
    var sourceFiles = [
        'src/functions.js',
        'src/main.js',
        'src/instances.js',
        'src/resources.js',
        'src/fonts.js',
        'src/audio.js',
        'src/mechanic.js',
        'src/pathfinding.js',
        'src/stats.js',
        'src/effects.js',
        'src/entities.js',
        'src/gui_components.js',
        'src/gui_advanced.js',
        'src/gui_inventory.js',
        'src/screens.js',
        'src/weapons.js',
        'src/items.js',
        'src/spells.js',
        'src/destroyable.js',
        'src/npc.js',
        'src/player.js',
        'src/ally.js',
        'src/enemy.js',
        'src/spawn.js',
        'src/drop.js'
    ];
    
        var devFiles = [
        'src/functions.js',
        'src/main.js',
        'src/instances.js',
        'src/resources-dev.js',
        'src/fonts.js',
        'src/audio.js',
        'src/mechanic.js',
        'src/pathfinding.js',
        'src/stats.js',
        'src/effects.js',
        'src/entities.js',
        'src/gui_components.js',
        'src/gui_advanced.js',
        'src/gui_inventory.js',
        'src/screens.js',
        'src/weapons.js',
        'src/items.js',
        'src/spells.js',
        'src/destroyable.js',
        'src/npc.js',
        'src/player.js',
        'src/ally.js',
        'src/enemy.js',
        'src/spawn.js',
        'src/drop.js'
    ];

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                src: sourceFiles,
                dest: 'build/<%= pkg.name %>-<%= pkg.version %>.js'
            },
            dev: {
              src: devFiles,
              dest: 'build/<%= pkg.name %>-<%= pkg.version %>-dev.js'
            }
        },
        uglify: {
            options: {
                report: 'min',
                preserveComments: 'some'
            },
            dist: {
                files: {
                    'build/<%= pkg.name %>-<%= pkg.version %>-min.js': ['<%= concat.dist.dest %>']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat', 'uglify']);
};