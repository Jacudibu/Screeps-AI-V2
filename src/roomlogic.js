const RCL1WORKERS_PER_SOURCE = 3;

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

        if (rcl1WorkersInRoom.length >= room.sources.length * RCL1WORKERS_PER_SOURCE) {
            return;
        }

        const body = [WORK, CARRY, MOVE];
        const memory = {role: ROLE.RCL1_CREEP};

        this.spawnCreep(spawn, body, memory)
    },

    spawnCreep(spawn, body, memory) {
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

profiler.registerObject(roomLogic, "roomLogic");
module.exports = roomLogic;