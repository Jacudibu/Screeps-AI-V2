global.profiler = require('tools/screeps-profiler');
global.traveler = require('tools/traveler')

require('clienthacks/clickabletostring')

require('tools/logger')

require('globals/roles')
require('globals/tasks')
require('globals/utility')

require('utils')

require('prototypes/creep/memorycache')
require('prototypes/room/checkforrclupdate')
require('prototypes/room/sources')
require('prototypes/room/structurecache')
require('prototypes/source/distancetospawn')
require('prototypes/source/earlygameharvestercount')

const memoryManagement = require('memorymanagement')
const roomLogic = require("roomai");
const creepAi = require("creepai");

log.warning("====== Global reset registered ======");

if (!Memory.creepsBuilt) {
    Memory.creepsBuilt = 0;
}

module.exports.loop = function () {
    memoryManagement.run();
    roomLogic.run()
    creepAi.run();
};