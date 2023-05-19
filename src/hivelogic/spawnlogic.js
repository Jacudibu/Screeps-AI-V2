const spawnLogic = {
    run(hive, room) {
        // TODO: Technically we want to reserve one spawn for critical needs, but that's far in the future music right now
        const idleSpawn = _.find(room.mySpawns, spawn => {
            return spawn.my && spawn.isActive() && spawn.spawning === null;
        });

        if (idleSpawn === undefined) {
            return;
        }

        if (this._areEarlyWorkersNeeded(hive, room)) {
            this._spawnEarlyWorker(room, idleSpawn);
            return;
        }

        if (this._areScoutsNeeded(room)) {
            this._spawnScout(room, idleSpawn);
            return;
        }
    },

    _areEarlyWorkersNeeded(hive, room) {
        if (room.controller.level === 1) {
            return hive.earlyWorkerCount < _.sum(room.sources, source => source.earlyGameHarvesterCount)
                                         + _.sum(hive.remotes, r => r.max_early_workers) * 0.5;
        }
        return hive.earlyWorkerCount < _.sum(room.sources, source => source.earlyGameHarvesterCount)
                                     + _.sum(hive.remotes, r => r.max_early_workers);
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
        this._spawnCreep(spawn, ROLE.EARLY_WORKER, body, {})
    },

    _spawnScout(room, spawn) {
        let body = [MOVE];

        this._spawnCreep(spawn, ROLE.SCOUT, body, {})
    },

    _spawnCreep(spawn, role, body, memory = {}) {
        memory.role = role;
        memory.origin = spawn.room.name;

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