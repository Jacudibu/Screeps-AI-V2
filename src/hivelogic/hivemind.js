const baseBuilder = require('hivelogic/basebuilder')
const spawnLogic = require('hivelogic/spawnlogic');
const RemoteScanner = require('hivelogic/remotescanner')
const layoutGenerator = require('hivelogic/layouts/layoutgenerator')

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
                hive.layout.core = layoutGenerator.generateCoreLayoutForRespawnRoom(room);
                layoutGenerator.generateHiveRoads(hive, room);
            }
        }

        spawnLogic.run(hive, room);
        baseBuilder.placePlannedConstructionSite(hive, room);

        const hostiles = room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            for (const tower of room.myTowers) {
                tower.attack(hostiles[0])
            }
        }

        RemoteScanner.setupRemoteData(hive);

        if (DEBUG_ROOM_LAYOUTS) {
            layoutGenerator.drawLayout(room.visual, hive.layout);
        }
    },
}

profiler.registerObject(hiveMind, "hiveMind");
module.exports = hiveMind;