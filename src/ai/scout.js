/* This creep will walk from one room to another and take notes in memory.rooms about the room's owner, source count and mineral.
 */
const scout = {
    run(creep) {
        switch (creep.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                creep.room.updateScoutData();
                if (creep.room.controller) {
                    const sign = creep.room.controller.sign;
                    if (sign !== undefined && sign.username !== PLAYER_NAME) {
                        creep.setTask(TASK.SIGN_CONTROLLER, undefined);
                        return;
                    }
                }
                this._continueScouting(creep);
                this.run(creep);
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

            default:
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                this.run(creep);
                return;
        }
    },

    _signController(creep) {
        if (creep.room.controller === undefined) {
            this._continueScouting();
            this.run(creep);
            return;
        }

        const text = creep.room.controller.owner === PLAYER_NAME
            ? "Hello world! Time to test this my codebase in production \o/"
            : creepTalk.cookie;

        switch (creep.signController(creep.room.controller, text)) {
            case OK:
                this._continueScouting();
                break;
            case ERR_NOT_IN_RANGE:
                this.travelTo(this.room.controller, {maxRooms: 1});
                break;
            default:
                this._continueScouting();
                this.logActionError("signing controller", this.signController(this.room.controller, ""));
                break;
        }
    },

    _continueScouting(creep) {
        this._selectNextScoutRoom(creep);
        creep.setTask(TASK.MOVE_TO_ROOM);
    },

    _selectNextScoutRoom(creep) {
        this._selectNextRoomToScout();
        creep.setTask(TASK.MOVE_TO_ROOM);
        creep.moveToRoom(TASK.DECIDE_WHAT_TO_DO);
    },

    _selectNextRoomToScout() {
        const exits = Game.map.describeExits(this.room.name);
        const availableRooms = [];

        for (let direction in exits) {
            const roomName = exits[direction];

            if (Game.map.isRoomAvailable(roomName)) {
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

            if (roomMemory.isScoutOnRoute) {
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

        if (!targetRoom) {
            targetRoom = availableRooms[_.random(0, availableRooms.length - 1)];
        }

        if (!Memory.rooms[targetRoom]) {
            Memory.rooms[targetRoom] = {};
        }

        Memory.rooms[targetRoom].isScoutOnRoute = true;
        this.targetRoomName = targetRoom;
    }
};

module.exports = scout;
profiler.registerObject(scout, "scout")