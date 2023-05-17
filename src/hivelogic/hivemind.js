const baseBuilder = require('hivelogic/basebuilder')
const spawnLogic = require('hivelogic/spawnlogic');

const DEBUG_ROOM_LAYOUTS = true;

const hiveMind = {
    run() {
        for (const hiveRoomName in Hives) {
            this._tryRunHiveLogic(Hives[hiveRoomName]);
        }
    },

    _tryRunHiveLogic(hive) {
        try {
            this._runHiveLogic(hive);
        } catch (e) {
            let message = hive + " -> caught error: " + e;
            if (e.stack) {
                message += "\nTrace:\n" + e.stack;
            }
            log.error(message);
        }
    },

    _runHiveLogic(hive) {
        const room = hive.room;
        if (room === undefined) {
            log.warning("Lost hivelogic in room " + room);
            delete Hives[hive.roomName]
            return;
        }

        if (room.checkForRCLUpdate()) {
            if (hive.layout.core === undefined) {
                log.info(hive + "Generating room layout for respawn room.")
                hive.layout.core = layouts.processor.generateRoomLayoutForRespawnRoom(room);
            }
        }

        spawnLogic.run(room);
        baseBuilder.placePlannedConstructionSite(hive, room);

        const hostiles = room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            for (const tower of room.towers) {
                tower.attack(hostiles[0])
            }
        }

        layouts.processor.generateHiveRoads(hive, room);

        if (DEBUG_ROOM_LAYOUTS) {
            this._draw(room.visual, hive.layout);
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

profiler.registerObject(hiveMind, "hiveMind");
module.exports = hiveMind;