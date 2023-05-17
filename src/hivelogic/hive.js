global.Hives = {};

/* Owned rooms are called Hives.
 * This class mostly serves as a memory wrapper with a fancy name.
 */
class Hive {
    constructor(roomName) {
        this._roomName = roomName;

        if (!Memory.hives[roomName]) {
            log.info("New hivelogic established in " + this.room + "!");
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
}

if (Memory.hives === undefined) {
    Memory.hives = {};

    if (Game.spawns.length > 1) {
        log.error("Hive memory was reset, which should only ever happen on manual respawn, but there is more than one spawn?")
    }

    for (const spawnName in Game.spawns) {
        const spawn = Game.spawns[spawnName];
        if (Hives[spawn.room.name] === undefined) {
            new Hive(spawn.room.name);
        } else {
            log.error("Encountered multiple spawns in the same room during respawn hivelogic generation...? " + spawn.room);
        }
    }
} else {
    for (const hiveRoom in Memory.hives) {
        new Hive(hiveRoom);
    }
}

module.exports = Hive;
profiler.registerClass(Hive, "Hive")