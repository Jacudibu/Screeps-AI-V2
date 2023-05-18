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
}

profiler.registerObject(Utils, "Utils");
global.utils = Utils;