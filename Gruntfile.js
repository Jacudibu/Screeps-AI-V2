module.exports = function(grunt) {
    let config = require('./.secrets.json');
    let branch = grunt.option('branch') || config.branch;
    let email = grunt.option('email') || config.email;
    let token = grunt.option('token') || config.token;
    let ptr = grunt.option('ptr') ? true : config.ptr;

    // this uses github:cavejay/grunt-screeps since the official version doesn't support auth token... yet
    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-rsync');

    grunt.initConfig({
        screeps: {
            options: {
                email: email,
                token: token,
                branch: branch,
                ptr: ptr
            },
            dist: {
                src: ['dist/*.js']
            }
        },
        clean: {
            'dist': ['dist']
        },
        copy: {
            screeps: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: '**',
                    dest: 'dist/',
                    filter: 'isFile',
                    rename: function (dest, src) {
                        // Change the path name utilize dots for folders
                        return dest + src.replace(/\//g, '.');
                    }
                }],
            }
        },
    });

    grunt.registerTask('main',  ['clean', 'copy:screeps', 'screeps']);
};