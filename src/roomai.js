const baseBuilder = require('ai/rooms/basebuilder')
const spawnLogic = require('ai/rooms/spawnlogic');

const DEBUG_ROOM_LAYOUTS = true;

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
            if (room.layout.core === undefined) {
                log.info(room + "Generating room layout for respawn room.")
                room.layout.core = layouts.processor.generateRoomLayoutForRespawnRoom(room);
            }
        }

        spawnLogic.run(room);
        baseBuilder.placePlannedConstructionSite(room);

        const hostiles = room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            for (const tower of room.towers) {
                tower.attack(hostiles[0])
            }
        }

        layouts.processor.generateRoadsToSources(room);

        if (DEBUG_ROOM_LAYOUTS) {
            const opts = {opacity: 0.2};
            for (const structureType in room.layout.core) {
                for (const pos of room.layout.core[structureType]) {
                    room.visual.structure(pos.x, pos.y, structureType, opts);
                }
            }

            for (const i in room.layout.roads.sources) {
                for (const pos of room.layout.roads.sources[i]) {
                    room.visual.structure(pos.x, pos.y, STRUCTURE_ROAD, opts);
                }
            }

            for (const pos of room.layout.roads.controller) {
                room.visual.structure(pos.x, pos.y, STRUCTURE_ROAD, opts);
            }

            for (const pos of room.layout.roads.mineral) {
                room.visual.structure(pos.x, pos.y, STRUCTURE_ROAD, opts);
            }

            room.visual.connectRoads(opts);
        }
    },
}

profiler.registerObject(ownedRoom, "roomAI");
module.exports = ownedRoom;