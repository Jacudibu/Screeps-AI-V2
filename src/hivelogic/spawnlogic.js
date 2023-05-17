const spawnLogic = {
    run(room) {
        const idleSpawn = _.find(room.spawns, spawn => {
            return spawn.my && spawn.isActive() && spawn.spawning === null;
        });

        if (idleSpawn === undefined) {
            return;
        }

        if (this._areEarlyWorkersNeeded(room)) {
            this._spawnEarlyWorker(room, idleSpawn);
            return;
        }

        if (this._areScoutsNeeded(room)) {
            this._spawnScout(room, idleSpawn);
        }


    },

    _areEarlyWorkersNeeded(room) {
        const rcl1WorkersInRoom = room.find(FIND_MY_CREEPS, {
            filter: creep => {
                return creep.role === ROLE.EARLY_WORKER;
            }
        });

        return rcl1WorkersInRoom.length >= _.sum(room.sources, source => source.earlyGameHarvesterCount);
    },

    _areScoutsNeeded(room) {
        return _.filter(Game.creeps, creep => creep.role === ROLE.SCOUT).length < 2;
    },

    _spawnEarlyWorker(room, spawn) {
        let body;
        if (room.energyCapacityAvailable >= 750) {
            body = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
        } else if (room.energyCapacityAvailable >= 500) {
            body = [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
        } else {
            body = [WORK, CARRY, MOVE, MOVE];
        }
        const memory = {role: ROLE.EARLY_WORKER};

        this._spawnCreep(spawn, body, memory)
    },

    _spawnScout(room, spawn) {
        let body = [MOVE];
        const memory = {role: ROLE.SCOUT};

        this._spawnCreep(spawn, body, memory)
    },

    _spawnCreep(spawn, body, memory) {
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