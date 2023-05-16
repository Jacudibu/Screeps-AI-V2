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

const COST_PLAIN = 2;
const COST_SWAMP = 5;
const COST_AROUND_RESOURCES = 20;
const COST_TUNNEL = 60;
const COST_NOT_WALKABLE = 255;

let costMatrixCache = {};

const roadGenerator = {
    findRoadPath(room) {
        let goals = [];

        for (const pos of room.layout[STRUCTURE_ROAD]) {
            goals.push({pos: new RoomPosition(pos.x, pos.y, room.name), range: 1})
        }

        const roomCallback = function(roomName) {
            return roadGenerator._roomCallback(room, roomName);
        }

        for (const source of room.sources) {
            const result = PathFinder.search(source.pos, goals, {maxRooms: 1,
                plainCost: COST_PLAIN,
                swampCost: COST_SWAMP,
                roomCallback: roomCallback})
            for (const pos of result.path) {
                goals.push(pos);
                room.visual.structure(pos.x, pos.y, STRUCTURE_ROAD)
            }
        }
    },

    _roomCallback(targetRoom, callbackRoomName) {
        if (costMatrixCache[callbackRoomName]) {
            return costMatrixCache[callbackRoomName];
        }

        let costMatrix = costMatrixCache[callbackRoomName] = new PathFinder.CostMatrix();
        let room;
        if (callbackRoomName === targetRoom.name) {
            room = targetRoom;
            for (const structureType of STRUCTURES_WHICH_BLOCK_PATHING) {
                this._setCostsForArrayIfItExists(costMatrix, targetRoom.layout, structureType, COST_NOT_WALKABLE);
            }

            this._setCostsForArrayIfItExists(costMatrix, targetRoom.layout, STRUCTURE_ROAD, 1);
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
        if (room.mineral) { // A sim quirk.
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