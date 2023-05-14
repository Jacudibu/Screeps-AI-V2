global.layouts = {};
global.layouts.processor = {
    generateRoomLayout(room) {
        const bunkerLayout = layouts.bunkerV1;
        let origin = this.findBestBunkerOrigin(room, bunkerLayout);
        return this._transformLayoutToOrigin(bunkerLayout, origin);
    },

    generateRoomLayoutForRespawnRoom(room) {
        const bunkerLayout = layouts.bunkerV1;

        const spawnPos = room.spawns[0].pos;
        const layoutSpawnPos = bunkerLayout.buildings.spawn[0];

        const origin = {
            x: spawnPos.x - layoutSpawnPos.x,
            y: spawnPos.y - layoutSpawnPos.y
        };

        return this._transformLayoutToOrigin(bunkerLayout, origin);
    },

    _transformLayoutToOrigin: function (bunkerLayout, origin) {
        let result = {};

        for (const buildingKey in bunkerLayout.buildings) {
            result[buildingKey] = this._offsetPositions(bunkerLayout.buildings[buildingKey], origin.x, origin.y);
        }

        return result
    },

    findBestBunkerOrigin(room, layout) {
        if (room.spawns.length > 0) {
            log.error("room.spawns.length > 0, why regenerate a layout?")
        }

        // TODO: Find all positions in the room which fulfill width & height requirements
        // TODO: Prioritize closest point to sources & room controller.
        // FIXME: Hard to test in Sim D:

        return {x: 10, y: 20};
    },

    // To add new layouts (or later on stamps), just Copy & Paste a room layout made with https://screepers.github.io/screeps-tools as argument and store the output of this method.
    // Don't forget to add a name to it. <3
    processScreepersRoomPlan(input) {
        let result = {}
        const boundaries = this._discoverBoundaries(input.buildings)
        log.info(JSON.stringify(boundaries));

        result.rcl = input.rcl;
        result.width = boundaries.width;
        result.height = boundaries.height;
        result.buildings = {};

        for (const buildingKey in input.buildings) {
            result.buildings[buildingKey] = this._offsetPositions(input.buildings[buildingKey]);
        }

        return result;
    },

    _offsetPositions(positionArray, offsetX, offsetY) {
        let result = [];
        for (let i = 0; i < positionArray.length; i++) {
            const pos = positionArray[i];
            result.push({
                x: pos.x - offsetX,
                y: pos.y - offsetY,
            })
        }
        return result;
    },

    _discoverBoundaries(buildings) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = 0;
        let maxY = 0;

        for (const buildingKey in buildings) {
            if (buildingKey === "road") {
                continue;
            }

            for (let i = 0; i < buildings[buildingKey].length; i++) {
                const pos = buildings[buildingKey][i];
                log.info(JSON.stringify(pos) + " " + minX + " " + pos.x + " " + pos.y);
                if (pos.x > maxX) {
                    maxX = pos.x;
                }
                if (pos.y > maxY) {
                    maxY = pos.y;
                }
                if (pos.x < minX) {
                    minX = pos.x;
                }
                if (pos.y < minY) {
                    minY = pos.y;
                }
            }
        }

        return {
            width:  maxX - minX,
            height: maxY - minY,
            offsetX: minX,
            offsetY: minY,
        };
    }
}

global.layouts.bunkerV1 = {"name":"bunkerV1","rcl":8,"width":11,"height":11,"buildings":{"extension":[{"x":0,"y":1},{"x":2,"y":1},{"x":3,"y":1},{"x":4,"y":1},{"x":3,"y":0},{"x":3,"y":2},{"x":5,"y":0},{"x":6,"y":1},{"x":7,"y":1},{"x":8,"y":1},{"x":7,"y":0},{"x":7,"y":2},{"x":9,"y":0},{"x":10,"y":0},{"x":10,"y":1},{"x":11,"y":1},{"x":11,"y":2},{"x":11,"y":4},{"x":11,"y":6},{"x":11,"y":5},{"x":10,"y":5},{"x":9,"y":3},{"x":9,"y":2},{"x":10,"y":3},{"x":8,"y":3},{"x":9,"y":4},{"x":11,"y":8},{"x":10,"y":8},{"x":9,"y":8},{"x":10,"y":7},{"x":10,"y":9},{"x":11,"y":10},{"x":10,"y":11},{"x":9,"y":10},{"x":8,"y":10},{"x":8,"y":9},{"x":8,"y":11},{"x":7,"y":10},{"x":6,"y":11},{"x":5,"y":10},{"x":4,"y":10},{"x":4,"y":9},{"x":4,"y":11},{"x":5,"y":8},{"x":6,"y":7},{"x":7,"y":6},{"x":8,"y":5},{"x":9,"y":6},{"x":8,"y":7},{"x":7,"y":8},{"x":6,"y":9},{"x":1,"y":2},{"x":1,"y":3},{"x":1,"y":4},{"x":2,"y":3},{"x":4,"y":3},{"x":1,"y":0},{"x":0,"y":0},{"x":3,"y":10},{"x":0,"y":3}],"spawn":[{"x":5,"y":3},{"x":4,"y":4},{"x":6,"y":4}],"storage":[{"x":5,"y":5}],"terminal":[{"x":4,"y":5}],"link":[{"x":6,"y":3}],"powerSpawn":[{"x":6,"y":5}],"lab":[{"x":3,"y":7},{"x":3,"y":8},{"x":2,"y":8},{"x":2,"y":9},{"x":1,"y":9},{"x":0,"y":8},{"x":0,"y":7},{"x":1,"y":7},{"x":1,"y":6},{"x":2,"y":6}],"tower":[{"x":6,"y":8},{"x":8,"y":6},{"x":3,"y":4},{"x":5,"y":2},{"x":4,"y":7},{"x":7,"y":4}],"nuker":[{"x":0,"y":5}],"road":[{"x":4,"y":8},{"x":3,"y":9},{"x":2,"y":10},{"x":3,"y":11},{"x":5,"y":11},{"x":6,"y":10},{"x":5,"y":9},{"x":5,"y":7},{"x":6,"y":6},{"x":7,"y":5},{"x":8,"y":4},{"x":9,"y":5},{"x":10,"y":6},{"x":9,"y":7},{"x":8,"y":8},{"x":7,"y":9},{"x":7,"y":11},{"x":9,"y":11},{"x":10,"y":10},{"x":11,"y":11},{"x":9,"y":9},{"x":11,"y":9},{"x":11,"y":7},{"x":10,"y":4},{"x":11,"y":3},{"x":10,"y":2},{"x":9,"y":1},{"x":8,"y":0},{"x":8,"y":2},{"x":7,"y":3},{"x":6,"y":2},{"x":5,"y":1},{"x":6,"y":0},{"x":4,"y":0},{"x":4,"y":2},{"x":3,"y":3},{"x":2,"y":2},{"x":1,"y":1},{"x":2,"y":4},{"x":3,"y":5},{"x":4,"y":6},{"x":5,"y":6},{"x":3,"y":6},{"x":2,"y":7},{"x":1,"y":8},{"x":1,"y":5},{"x":0,"y":2},{"x":2,"y":0},{"x":0,"y":4},{"x":7,"y":7}],"observer":[{"x":2,"y":11}],"factory":[{"x":1,"y":10}]}}
