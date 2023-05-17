global.profiler = require('tools/screeps-profiler');
global.traveler = require('tools/traveler')
require('tools/roomvisual')

require('clienthacks/clickabletostring')

require('tools/logger')
require('tools/hasrespawned')

require('globals/creeptalk')
require('globals/roles')
require('globals/tasks')
require('globals/utility')

const memoryCache = require('tools/memorycache')

require('prototypes/creep/properties')
require('prototypes/creep/tasks')
require('prototypes/room/checkforrclupdate')
require('prototypes/room/mineral')
require('prototypes/room/scoutdata')
require('prototypes/room/sources')
require('prototypes/room/structurecache')
require('prototypes/room/tasks')
require('prototypes/source/distancetospawn')
require('prototypes/source/earlygameharvestercount')
require('prototypes/structure/canstillstoreenergy')

require('utils')
require('players')

const memoryManagement = require('memorymanagement')
const hiveMind = require("hivelogic/hivemind");
const creepAi = require("creepai");

global.PLAYER_NAME = "Jacudibu";

module.exports.loop = memoryCache(function() {
    if (Game.cpu.bucket === 10000) {
        Game.cpu.generatePixel();
    }

    memoryManagement.run();
    hiveMind.run()
    creepAi.run();
});