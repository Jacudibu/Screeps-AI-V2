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

        const spawns = room.find(FIND_MY_SPAWNS);
        _.forEach(spawns, spawn => {
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
        });
    }

}

profiler.registerObject(roomLogic, "roomLogic");
module.exports = roomLogic;