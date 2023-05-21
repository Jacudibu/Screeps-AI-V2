const RemotePlanner = require("hivelogic/remoteplanner");
const layoutGenerator = require("hivelogic/layouts/layoutgenerator");
global.Hives = {};

/* Owned rooms are called Hives.
 * This class mostly serves as a memory wrapper with a fancy name.
 */
class Hive {
    constructor(roomName) {
        Hives[roomName] = this;
        this._roomName = roomName;

        this.population = {};
        for (const role in ROLE) {
            this.population[ROLE[role]] = 0;
        }

        if (Memory.hives[roomName] === undefined) {
            log.info("A new hive has been established in " + this.room + "!");
            Memory.hives[roomName] = {layout: {}};
            RemotePlanner.setupRemoteData(this);

            if (this.layout.core === undefined && hasRespawned()) {
                this.forceLayoutRegeneration();
            }
        }

        const storagePos = this.layout.core.storage[0];
        this.pos  = new RoomPosition(storagePos.x, storagePos.y - 1, roomName);
    }

    // The name of this hive's room.
    get roomName() {
        return this._roomName;
    }

    // The Game.room this hive is located in.
    get room() {
        return Game.rooms[this.roomName];
    }

    // Memory entry stored under Memory.hives[roomName].
    get memory() {
        return Memory.hives[this.roomName];
    }

    set memory(value) {
        if (value) {
            Memory.hives[this.roomName] = value;
        } else {
            delete Memory.hives[this.roomName];
        }
    }

    // The layout for this hive's room.
    get layout() {
        return this.memory.layout;
    }

    set layout(value) {
        if (value) {
            this.memory.layout = value;
        } else {
            delete this.memory.layout;
        }
    }

    // The remotes available to this hive's room.
    get remotes() {
        return this.memory.remotes;
    }

    set remotes(value) {
        if (value) {
            this.memory.remotes = value;
        } else {
            delete this.memory.remotes;
        }
    }

    // The source keeper lair rooms available to this hive's room.
    get lairs() {
        return this.memory.lairs;
    }

    set lairs(value) {
        if (value) {
            this.memory.lairs = value;
        } else {
            delete this.memory.lairs;
        }
    }

    refreshRemoteData(remoteData, room) {
        RemotePlanner.evaluateRemote(this, remoteData, room);
    }

    increasePopulation(role) {
        this.population[role] += 1;
    }

    decreasePopulation(role) {
        this.population[role] -= 1;
    }

    toString() {
        return "Hive@" + this.room.toString();
    }

    forceLayoutRegeneration() {
        log.info("Generating room layout for " + this);
        this.layout = {};
        this.layout.core = layoutGenerator.generateCoreLayoutForRespawnRoom(this.room);
        layoutGenerator.generateHiveRoads(this, this.room);
    }

    static onRespawn() {
        for (const spawnName in Game.spawns) {
            const spawn = Game.spawns[spawnName];
            if (Hives[spawn.room.name] === undefined) {
                new Hive(spawn.room.name);
            }
        }
    }

    static onGlobalReset() {
        for (const hiveRoom in Memory.hives) {
            new Hive(hiveRoom);
        }

        for (const creepName in Memory.creeps) {
            const creep = Memory.creeps[creepName];
            if (creep.role === ROLE.EARLY_WORKER) {
                Hives[creep.origin].earlyWorkerCount += 1;
            }
        }
    }
}

Hive.onGlobalReset();

module.exports = Hive;
profiler.registerClass(Hive, "Hive");

global.getHive = function() {
    for (const hive in Hives) {
        return Hives[hive];
    }
};

for (const creepName in Memory.creeps) {
    const creep = Memory.creeps[creepName];
    const hive = Hives[creep.origin];

    hive.increasePopulation(creep.role);
}