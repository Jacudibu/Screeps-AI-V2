const RemoteScanner = require("hivelogic/remotescanner");
global.Hives = {};

/* Owned rooms are called Hives.
 * This class mostly serves as a memory wrapper with a fancy name.
 */
class Hive {
    constructor(roomName) {
        Hives[roomName] = this;
        this._roomName = roomName;

        if (Memory.hives[roomName] === undefined) {
            log.info("A new hive has been established in " + this.room + "!");
            Memory.hives[roomName] = {layout: {}};
            RemoteScanner.setupRemoteData(this);
        }
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
    }
}

Hive.onGlobalReset();

module.exports = Hive;
profiler.registerClass(Hive, "Hive")