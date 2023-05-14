const STRUCTURE_PRIORITY_ORDER = [
    // Essentials
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION,
    STRUCTURE_TOWER,

    // Nice To Have
    STRUCTURE_ROAD,
    STRUCTURE_STORAGE,
    STRUCTURE_CONTAINER,
    STRUCTURE_TERMINAL,
    STRUCTURE_EXTRACTOR,
    STRUCTURE_RAMPART,
    STRUCTURE_LINK,
    STRUCTURE_LAB,
    STRUCTURE_WALL,

    // Fluff
    STRUCTURE_OBSERVER,
    STRUCTURE_NUKER,
    STRUCTURE_POWER_SPAWN,
    STRUCTURE_FACTORY,
];

function placePlannedConstructionSite(room) {
    if (room.find(FIND_MY_CONSTRUCTION_SITES).length > 0) {
        return;
    }

    placeConstructionSiteIfNeeded(room);
}

function placeConstructionSiteIfNeeded(room) {
    for (let i = 0; i < STRUCTURE_PRIORITY_ORDER.length; i++) {
        if (canStructureBeBuilt(room, STRUCTURE_PRIORITY_ORDER[i])) {
            log.info("SOMETHING built")
            return placeConstructionSite(room, STRUCTURE_PRIORITY_ORDER[i]);
        }
    }

    return false;
}

function canStructureBeBuilt(room, structureType) {
    const layout = room.memory.layout;

    if (layout[structureType] === undefined) {
        return false;
    }

    const rcl = room.controller.level;
    const existingStructureCount = utils.count(room.find(FIND_MY_STRUCTURES), structure => structure.structureType === structureType);

    if (existingStructureCount >= CONTROLLER_STRUCTURES[structureType][rcl]) {
        return false;
    }
    if (existingStructureCount >= layout[structureType].length) {
        return false;
    }

    return true;
}

function placeConstructionSite(room, structureType) {
    const layout = room.memory.layout;

    for (const position of layout[structureType]) {
        if (!isStructureConstructableAt(room, structureType, position)) {
            continue;
        }

        const result = room.createConstructionSite(position.x, position.y, structureType);
        if (result !== OK) {
            log.error(room + "unexpected error when placing construction site: " + result
                + "\ndata: x: " + position.x + " | y: " + position.y + " structureType: " + structureType);
        }

        return true;
    }

    return false;
}

function isStructureConstructableAt(room, structureType, pos) {
    const existingThings = room.lookAt(pos.x, pos.y);
    for (let i = 0; i < existingThings.length; i++) {
        const thing = existingThings[i];
        switch (thing.type) {
            case LOOK_CREEPS:
                // TODO: Check back in a couple ticks. Keep track of the amount of ticks we've waited to make sure this isn't some lazy idle creep.
                continue;
            case LOOK_STRUCTURES:
                switch (thing.structure.structureType) {
                    case STRUCTURE_RAMPART:
                        if (structureType === STRUCTURE_RAMPART) {
                            return false;
                        }
                        break;

                    case STRUCTURE_ROAD:
                        if (structureType === STRUCTURE_ROAD) {
                            return false;
                        }
                        break;

                    default:
                        if (thing.structure.structureType === structureType) {
                            return false;
                        }

                        if (thing.structure.structureType !== STRUCTURE_RAMPART && thing.structure.structureType !== STRUCTURE_ROAD) {
                            return false;
                        }
                        break;
                }
                break;
            case LOOK_TERRAIN:
                if (thing.terrain === 'wall') {
                    if (structureType !== STRUCTURE_ROAD) {
                        return false;
                    }
                }
                break;
            default:
                log.error(room + "Unexpected lookAt result when placing construction site: " + thing.type);
                return false;
        }
    }

    return true;
}

module.exports = {placePlannedConstructionSite};