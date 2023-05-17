const spawnLogic = {
    run(room) {
        const idleSpawn = _.find(room.spawns, spawn => {
            return spawn.my && spawn.isActive() && spawn.spawning === null;
        });

        if (idleSpawn === undefined) {
            return;
        }

        this.spawnRCL1Worker(room, idleSpawn);
    },

    spawnRCL1Worker(room, spawn) {
        const rcl1WorkersInRoom = room.find(FIND_MY_CREEPS, {
            filter: creep => {
                return creep.role === ROLE.RCL1_CREEP;
            }
        });

        if (rcl1WorkersInRoom.length >= _.sum(room.sources, source => source.earlyGameHarvesterCount)) {
            return;
        }

        let body;
        if (room.energyCapacityAvailable >= 750) {
            body = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
        } else if (room.energyCapacityAvailable >= 500) {
            body = [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
        } else {
            body = [WORK, CARRY, MOVE, MOVE];
        }
        const memory = {role: ROLE.RCL1_CREEP};

        this.spawnCreep(spawn, body, memory)
    },

    spawnCreep(spawn, body, memory) {
        if (!Memory.creepsBuilt) {
            log.warning("Memory.creepsBuilt was not defined? Did we wipe memory?")
            Memory.creepsBuilt = 0;
        }
        const name = Memory.creepsBuilt.toString();

        const result = spawn.spawnCreep(body, name, {memory: memory});
        switch (result) {
            case OK:
                Memory.creepsBuilt = Memory.creepsBuilt + 1;
                break;
            case ERR_NOT_ENOUGH_ENERGY:
                break;
            default:
                log.warning(spawn + " unexpected error when spawning creep: " + result
                    + "\nBody: " + body.length + " -> " + body + "\nname:" + name + "\nmemory:" + memory);
                break;
        }
    }
}

profiler.registerObject(spawnLogic, "spawnLogic");
module.exports = spawnLogic;