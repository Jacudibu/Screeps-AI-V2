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
            this._draw(room.visual, room.layout);
        }
    },

    _draw(roomVisual, layout) {
        const opts = {opacity: 0.2};
        if (layout.core) {
            for (const structureType in layout.core) {
                for (const pos of layout.core[structureType]) {
                    roomVisual.structure(pos.x, pos.y, structureType, opts);
                }
            }
        }

        if (layout.roads === undefined) {
            return;
        }

        if (layout.roads.sources) {
            for (const i in layout.roads.sources) {
                for (const pos of layout.roads.sources[i]) {
                    roomVisual.structure(pos.x, pos.y, STRUCTURE_ROAD, opts);
                }
            }
        }

        if (layout.roads.controller) {
            for (const pos of layout.roads.controller) {
                roomVisual.structure(pos.x, pos.y, STRUCTURE_ROAD, opts);
            }
        }

        if (layout.roads.mineral) {
            for (const pos of layout.roads.mineral) {
                roomVisual.structure(pos.x, pos.y, STRUCTURE_ROAD, opts);
            }
        }

        roomVisual.connectRoads(opts);
    }
}

profiler.registerObject(ownedRoom, "roomAI");
module.exports = ownedRoom;