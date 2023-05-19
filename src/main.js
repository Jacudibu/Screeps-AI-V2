global.profiler = require('tools/screeps-profiler');
require('tools/traveler');
require('tools/roomvisual');

require('clienthacks/clickabletostring');
require('console');

require('tools/logger');
require('tools/hasrespawned');

require('globals/boosttiers');
require('globals/constants');
require('globals/creeptalk');
require('globals/roles');
require('globals/tasks');
require('globals/creepclassifications');

const memoryCache = require('tools/memorycache');

require('prototypes/creep/countbodyparts');
require('prototypes/creep/kite');
require('prototypes/creep/properties');
require('prototypes/creep/tasks');
require('prototypes/room/checkforrclupdate');
require('prototypes/room/mineral');
require('prototypes/room/scoutdata');
require('prototypes/room/sources');
require('prototypes/room/structurecache');
require('prototypes/room/tasks');
require('prototypes/source/distancetospawn');
require('prototypes/source/earlygameharvestercount');
require('prototypes/structure/canstillstoreenergy');

require('threatdetection');
require('utils');
require('players');

const memoryManagement = require('memorymanagement');
const hiveMind = require("hivelogic/hivemind");
const creepAi = require("creepai");

module.exports.loop = memoryCache(function() {
    profiler.wrap( function() {
        if (Game.cpu.bucket === 10000 && Game.cpu.generatePixel !== undefined) {
            Game.cpu.generatePixel();
        }

        memoryManagement.run();
        ThreatDetection.run();
        hiveMind.run();
        creepAi.run();
    })
});