global.Hives = {};

/* Owned rooms are called Hives.
 * This class mostly serves as a memory wrapper with a fancy name.
 */
class Hive {
    constructor(roomName) {
        this._roomName = roomName;

        if (!Memory.hives[roomName]) {
            log.info("A new hive has been established in " + this.room + "!");
            Memory.hives[roomName] = {layout: {}};
        }

        Hives[this.roomName] = this;
    }

    // The name of this hivelogic's room.
    get roomName() {
        return this._roomName;
    }

    // The Game.room this hivelogic is located in.
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

    // The layout for this hivelogic's room.
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