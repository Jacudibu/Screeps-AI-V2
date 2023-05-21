const roadGenerator = require("hivelogic/layouts/roadgenerator");
const bunkerV1 = {"name":"bunkerV1","rcl":8,"width":11,"height":11,"buildings":{"extension":[{"x":0,"y":1},{"x":2,"y":1},{"x":3,"y":1},{"x":4,"y":1},{"x":3,"y":0},{"x":3,"y":2},{"x":5,"y":0},{"x":6,"y":1},{"x":7,"y":1},{"x":8,"y":1},{"x":7,"y":0},{"x":7,"y":2},{"x":9,"y":0},{"x":10,"y":0},{"x":10,"y":1},{"x":11,"y":1},{"x":11,"y":2},{"x":11,"y":4},{"x":11,"y":6},{"x":11,"y":5},{"x":10,"y":5},{"x":9,"y":3},{"x":9,"y":2},{"x":10,"y":3},{"x":8,"y":3},{"x":9,"y":4},{"x":11,"y":8},{"x":10,"y":8},{"x":9,"y":8},{"x":10,"y":7},{"x":10,"y":9},{"x":11,"y":10},{"x":10,"y":11},{"x":9,"y":10},{"x":8,"y":10},{"x":8,"y":9},{"x":8,"y":11},{"x":7,"y":10},{"x":6,"y":11},{"x":5,"y":10},{"x":4,"y":10},{"x":4,"y":9},{"x":4,"y":11},{"x":5,"y":8},{"x":6,"y":7},{"x":7,"y":6},{"x":8,"y":5},{"x":9,"y":6},{"x":8,"y":7},{"x":7,"y":8},{"x":6,"y":9},{"x":1,"y":2},{"x":1,"y":3},{"x":1,"y":4},{"x":2,"y":3},{"x":4,"y":3},{"x":1,"y":0},{"x":0,"y":0},{"x":3,"y":10},{"x":0,"y":3}],"spawn":[{"x":5,"y":3},{"x":4,"y":4},{"x":6,"y":4}],"storage":[{"x":5,"y":5}],"terminal":[{"x":4,"y":5}],"link":[{"x":6,"y":3}],"powerSpawn":[{"x":6,"y":5}],"lab":[{"x":3,"y":7},{"x":3,"y":8},{"x":2,"y":8},{"x":2,"y":9},{"x":1,"y":9},{"x":0,"y":8},{"x":0,"y":7},{"x":1,"y":7},{"x":1,"y":6},{"x":2,"y":6}],"tower":[{"x":6,"y":8},{"x":8,"y":6},{"x":3,"y":4},{"x":5,"y":2},{"x":4,"y":7},{"x":7,"y":4}],"nuker":[{"x":0,"y":5}],"road":[{"x":4,"y":8},{"x":3,"y":9},{"x":2,"y":10},{"x":3,"y":11},{"x":5,"y":11},{"x":6,"y":10},{"x":5,"y":9},{"x":5,"y":7},{"x":6,"y":6},{"x":7,"y":5},{"x":8,"y":4},{"x":9,"y":5},{"x":10,"y":6},{"x":9,"y":7},{"x":8,"y":8},{"x":7,"y":9},{"x":7,"y":11},{"x":9,"y":11},{"x":10,"y":10},{"x":11,"y":11},{"x":9,"y":9},{"x":11,"y":9},{"x":11,"y":7},{"x":10,"y":4},{"x":11,"y":3},{"x":10,"y":2},{"x":9,"y":1},{"x":8,"y":0},{"x":8,"y":2},{"x":7,"y":3},{"x":6,"y":2},{"x":5,"y":1},{"x":6,"y":0},{"x":4,"y":0},{"x":4,"y":2},{"x":3,"y":3},{"x":2,"y":2},{"x":1,"y":1},{"x":2,"y":4},{"x":3,"y":5},{"x":4,"y":6},{"x":5,"y":6},{"x":3,"y":6},{"x":2,"y":7},{"x":1,"y":8},{"x":1,"y":5},{"x":0,"y":2},{"x":2,"y":0},{"x":0,"y":4},{"x":7,"y":7}],"observer":[{"x":2,"y":11}],"factory":[{"x":1,"y":10}]}};

