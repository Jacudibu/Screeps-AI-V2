const DEFAULT_KITE_RANGE = 3;
const DEFAULT_FLEE_RANGE = 5;

/**
 * Makes a creep flee from hostiles if there are any.
 * returns ERR_NOT_FOUND if no hostiles are nearby or the result of creep.kite.
 */
Creep.prototype.fleeFromNearbyEnemies = function(shouldCarryBeDropped = false) {
    const threat = ThreatDetection.at(this.room.name);
    if (threat !== undefined && threat.attack + threat.ranged_attack > 0) {
        const hostiles = this.room.find(FIND_HOSTILE_CREEPS); // TODO: Limit to creeps with attack / ranged attack part
        for (let hostile of hostiles) {
            if (this.pos.getRangeTo(hostile) <= DEFAULT_FLEE_RANGE) {
                if (this.room.lookAt(this.pos.x, this.pos.y).any(x => x.type === LOOKAT_RESULT_TYPES.STRUCTURE && x.structure.structureType === STRUCTURE_RAMPART)) {
                    return ERR_NOT_FOUND;
                }

                if (shouldCarryBeDropped && _.sum(this.store.getUsedCapacity()) > 0) {
                    this.drop(RESOURCE_ENERGY); // TODO: Also drop other resources
                }

                this.say(this.ticksToLive % 2 === 0 ? creepTalk.flee1 : creepTalk.flee2, true);
                return this.kite(hostiles, {range: DEFAULT_FLEE_RANGE});
            }
        }
    }

    return ERR_NOT_FOUND;
};

/**
 * Makes a creep keep its distance to a given object or array of objects.
 *
 * Options:
 *  - offRoad: If true, every terrain (except walls) has a matrix cost of 1. Defaults to false.
 *  - ignoreRoads: If true, plains will have a matrix cost of 1. Defaults to false.
 *  - range: The Range that should be kept. Defaults to DEFAULT_KITE_RANGE.
 */
Creep.prototype.kite = function(thingsToKite, options = {}) {
    if (!thingsToKite) {
        return ERR_INVALID_ARGS;
    }

    if (this.fatigue > 0) {
        Traveler.circle(this.pos, "aqua", .3);
        return ERR_TIRED;
    }

    if (this.spawning) {
        return ERR_BUSY;
    }

    const range = options.range ? options.range : DEFAULT_KITE_RANGE;

    const roomPositions = [];
    if (thingsToKite instanceof Array) {
        for (const thing of thingsToKite) {
            roomPositions.push(turnIntoRoomPosition(thing, range));
        }
    } else {
        roomPositions.push(turnIntoRoomPosition(thingsToKite, range));
    }

    const pathFinderResult = PathFinder.search(this.pos, roomPositions, {
        maxRooms: 2,
        plainCost: 1,
        swampCost: options.offRoad ? 1 : options.ignoreRoads ? 5 : 5,
        flee: true,
        roomCallback: callback,
    });

    const nextDirection = this.pos.getDirectionTo(pathFinderResult.path[0]);
    return this.move(nextDirection);
};

const turnIntoRoomPosition = function(thing, range) {
    let goal = {};
    if (thing instanceof RoomPosition) {
        goal.pos = thing;
    } else {
        goal.pos = thing.pos;
    }

    goal.range = range;

    return goal;
};

const callback = function(roomName) {
    let room = Game.rooms[roomName];
    if (room) {
        return Traveler.getCreepMatrix(room);
    }

    return false;
};