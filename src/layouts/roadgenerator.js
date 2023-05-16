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
    findRoadPath(room) {
        const goals = [];

        for (const pos of room.layout.core[STRUCTURE_ROAD]) {
            goals.push({pos: new RoomPosition(pos.x, pos.y, room.name), range: 1}); // TODO: Maybe only declare the position below the storage as goal? Needs benchmarking for multiroom requests
        }

        const roomCallback = function(roomName) {
            return roadGenerator._roomCallback(room, roomName);
        }

        room.layout.roads = {};
        room.layout.roads.sources = [];
        for (const i in room.sources) {
            const result = PathFinder.search(room.sources[i].pos, goals, {maxRooms: 1,
                plainCost: COST_PLAIN,
                swampCost: COST_SWAMP,
                roomCallback: roomCallback})

            const path = [];
            for (const pos of result.path) {
                path.push({x: pos.x, y: pos.y});
                costMatrixCache[room.name].set(pos.x, pos.y, COST_ROAD);
            }

            room.layout.roads.sources.push(path);
        }
    },

    _roomCallback(targetRoom, callbackRoomName) {
        if (costMatrixCache[callbackRoomName]) {
            return costMatrixCache[callbackRoomName];
        }
        const costMatrix = costMatrixCache[callbackRoomName] = new PathFinder.CostMatrix();
        let room;
        if (callbackRoomName === targetRoom.name) {
            room = targetRoom;
            for (const structureType of STRUCTURES_WHICH_BLOCK_PATHING) {
                this._setCostsForArrayIfItExists(costMatrix, targetRoom.layout.core, structureType, COST_NOT_WALKABLE);
            }

            this._setCostsForArrayIfItExists(costMatrix, targetRoom.layout.core, STRUCTURE_ROAD, COST_ROAD);
        } else {
            // Do the same but with room.remotes[roomName]
            room = Game.rooms[targetRoom];
            if (!room) {
                log.warning("No vision for room " + room + ", skipping road generation.");
            }
        }

        const terrain = new Room.Terrain(callbackRoomName);

        this._considerBuildingTunnels(costMatrix, terrain);
        this._addExtraCostAroundRoomResources(costMatrix, room, terrain);

        return costMatrix;
    },

    _setCostsForArrayIfItExists(costMatrix, layoutObject, elementName, cost) {
        if (layoutObject[elementName]) {
            for (const pos of layoutObject[elementName]) {
                costMatrix.set(pos.x, pos.y, cost)
            }
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

}

module.exports = roadGenerator;
profiler.registerObject(roadGenerator, "roadGenerator")