// https://screepers.github.io/screeps-tools/?share=N4IgTgxgNiBcAcAaEAjArgSygEwwOwHMBnOUIgFwHswBDAgUzgG1QAPOAJgAZkBPOAIzwAvgF1kRAA40A7nmZtOAvoIBswxItgcOK2AICcGrYb1CxyMJRrYFIdtp4h+j4-cEGzRze-1JngiI+DhzKAfreWjpmQSae4aFuIWEuicGcugkcSZwAzHocuTl+Bdnp+gDsBUXlAqoFACzFHA2NxQJV4R3t-i517fF9AKzNTn1N5aFmI5OZfeqT+V0VzUt9sb4tXs1DBVztnevt9V2RvgK7Cfu1J-PNc3nNKZwTUWOcM3Fttb2Pk61dBZRS7DCwgeiscj0PBEDCUeSwFjnX6uH4FAT3PaYhIYybvbS4r5ZJ6lAbVHrfEyHF6rdG04n-UmzSmbNY0xkJGrAlkODp0m5MqmCzYgv5RZ7aLmsgqfTYA1Ky3nU7SKtQy47k2qiyXtbUtA7bWrK7gaq6m1KE856y287WGXUxc2BJ2VA1dVWVMxA5HTemg5nuv1qbHjEnLMkJD1CdUBhVhuNar0O8McvorSZ29PcwEUrqvTb4wqjHkeMz55JlsFQGgoOwhNmoqIN+2pzjXKLypQ7fkdx0ZvvZvpnEK3DzNUeucQgKFgAC2+BoMER4sdU4AZjQIFQwC4kSF8f0p5JKDJ6GAAMrSOR10s5qeUFBEM8ANzPN5VpKnUHwAGt36ZwynPA0B-N9lzlX0pyoU8wH-FFujxX1Y0ELMC2FXlBjbeMsNEYRhCAA#/building-planner
const bunkerV2 = {"name":"bunkerV2","rcl":8,"width":11,"height":11,"buildings":{"storage":[{"x":5,"y":4}],"spawn":[{"x":6,"y":2},{"x":7,"y":5},{"x":4,"y":4}],"road":[{"x":5,"y":6},{"x":4,"y":5},{"x":3,"y":4},{"x":6,"y":5},{"x":7,"y":4},{"x":4,"y":7},{"x":6,"y":7},{"x":7,"y":8},{"x":8,"y":9},{"x":3,"y":8},{"x":2,"y":9},{"x":1,"y":10},{"x":9,"y":10},{"x":2,"y":3},{"x":3,"y":2},{"x":4,"y":1},{"x":5,"y":0},{"x":6,"y":1},{"x":7,"y":2},{"x":8,"y":3},{"x":8,"y":4},{"x":9,"y":5},{"x":10,"y":6},{"x":2,"y":4},{"x":1,"y":5},{"x":0,"y":6},{"x":1,"y":2},{"x":7,"y":9},{"x":6,"y":10},{"x":5,"y":11},{"x":4,"y":10},{"x":3,"y":9},{"x":9,"y":2},{"x":10,"y":1}],"extension":[{"x":3,"y":6},{"x":3,"y":7},{"x":7,"y":6},{"x":7,"y":7},{"x":5,"y":7},{"x":4,"y":8},{"x":6,"y":8},{"x":4,"y":9},{"x":3,"y":10},{"x":2,"y":10},{"x":8,"y":7},{"x":8,"y":8},{"x":9,"y":8},{"x":7,"y":10},{"x":8,"y":10},{"x":9,"y":9},{"x":10,"y":10},{"x":2,"y":7},{"x":1,"y":8},{"x":2,"y":8},{"x":10,"y":9},{"x":6,"y":9},{"x":8,"y":11},{"x":9,"y":11},{"x":2,"y":11},{"x":1,"y":11},{"x":1,"y":9},{"x":0,"y":9},{"x":0,"y":10},{"x":2,"y":5},{"x":2,"y":6},{"x":1,"y":6},{"x":1,"y":7},{"x":0,"y":7},{"x":0,"y":5},{"x":0,"y":4},{"x":1,"y":4},{"x":1,"y":3},{"x":2,"y":1},{"x":2,"y":2},{"x":3,"y":1},{"x":8,"y":1},{"x":7,"y":1},{"x":8,"y":2},{"x":7,"y":0},{"x":6,"y":3},{"x":4,"y":11},{"x":3,"y":11},{"x":7,"y":11},{"x":6,"y":11},{"x":0,"y":2},{"x":0,"y":3},{"x":9,"y":3},{"x":10,"y":3},{"x":10,"y":2},{"x":3,"y":0},{"x":5,"y":9},{"x":5,"y":10},{"x":4,"y":0},{"x":6,"y":0}],"lab":[{"x":8,"y":6},{"x":8,"y":5},{"x":9,"y":6},{"x":9,"y":7},{"x":10,"y":7},{"x":9,"y":4},{"x":10,"y":4},{"x":10,"y":5},{"x":11,"y":5},{"x":11,"y":6}],"terminal":[{"x":6,"y":4}],"factory":[{"x":5,"y":2}],"powerSpawn":[{"x":4,"y":2}],"observer":[{"x":10,"y":8}],"link":[{"x":4,"y":3}],"nuker":[{"x":9,"y":1}],"tower":[{"x":3,"y":3},{"x":5,"y":1},{"x":7,"y":3},{"x":5,"y":8},{"x":4,"y":6},{"x":6,"y":6}]}}


