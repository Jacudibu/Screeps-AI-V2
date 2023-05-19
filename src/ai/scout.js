const isScoutOnRoute = {};
const scoutOnRouteTimeout = 100;

/* This creep will walk from one room to another and take notes in memory.rooms about the room's owner, source count and mineral.
 */
const scout = {
    run(creep) {
        switch (creep.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                delete isScoutOnRoute[creep.room.name];
                creep.room.updateScoutData();
                if (creep.room.controller) {
                    const sign = creep.room.controller.sign;
                    if (sign === undefined || sign.username !== PLAYER_NAME) {
                        creep.setTask(TASK.SIGN_CONTROLLER, undefined);
                        return;
                    }
                }
                this._continueScouting(creep);
                return;

            case TASK.MOVE_TO_ROOM:
                if (creep.moveToRoom({preferHighway: true, offRoad: true}) === TASK_RESULT.TARGET_REACHED) {
                    creep.setTask(TASK.DECIDE_WHAT_TO_DO, undefined);
                    this.run(creep);
                }
                return;

            case TASK.SIGN_CONTROLLER:
                this._signController(creep);
                return;

            case TASK.IDLE:
                return;

            default:
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                this.run(creep);
                return;
        }
    },

    _signController(creep) {
        if (creep.room.controller === undefined) {
            this._continueScouting(creep);
            return;
        }

        const owner = creep.room.controller.owner;
        const text = owner !== undefined && owner.username === PLAYER_NAME
            ? "Hello world! Time to test this my codebase in production \\o/"
            : creepTalk.cookie;

        switch (creep.signController(creep.room.controller, text)) {
            case OK:
                this._continueScouting(creep);
                break;
            case ERR_NOT_IN_RANGE:
                creep.travelTo(creep.room.controller, {maxRooms: 1});
                break;
            default:
                this._continueScouting(creep);
                this.logActionError("signing controller", this.signController(creep.room.controller, ""));
                break;
        }
    },

    _continueScouting(creep) {
        this._selectNextRoomToScout(creep);
        this.run(creep);
    },

    _selectNextRoomToScout(creep) {
        const exits = Game.map.describeExits(creep.room.name);
        const availableRooms = [];

        for (let direction in exits) {
            const roomName = exits[direction];

            if (Game.map.getRoomStatus(roomName).status === "normal") { // TODO: What if we are in a respawn zone?
                availableRooms.push(roomName);
            }
        }

        let targetRoom;
        let lowestLastScouted = Game.time;
        for (let roomName of availableRooms) {
            const roomMemory = Memory.rooms[roomName];
            if (roomMemory === undefined) {
                targetRoom = roomName;
                break;
            }

            if (isScoutOnRoute[roomName] && isScoutOnRoute[roomName] > Game.time - scoutOnRouteTimeout) {
                continue;
            }

            if (roomMemory.lastScouted === undefined) {
                targetRoom = roomName;
                break;
            }

            if (roomMemory.lastScouted < lowestLastScouted) {
                targetRoom = roomName;
                lowestLastScouted = roomMemory.lastScouted;
            }
        }

        if (targetRoom === undefined) {
            if (availableRooms.length > 0) {
                targetRoom = availableRooms[_.random(0, availableRooms.length - 1)];
            } else { // must be sim.
                creep.setTask(TASK.IDLE);
                return;
            }
        }

        if (!Memory.rooms[targetRoom]) {
            Memory.rooms[targetRoom] = {};
        }

        isScoutOnRoute[targetRoom] = Game.time;
        creep.targetRoomName = targetRoom;

        creep.setTask(TASK.MOVE_TO_ROOM);
    }
};

module.exports = scout;
profiler.registerObject(scout, "scout");