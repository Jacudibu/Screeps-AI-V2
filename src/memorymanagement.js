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
        switch (creepMemory.role) {
            case ROLE.SCOUT:
                if (creepMemory.task === TASK.MOVE_TO_ROOM) {
                    delete Memory.rooms[creepMemory.targetRoomName].isScoutOnRoute;
                }
                break;
            case ROLE.EARLY_WORKER:
                const hive = Hives[creepMemory.origin];
                hive.earlyGameHarvesterCount -= 1;
                if (creepMemory.task === TASK.HARVEST_REMOTE_ENERGY) {
                    hive.remotes[creepMemory.targetRoomName].current_early_workers -= 1;
                }
            default:
                break;
        }
    },

    _detectRespawn() {
        if (hasRespawned()) {
            log.warning("====== Respawn detected ======");
            Memory = {
                creeps: {},
                rooms: {}, // Technically we don't need to delete old scout data!
                flags: {},
                hives: {},

                players: {}, // Technically we don't need to reset playerdata. That way our AI could hold grudges beyond it's death!
                portals: {},

                creepsBuilt: 0,
                globalTick: Game.time,
                respawnTick: Game.time,
            }
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