const layoutGenerator = {
    generateRoomLayout(room) {
        const bunkerLayout = bunkerV1;
        let origin = this.findBestBunkerOrigin(room, bunkerLayout);
        return this._transformLayoutToOrigin(bunkerLayout, origin);
    },

    generateCoreLayoutForRespawnRoom(room) {
        const bunkerLayout = bunkerV1;

        const spawnPos = room.mySpawns[0].pos;
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
        if (room.mySpawns.length > 0) {
            log.error("room.mySpawns.length > 0, why regenerate a layout?")
        }

        // TODO: Find all positions in the room which fulfill width & height requirements
        // TODO: Prioritize closest point to sources & room controller.
        // FIXME: Hard to test in Sim D:

        return {x: 10, y: 20};
    },

    // To add new layouts (or later on stamps), just Copy & Paste a room layout made with https://screepers.github.io/screeps-tools as argument and store the output of this method.
    // Don't forget to add a name to it. <3
    processScreepersRoomPlan(input) {
        let result = {};
        const boundaries = this._discoverBoundaries(input.buildings);
        log.info("Boundaries: " + JSON.stringify(boundaries));

        result.rcl = input.rcl;
        result.width = boundaries.width;
        result.height = boundaries.height;
        result.buildings = {};

        for (const buildingKey in input.buildings) {
            result.buildings[buildingKey] = this._offsetPositions(input.buildings[buildingKey], -boundaries.offsetX, -boundaries.offsetY);
        }

        return result;
    },

    _offsetPositions(positionArray, offsetX, offsetY) {
        let result = [];
        for (let i = 0; i < positionArray.length; i++) {
            const pos = positionArray[i];
            result.push({
                x: pos.x + offsetX,
                y: pos.y + offsetY,
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
    },

    generateHiveRoads(hive, room) {
        roadGenerator.generateHiveRoads(hive, room);
    },

    drawLayout(roomVisual, layout) {
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

        for (const categoryName in layout.roads) {
            if (categoryName === "sources") {
                for (const i in layout.roads[categoryName]) {
                    for (const pos of layout.roads[categoryName][i]) {
                        roomVisual.structure(pos.x, pos.y, STRUCTURE_ROAD, opts);
                    }
                }
            } else {
                for (const pos of layout.roads[categoryName]) {
                    roomVisual.structure(pos.x, pos.y, STRUCTURE_ROAD, opts);
                }
            }
        }

        for (const categoryName in layout.containers) {
            for (const pos of layout.containers[categoryName]) {
                roomVisual.structure(pos.x, pos.y, STRUCTURE_CONTAINER, opts);
            }
        }

        roomVisual.connectRoads(opts);
    }
};

module.exports = layoutGenerator;
profiler.registerObject(layoutGenerator, "layoutGenerator");

global.processScreepersRoomPlan = function() {
    const value = "insert JSON here";
    return JSON.stringify(layoutGenerator.processScreepersRoomPlan(value));
};