const roomLogic = {
    run() {
        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            if (room.controller && room.controller.my) {
                this.updateOwnedRoom(room);
            }
        }
    },

    updateOwnedRoom(room) {
        room.checkForRCLUpdate();
        this.processSpawnQueue(room);
    },

    processSpawnQueue(room) {
        const idleSpawns = room.find(FIND_MY_SPAWNS, {
            filter: spawn => {
                return spawn.isActive() && spawn.spawning === null
            }
        });

        if (idleSpawns.length === 0) {
            return;
        }

        this.spawnSomething(room, idleSpawns[0]);
    },

    spawnSomething(room, spawn) {
        const body = [WORK, CARRY, MOVE];
        const name = Memory.creepsBuilt.toString();
        const memory = {role: ROLE.RCL1_CREEP};

        const result = spawn.spawnCreep(body, name, {memory: memory});
        switch (result) {
            case OK:
                Memory.creepsBuilt = Memory.creepsBuilt + 1;
                break;
            case ERR_NOT_ENOUGH_ENERGY:
                break;
            default:
                log.warning(room + " unexpected error when spawning creep: " + result
                    + "\nBody: " + body.length + " -> " + body + "\nname:" + name + "\nmemory:" + memory);
                break;
        }
    }
}

profiler.registerObject(roomLogic, "roomLogic");
module.exports = roomLogic;