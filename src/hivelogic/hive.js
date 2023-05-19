const RemoteScanner = require("hivelogic/remotescanner");
const layoutGenerator = require("hivelogic/layouts/layoutgenerator");
global.Hives = {};

/* Owned rooms are called Hives.
 * This class mostly serves as a memory wrapper with a fancy name.
 */
class Hive {
    constructor(roomName) {
        Hives[roomName] = this;
        this._roomName = roomName;
        this.earlyWorkerCount = 0;

        if (Memory.hives[roomName] === undefined) {
            log.info("A new hive has been established in " + this.room + "!");
            Memory.hives[roomName] = {layout: {}};
            RemoteScanner.setupRemoteData(this);

            if (this.layout.core === undefined && hasRespawned()) {
                log.info("Generating room layout for " + this)
                this.layout.core = layoutGenerator.generateCoreLayoutForRespawnRoom(this.room);
                layoutGenerator.generateHiveRoads(this, this.room);
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

    refreshRemoteData(remoteData, room) {
        RemoteScanner.evaluateRemote(this, remoteData, room);
    }

    toString() {
        return "Hive@" + this.room.toString();
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

        for (const creep in Memory.creeps) {
            if (creep.role === ROLE.EARLY_WORKER) {
                Hives[creep.origin].earlyWorkerCount += 1;
            }
        }
    }
}

Hive.onGlobalReset();

module.exports = Hive;
profiler.registerClass(Hive, "Hive")