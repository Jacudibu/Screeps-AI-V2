global.profiler = require('tools/screeps-profiler');
global.traveler = require('tools/traveler')
require('tools/roomvisual')

require('clienthacks/clickabletostring')

require('tools/logger')

require('globals/creeptalk')
require('globals/roles')
require('globals/tasks')
require('globals/utility')

require('layouts/processor')
const memoryCache = require('tools/memorycache')

require('prototypes/creep/properties')
require('prototypes/creep/setTask')
require('prototypes/room/checkforrclupdate')
require('prototypes/room/sources')
require('prototypes/room/structurecache')
require('prototypes/room/tasks')
require('prototypes/source/distancetospawn')
require('prototypes/source/earlygameharvestercount')
require('prototypes/structure/canstillstoreenergy')

require('utils')

const memoryManagement = require('memorymanagement')
const roomLogic = require("roomai");
const creepAi = require("creepai");

log.warning("====== Global reset registered ======");
module.exports.loop = memoryCache(function() {
    memoryManagement.run();
    roomLogic.run()
    creepAi.run();
});