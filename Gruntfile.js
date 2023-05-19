/* Create a secrets-<config> file and pass --config=<config> as an argument.
 * For screeps-world, email & token are required.
 * For private servers, email & password.
 **/
module.exports = function(grunt) {
    const config = require("./.secrets-" + grunt.option("config") + ".json");
    console.log("Deploying to " + grunt.option("config"));

    // this uses github:cavejay/grunt-screeps since the official version doesn't support auth token... yet
    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.initConfig({
        screeps: {
            options: {
                server: config.server,
                email: config.email,
                password: config.password,
                token: config.token,
                branch: config.branch,
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