class Utils {
    /**
     * Just a quick helper for counting elements in an array since lodash doesn't seem to do that
     *
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Number} Returns the amount of items matching the predicate.
     */
    static count(array, predicate) {
        const length = array.length;
        let result = 0;
        for (let i = 0; i < length; i++) {
            const value = array[i];
            if (predicate(value)) {
                result += 1;
            }
        }

        return result;
    };

    static countFreeTilesAroundRoomObject(roomObject) {
        const terrain = roomObject.room.getTerrain();
        let freeTileCount = 0;
        [roomObject.pos.x - 1, roomObject.pos.x, roomObject.pos.x + 1].forEach(x => {
            [roomObject.pos.y - 1, roomObject.pos.y, roomObject.pos.y + 1].forEach(y => {
                if (terrain.get(x, y) !== TERRAIN_MASK_WALL) {
                    freeTileCount++;
                }
            });
        });

        return freeTileCount;
    };

    static getClosestRoomObjectToPosition(pos, toArray) {
        return toArray
            .reduce((currentlyClosestObject, element) =>
                pos.getRangeTo(currentlyClosestObject.pos) < pos.getRangeTo(element.pos)
                    ? currentlyClosestObject
                    : element
            );
    };

    static isRoomHighway(roomName) {
        const parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
        return (parsed[1] % 10 === 0) || (parsed[2] % 10 === 0);
    };

    // Returns true if we expect some SK Lairs in this room. Does NOT include the room at the center of the 3x3 square.
    static isRoomSourceKeeperLair(roomName) {
        const parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
        const fMod = parsed[1] % 10;
        const sMod = parsed[2] % 10;
        return !(fMod === 5 && sMod === 5) &&
            ((fMod >= 4) && (fMod <= 6)) &&
            ((sMod >= 4) && (sMod <= 6));
    };

    // Returns true if the room is in the 3x3 square in the middle of the map
    static isRoomCenterRoom(roomName) {
        const parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
        const fMod = parsed[1] % 10;
        const sMod = parsed[2] % 10;
        return ((fMod >= 4) && (fMod <= 6)) &&
               ((sMod >= 4) && (sMod <= 6));
    }

    static randomFromArray(array) {
        return array[_.random(0, array.length - 1)];
    }
}

profiler.registerObject(Utils, "Utils");
global.Utils = Utils;