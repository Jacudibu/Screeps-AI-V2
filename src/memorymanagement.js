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

            this._deleteRoleSpecificStuff(Memory.creeps[creepName]);
            delete Memory.creeps[creepName];
        }
    },

    _deleteRoleSpecificStuff(creepMemory) {
        const hive = Hives[creepMemory.origin];
        hive.decreasePopulation(creepMemory.role);

        switch (creepMemory.role) {
            case ROLE.EARLY_WORKER:
                if (creepMemory.targetRoomName !== creepMemory.origin) {
                    hive.remotes[creepMemory.targetRoomName].current_early_workers -= 1;
                }
                return;
            default:
                break;
        }
    },

    _detectRespawn() {
        if (hasRespawned()) {
            log.warning("====== Respawn detected ======");
            const oldSettings = Memory.settings || {};

            for (const i in Memory) {
                delete Memory[i];
            }
            Memory.creeps = {};
            Memory.rooms = {}; // Technically we don't need to delete old scout data!
            Memory.flags = {};
            Memory.hives = {};

            Memory.players = {}; // Technically we don't need to reset playerdata. That way our AI could hold grudges beyond it's death!
            Memory.portals = {};

            Memory.creepsBuilt = 0;
            Memory.globalTick = Game.time;
            Memory.respawnTick = Game.time;

            Memory.settings = oldSettings;

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
};

profiler.registerObject(memoryManagement, "memoryManagement");
module.exports = memoryManagement;