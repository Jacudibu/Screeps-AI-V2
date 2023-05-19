const {ThreatDetection} = require("../threatdetection");
const spawnLogic = {
    run(hive, room) {
        // TODO: Technically we want to reserve one spawn for critical needs, but that's far in the future music right now
        const idleSpawn = _.find(room.mySpawns, spawn => {
            return spawn.my && spawn.isActive() && spawn.spawning === null;
        });

        if (idleSpawn === undefined) {
            return;
        }

        if (ThreatDetection.at(room.name !== undefined)) {
            this._spawnRangedDefender(hive, room, idleSpawn);
        }

        if (this._areEarlyWorkersNeeded(hive, room)) {
            this._spawnEarlyWorker(hive, room, idleSpawn);
            return;
        }

        if (this._areScoutsNeeded(hive, room)) {
            this._spawnScout(hive, room, idleSpawn);

        }
    },

    _areEarlyWorkersNeeded(hive, room) {
        return hive.population[ROLE.EARLY_WORKER] < _.sum(room.sources, source => source.earlyGameHarvesterCount)
                                                  + _.sum(hive.remotes, r => r.max_early_workers);
    },

    _areScoutsNeeded(hive, room) {
        return hive.population[ROLE.SCOUT] < 2;
    },

    _spawnEarlyWorker(hive, room, spawn) {
        let body;
        if (room.energyCapacityAvailable >= 750) {
            body = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
        } else if (room.energyCapacityAvailable >= 500) {
            body = [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
        } else {
            body = [WORK, CARRY, MOVE, MOVE];
        }
        this._spawnCreep(hive, spawn, ROLE.EARLY_WORKER, body, {})
    },

    _spawnRangedDefender(hive, room, spawn) {
        const repeatingParts = [RANGED_ATTACK, MOVE];
        const partCosts = _.sum(repeatingParts, x => BODYPART_COST[x]);

        let body;
        let remainingCapacity = room.energyCapacityAvailable;

        while (remainingCapacity > remainingCapacity && body.length + repeatingParts.length < 50) {
            body.push(repeatingParts);
            remainingCapacity -= partCosts;
        }

        this._spawnCreep(hive, spawn, ROLE.RANGED_DEFENDER, body, {})
    },

    _spawnScout(hive, room, spawn) {
        let body = [MOVE];

        this._spawnCreep(hive, spawn, ROLE.SCOUT, body, {})
    },

    _spawnCreep(hive, spawn, role, body, memory = {}) {
        memory.role = role;
        memory.origin = spawn.room.name;

        const name = Memory.creepsBuilt.toString();
        const result = spawn.spawnCreep(body, name, {memory: memory});
        switch (result) {
            case OK:
                hive.increasePopulation(role);
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
};

profiler.registerObject(spawnLogic, "spawnLogic");
module.exports = spawnLogic;