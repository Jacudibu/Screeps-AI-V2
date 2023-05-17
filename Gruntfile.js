module.exports = function(grunt) {
    let config = require('./.secrets.json');
    let branch = "main"
    let email = grunt.option('email') || config.email;
    let token = grunt.option('token') || config.token;

    // this uses github:cavejay/grunt-screeps since the official version doesn't support auth token... yet
    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.initConfig({
        screeps: {
            options: {
                email: email,
                token: token,
                branch: branch,
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
                    },
                }],
                options: {
                    process: function (content, srcpath) {
                        // Change the / in imports to the flattened . structure
                        const pattern = /require\(['"](.+)['"]\)/g;

                        let transformedContent = content.replace(pattern, function(match, filePath) {
                            const transformedPath = filePath.replace(/\//g, '.');
                            return "require('" + transformedPath + "')";
                        });

                        return transformedContent;
                    }
                }
            }
        },
    });

    grunt.registerTask('rebuild',  ['clean', 'copy']);
    grunt.registerTask('main',  ['rebuild', 'screeps']);
};