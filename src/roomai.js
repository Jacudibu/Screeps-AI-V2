const baseBuilder = require('ai/rooms/basebuilder')
const spawnLogic = require("spawnlogic");

const ownedRoom = {
    run() {
        for (let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            if (room.controller && room.controller.my) {
                this._tryRunRoomLogic(room);
            }
        }
    },

    _tryRunRoomLogic(room) {
        try {
            this._runRoomLogic(room);
        } catch (e) {
            let message = room + " -> caught error: " + e;
            if (e.stack) {
                message += "\nTrace:\n" + e.stack;
            }
            log.error(message);
        }
    },

    _runRoomLogic: function(room) {
        if (room.checkForRCLUpdate()) {
            if (room.memory.layout === undefined) {
                log.info(room + "Generating room layout for respawn room.")
                room.memory.layout = layouts.processor.generateRoomLayoutForRespawnRoom(room);
            }
        }
        spawnLogic.run(room);

        baseBuilder.placePlannedConstructionSite(room);
    },
}

profiler.registerObject(ownedRoom, "roomAI");
module.exports = ownedRoom;