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

function placePlannedConstructionSite(hive, room) {
    if (room.find(FIND_MY_CONSTRUCTION_SITES).length > 0) {
        return;
    }

    const rcl = room.memory.rcl;
    if (rcl <= 1) {
        return;
    }

    const didPlaceSomething = placeConstructionSiteIfNeeded(hive.layout, room, rcl);
    if (didPlaceSomething && rcl < 4) {
        for (const creep of room.find(FIND_MY_CREEPS, {filter: creep => creep.role === ROLE.EARLY_WORKER && creep.task === TASK.UPGRADE_CONTROLLER})) {
            creep.setTask(TASK.UPGRADE_CONTROLLER_BUT_LOOK_OUT_FOR_CONSTRUCTION_SITES, undefined);
        }
    }
}

function placeConstructionSiteIfNeeded(layout, room, rcl) {
    for (let i = 0; i < STRUCTURE_PRIORITY_ORDER.length; i++) {
        // TODO: only build necessary roads, somehow.
        // We could do this by pathing through our base and connecting the ends of source roads depending on CPU
        // At RCL2.5 (tho that'd be after container placement) and having different road arrays per RCL
        if (STRUCTURE_PRIORITY_ORDER[i] === STRUCTURE_ROAD && room.memory.rcl < 4) {
            continue;
        }

        if (canStructureBeBuilt(layout.core, room, STRUCTURE_PRIORITY_ORDER[i])) {
            return placeConstructionSite(layout.core, room, STRUCTURE_PRIORITY_ORDER[i]);
        }
    }

    if (rcl > 1) {
        if (rcl < 6) {
            if (tryPlacingSourceContainers(layout, room, rcl)) {
                return true;
            }
        }

        // TODO: do we want controller containers at rcl 2?
        // TODO: get rid of those containers here at rcl 5 & 6 respectively, probably as a TASK that's set on RCL increase
    }

    return false;
}

function tryPlacingSourceContainers(layout, room, rcl) {
    if (layout.sourceContainers === undefined) {
        return false;
    }

    if (layout.sourceContainers.length === 1 && rcl < 5) {
        return placeContainerConstructionSite(room, layout.sourceContainers[0]);
    }

    if (placeContainerConstructionSite(room, layout.sourceContainers[0])) {
        return true;
    }

    if (rcl < 5) {
        // TODO: Ensure the further away source is at [1]
        return placeContainerConstructionSite(room, layout.sourceContainers[1]);
    }

    return false;
}

function placeContainerConstructionSite(room, pos) {
    return room.createConstructionSite(pos.x, pos.y, STRUCTURE_CONTAINER) === OK;
}

function canStructureBeBuilt(layout, room, structureType) {
    if (layout[structureType] === undefined) {
        return false;
    }

    const rcl = room.controller.level;
    const existingStructureCount = Utils.count(room.find(FIND_MY_STRUCTURES), structure => structure.structureType === structureType);

    if (existingStructureCount >= CONTROLLER_STRUCTURES[structureType][rcl]) {
        return false;
    }
    if (existingStructureCount >= layout[structureType].length) {
        return false;
    }

    return true;
}

function placeConstructionSite(layout, room, structureType) {
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
                log.warning(room + "Unexpected lookAt result when placing construction site: " + thing.type + ". Expecting that everything will be fine and proceeding with construction.");
                return true;
        }
    }

    return true;
}

module.exports = {placePlannedConstructionSite};