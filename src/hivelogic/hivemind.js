const baseBuilder = require('hivelogic/basebuilder')
const spawnLogic = require('hivelogic/spawnlogic');
require('hivelogic/layouts/processor')

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

        spawnLogic.run(hive, room);
        baseBuilder.placePlannedConstructionSite(hive, room);

        const hostiles = room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            for (const tower of room.towers) {
                tower.attack(hostiles[0])
            }
        }

        // layouts.processor.generateHiveRoads(hive, room);

        this._setupRemoteData(hive);

        if (DEBUG_ROOM_LAYOUTS) {
            this._draw(room.visual, hive.layout);
        }
    },

    _setupRemoteData(hive) {
        const mainRoomNeighbors = Game.map.describeExits(hive.roomName);
        let neighborRooms = [];

        // This currently hardcodes remote distance to 2, but that shouldn't be a problem...
        for (const dir in mainRoomNeighbors) {
            const roomName = mainRoomNeighbors[dir];

            neighborRooms.push({name: roomName, distance: 1});
            const neighborNeighbors = Game.map.describeExits(roomName);
            for (const dirdir in neighborNeighbors) {
                const neighborName = neighborNeighbors[dirdir];
                if (neighborName === hive.roomName) {
                    continue;
                }

                if (_.contains(neighborRooms, neighborName)) {
                    continue;
                }

                neighborRooms.push({name: neighborName, distance: 2});
            }
        }

        hive.remotes = {};
        for (const r of neighborRooms) {
            hive.remotes[r.name] = {
                distance: r.distance,
            };
        }

        const storagePos = hive.layout.core.storage[0];
        const hiveRoomStoragePosition = new RoomPosition(storagePos.x, storagePos.y, hive.roomName);
        for (const remoteName in hive.remotes) {
            const remoteData = hive.remotes[remoteName];
            this._evaluateRemote(hiveRoomStoragePosition, remoteData, remoteName);
        }
    },

    // Technically we don't really wanna evaluate at rcl1 or rcl2 anyway and just go at it
    _evaluateRemote(hiveRoomStoragePosition, remoteData, remoteName) {
        const room = Game.rooms[remoteName];
        if (room === undefined) {
            return;
        }

        const sourceDistance = _.sum(room.sources, s => s.pos.findPathTo(hiveRoomStoragePosition)); // TODO: This ignores potential tunnels
        remoteData.value = room.sources.length * 20 - (sourceDistance / room.sources.length);
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