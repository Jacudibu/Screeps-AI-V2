global.profiler = require('tools/screeps-profiler');

require('clienthacks/clickabletostring')

require('tools/traveler')
require('tools/logger')

require('globals/roles')
require('globals/utility')

require('prototypes/creep/memorycache')
require('prototypes/room/checkForRCLUpdate')
require('prototypes/room/sources')

const memoryManagement = require('memorymanagement')
const roomLogic = require("roomlogic");
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