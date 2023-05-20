const baseBuilder = require('hivelogic/basebuilder');
const spawnLogic = require('hivelogic/spawnlogic');
const layoutGenerator = require('hivelogic/layouts/layoutgenerator');

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
            log.warning("Lost hive in room " + room);
            delete Hives[hive.roomName];
            return;
        }

        if (room.checkForRCLUpdate()) {
            // TODO: Update things?
        }

        spawnLogic.run(hive, room);
        baseBuilder.placePlannedConstructionSite(hive, room);

        const hostiles = room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            for (const creep of hostiles) {
                if (creep.owner === undefined || creep.owner.username === "Invader") {
                    continue;
                }
                if (_.any(creep.body, b => b.type === ATTACK || b.type === WORK || b.type === RANGED_ATTACK)) {
                    if (room.controller.safeModeCooldown === 0 && room.controller.safeModeAvailable > 0) {
                        room.controller.activateSafeMode();
                    }
                }
            }

            for (const tower of room.myTowers) {
                tower.attack(hostiles[0])
            }
        }

        const damagedCreeps = room.find(FIND_MY_CREEPS, {filter: x => _.any(x.body, b => b.hits < 50)});
        if (hostiles.length === 0 && damagedCreeps.length > 0) {
            for (const tower of room.myTowers) {
                tower.heal(damagedCreeps[0])
            }
        }

        if (Memory.settings.drawHiveLayout) {
            layoutGenerator.drawLayout(room.visual, hive.layout);
        }
    },
};

profiler.registerObject(hiveMind, "hiveMind");
module.exports = hiveMind;