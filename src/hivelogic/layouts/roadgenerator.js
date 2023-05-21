const STRUCTURES_WHICH_BLOCK_PATHING = [
    STRUCTURE_EXTENSION,
    STRUCTURE_SPAWN,
    STRUCTURE_WALL,
    STRUCTURE_LINK,
    STRUCTURE_CONTROLLER,
    STRUCTURE_STORAGE,
    STRUCTURE_TOWER,
    STRUCTURE_OBSERVER,
    STRUCTURE_POWER_BANK,
    STRUCTURE_POWER_SPAWN,
    STRUCTURE_EXTRACTOR,
    STRUCTURE_LAB,
    STRUCTURE_TERMINAL,
    STRUCTURE_NUKER,
    STRUCTURE_FACTORY,
];

const COST_ROAD = 1;
const COST_PLAIN = 2;
const COST_SWAMP = 5;
const COST_AROUND_RESOURCES = 20;
const COST_TUNNEL = 60;
const COST_NOT_WALKABLE = 255;

let costMatrixCache = {};

const roadGenerator = {
    generateHiveRoads(hive, room) {
        const goals = [];

        for (const pos of hive.layout.core[STRUCTURE_ROAD]) {
            goals.push({pos: new RoomPosition(pos.x, pos.y, hive.roomName), range: 1}); // TODO: Maybe only declare hive pos as goal? Needs benchmarking for multiroom requests
        }

        const roomCallback = function(roomName) {
            return roadGenerator._roomCallback(hive, roomName);
        };

        const roads = hive.layout.roads = {};
        roads.sources = [];
        for (const i in room.sources) {
            const path = this._getPathTo(hive, room, room.sources[i], goals, roomCallback);
            if (path.length > 0) {
                if (hive.layout.sourceContainers === undefined) {
                    hive.layout.sourceContainers = [];
                }

                hive.layout.sourceContainers.push(path.shift());
            } else {
                // TODO: just grab another spot next to the source which isn't road
                log.warning("Unable to automagically determine the best spot for our mineral container!")
            }

            roads.sources.push(path);
        }

        if (room.controller) {
            const path = this._getPathTo(hive, room, room.controller, goals, roomCallback);
            if (path.length > 3) {
                path.shift();
                path.shift();
                if (hive.layout.controllerContainers === undefined) {
                    hive.layout.controllerContainers = [];
                }

                hive.layout.controllerContainers.push(path.shift());
            }

            roads.controller = path;
        }

        if (room.mineral) {
            const path = this._getPathTo(hive, room, room.mineral, goals, roomCallback);
            if (path.length > 0) {
                if (hive.layout.mineralContainers === undefined) {
                    hive.layout.mineralContainers = [];
                }

                hive.layout.mineralContainers.push(path.shift());
            } else {
                // TODO: just grab another spot next to the source which isn't road
                log.warning("Unable to automagically determine the best spot for our mineral container!")
            }

            roads.mineral = path;
        }

        const depositSpot = new RoomPosition(hive.pos.x, hive.pos.y-2, hive.roomName);
        roads.sourceConnection = [];
        for(const sourceRoads of roads.sources) {
            if (sourceRoads.length === 0) {
                continue;
            }
            const end = _.last(sourceRoads);
            const path = this._getPathTo(hive, room, depositSpot, new RoomPosition(end.x, end.y, hive.roomName), roomCallback, false);
            path.pop(); // last one's a duplicate
            for (const pos of path) {
                if (_.any(roads.sourceConnection, this._arePositionsEqual)) {
                    continue;
                }

                log.info(pos);
                roads.sourceConnection.push(pos);
                hive.layout.core.road.splice(hive.layout.core.road.findIndex(a => this._arePositionsEqual(a, pos)), 1);
            }
        }

        roads.controllerConnection = [];
        const end = _.last(roads.controller);
        const path = this._getPathTo(hive, room, depositSpot, new RoomPosition(end.x, end.y, hive.roomName), roomCallback, false);
        path.pop(); // last one's a duplicate
        for (const pos of path) {
            if (_.any(roads.sourceConnection, this._arePositionsEqual) || _.any(roads.controllerConnection, this._arePositionsEqual)) {
                continue;
            }

            log.info(pos);
            roads.controllerConnection.push(pos);
            hive.layout.core.road.splice(hive.layout.core.road.findIndex(a => this._arePositionsEqual(a, pos)), 1);
        }
    },

    _arePositionsEqual(a, b) {
        return a.x === b.x && a.y === b.y;
    },

    _getPathTo(hive, room, target, existingCoreRoads, roomCallback, testIfRoadsArePartOfLayout = true) {
        const result = PathFinder.search(target instanceof RoomPosition ? target : target.pos, existingCoreRoads, {
            maxRooms: 1,
            plainCost: COST_PLAIN,
            swampCost: COST_SWAMP,
            roomCallback: roomCallback
        });

        const path = [];
        for (const pos of result.path) {
            if (testIfRoadsArePartOfLayout && this._isRoadAlreadyPartOfLayout(hive, pos)) {
                continue;
            }

            path.push({x: pos.x, y: pos.y});
            costMatrixCache[room.name].set(pos.x, pos.y, COST_ROAD);
        }

        return path;
    },

    _isRoadAlreadyPartOfLayout(hive, pos) {
        if (this._isRoadAlreadyPartOfArray(hive.layout.core.roads, pos)) {
            return true;
        }

        for (const sourceRoads of hive.layout.roads.sources) {
            if (this._isRoadAlreadyPartOfArray(sourceRoads, pos)) {
                return true;
            }
        }

        if (this._isRoadAlreadyPartOfArray(hive.layout.roads.controller, pos)) {
            return true;
        }

        if (this._isRoadAlreadyPartOfArray(hive.layout.roads.mineral, pos)) {
            return true;
        }

        // TODO: Remotes

        return false;
    },

    _isRoadAlreadyPartOfArray(existingRoads, pos) {
        return _.some(existingRoads, existingRoadPos => existingRoadPos.x === pos.x && existingRoadPos.y === pos.y);
    },

    _roomCallback(hive, callbackRoomName) {
        if (costMatrixCache[callbackRoomName]) {
            return costMatrixCache[callbackRoomName];
        }
        const costMatrix = costMatrixCache[callbackRoomName] = new PathFinder.CostMatrix();
        const room = Game.rooms[callbackRoomName];
        if (callbackRoomName === hive.roomName) {
            for (const structureType of STRUCTURES_WHICH_BLOCK_PATHING) {
                this._setCostsForArrayIfKeyExists(costMatrix, hive.layout.core, structureType, COST_NOT_WALKABLE);
            }

            this._setCostsForArrayIfKeyExists(costMatrix, hive.layout.core, STRUCTURE_ROAD, COST_ROAD);
            if (hive.layout.roads) {
                for (const source of hive.layout.roads.sources) {
                    this._setCostsForArray(source, costMatrix, COST_ROAD);
                }

                this._setCostsForArrayIfKeyExists(costMatrix, hive.layout.roads, "controller", COST_ROAD);
                this._setCostsForArrayIfKeyExists(costMatrix, hive.layout.roads, "mineral", COST_ROAD);
            }
        } else {
            // Do the same but with room.remotes[roomName]
            if (room === undefined) {
                log.warning("No vision for room " + room + ", skipping road generation.");
            }
        }

        const terrain = new Room.Terrain(callbackRoomName);

        this._considerBuildingTunnels(costMatrix, terrain);
        this._addExtraCostAroundRoomResources(costMatrix, room, terrain);

        return costMatrix;
    },

    _setCostsForArrayIfKeyExists(costMatrix, layoutObject, elementName, cost) {
        if (layoutObject[elementName]) {
            this._setCostsForArray(layoutObject[elementName], costMatrix, cost);
        }
    },

    _setCostsForArray(posArray, costMatrix, cost) {
        for (const pos of posArray) {
            costMatrix.set(pos.x, pos.y, cost)
        }
    },

    _addExtraCostAroundRoomResources(costMatrix, room, terrain) {
        const roomResources = [];
        roomResources.push(...room.sources);
        if (room.mineral) { // sim & highways
            roomResources.push(room.mineral);
        }
        if (room.controller) {
            roomResources.push(room.controller);
        }
        for (const resource of roomResources) {
            for (let x = -1; x < 2; x++) {
                for (let y = -1; y < 2; y++) {
                    if (terrain.get(resource.pos.x + x, resource.pos.y + y) !== TERRAIN_MASK_WALL) {
                        costMatrix.set(resource.pos.x + x, resource.pos.y + y , COST_AROUND_RESOURCES);
                    }
                }
            }
        }
    },

    _considerBuildingTunnels(costMatrix, terrain) {
        for (let x = 2; x < 48; x++) { // ]2, 48[ instead of ]1, 49[ as a workaround to edge tiles being always cost 0
            for (let y = 2; y < 48; y++) {
                if (terrain.get(x, y) === TERRAIN_MASK_WALL) {
                    costMatrix.set(x, y, COST_TUNNEL);
                }
            }
        }
    }

};

module.exports = roadGenerator;
profiler.registerObject(roadGenerator, "roadGenerator");