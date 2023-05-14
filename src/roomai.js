const spawnLogic = require("spawnlogic");

const ownedRoom = {
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
        spawnLogic.run(room);
    },
}

profiler.registerObject(ownedRoom, "roomAI");
module.exports = ownedRoom;