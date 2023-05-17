const Hive = require("hivelogic/hive");
let didGlobalJustReset = true;

const memoryManagement = {
    run() {
        this._detectRespawn();
        this._detectGlobalReset();
        this._deleteDeadCreeps();
    },

    _deleteDeadCreeps() {
        for (let creepName in Memory.creeps) {
            if (Game.creeps[creepName]) {
                continue;
            }

            delete Memory.creeps[creepName];
        }
    },

    _detectRespawn() {
        if (hasRespawned()) {
            log.warning("====== Respawn detected ======");
            Memory.creeps = {};
            Memory.spawns = {};
            // Memory.rooms = {}; // We still enjoy our old scout data :^)
            Memory.flags = {};
            Memory.hives = {};

            if (Memory.players === undefined) {
                Memory.players = {}
            }
            Memory.portals = {}

            Memory.creepsBuilt = 0;
            Memory.globalTick = Game.time;
            Memory.respawnTick = Game.time;

            Hive.onRespawn();
        }
    },

    _detectGlobalReset() {
        if (didGlobalJustReset) {
            didGlobalJustReset = false;

            Memory.globalTick = Game.time;
            log.warning("====== Global reset detected ======");
        }
    }
}

profiler.registerObject(memoryManagement, "memoryManagement");
module.exports = memoryManagement;