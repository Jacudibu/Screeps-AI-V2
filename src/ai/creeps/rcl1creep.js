function run(creep) {
    switch (creep.task) {
        case TASK.HARVEST_ENERGY: return harvestEnergy(creep);
        case TASK.DEPOSIT_ENERGY: return depositEnergy(creep);
        case TASK.BUILD: return build(creep)
        case TASK.UPGRADE_CONTROLLER: return upgradeController(creep)
        case TASK.UPGRADE_CONTROLLER_BUT_LOOK_OUT_FOR_CONSTRUCTION_SITES: return upgradeControllerButLookOutForConstructionSites(creep)
        default: {
            // TODO: error handling
            getMoreEnergy(creep);
        }
    }
}
module.exports = run;

function harvestEnergy(creep) {
    if(creep.store.getFreeCapacity() === 0) {
        figureOutHowToUseEnergy(creep);
        run(creep);
        return;
    }

    const source = Game.getObjectById(creep.taskTargetId);
    if (source === null) {
        return getMoreEnergy(creep);
    }

    if(creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.travelTo(source, {stuckValue: 1});
    }
}

function figureOutHowToUseEnergy(creep, didJustFinishConstructingSomething = false) {
    let target = findEnergyDepositTarget(creep);
    if (target !== undefined) {
        creep.setTask(TASK.DEPOSIT_ENERGY, target.id);
        return;
    }

    target = findConstructionSite(creep)
    if (target !== undefined) {
        creep.setTask(TASK.BUILD, target.id);
        return;
    }

    if (didJustFinishConstructingSomething) {
        creep.setTask(TASK.UPGRADE_CONTROLLER_BUT_LOOK_OUT_FOR_CONSTRUCTION_SITES, undefined);
    } else {
        creep.setTask(TASK.UPGRADE_CONTROLLER, undefined);
    }
}

function findConstructionSite(creep) {
    const constructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
    if (constructionSites.length > 0) {
        return constructionSites[0];
    }

    return undefined;
}

function findEnergyDepositTarget(creep) {
    const spawn = creep.room.spawns[0];
    if (spawn.canStillStoreEnergy()) {
        return spawn;
    }

    const extensions = _.filter(creep.room.extensions, extension => extension.canStillStoreEnergy());
    if (extensions.length > 0) {
        return extensions[0];
    }

    const towers = _.filter(creep.room.towers, tower => tower.canStillStoreEnergy());
    if (towers.length > 0) {
        return towers[0];
    }

    return undefined;
}

function depositEnergy(creep) {
    if (creep.store.getUsedCapacity() === 0) {
        return getMoreEnergy(creep);
    }

    const target = Game.getObjectById(creep.taskTargetId);
    const result = creep.transfer(target, RESOURCE_ENERGY);
    switch (result) {
        case OK:
            return;
        case ERR_FULL:
            figureOutHowToUseEnergy(creep);
            run(creep);
            return;
        case ERR_NOT_IN_RANGE:
            creep.travelTo(target);
            return;
    }

    run(creep);
}

function getMoreEnergy(creep) {
    const source = getBestSource(creep);
    creep.setTask(TASK.HARVEST_ENERGY, source.id);

    run(creep);
}

function getBestSource(creep) {
    const allRCL1Workers = creep.room.find(FIND_MY_CREEPS, { filter: creep => creep.role === ROLE.RCL1_CREEP});
    const sources = _.sortBy(creep.room.sources, source => source.distanceToSpawn);

    for (let i = 0; i < sources.length; i++) {
        const source = sources[i];
        const creepsAssignedToSource = utils.count(allRCL1Workers, creep => creep.taskTargetId === source.id);

        if (creepsAssignedToSource < source.earlyGameHarvesterCount){
            return source;
        }
    }

    log.warning(creep + "Unable to determine which source to pick, choosing the first one instead...")
    return sources[0];
}

function build(creep) {
    if (creep.store.getUsedCapacity() === 0) {
        return getMoreEnergy(creep);
    }

    const target = Game.getObjectById(creep.taskTargetId);
    if (target === undefined) {
        figureOutHowToUseEnergy(creep, true);
        run(creep);
        return;
    }

    switch (creep.build(target)) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            return creep.travelTo(target, {maxRooms: 1, range: 2, stuckValue: 1});
        case ERR_NOT_ENOUGH_RESOURCES:
            getMoreEnergy(creep);
            break;
        case ERR_INVALID_TARGET:
            // Probably finished building or so
            figureOutHowToUseEnergy(creep, true);
            run(creep);
            return;
        default:
            log.warning(creep + "building " + target + " " + creep.build(creep.taskTargetId));
            break;
    }
}

function upgradeController(creep) {
    switch (creep.upgradeController(creep.room.controller)) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            return creep.travelTo(creep.room.controller, {maxRooms: 1, range: 2, stuckValue: 1});
        case ERR_NOT_ENOUGH_RESOURCES:
            getMoreEnergy(creep);
            run(creep);
            break;
        default:
            log.warning(creep + "upgrading controller" + " " + creep.upgradeController(creep.room.controller));
            creep.setTask(TASK.DEPOSIT_ENERGY, undefined)
            break;
    }
}

function upgradeControllerButLookOutForConstructionSites(creep) {
    const constructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
    if (constructionSites.length > 0) {
        creep.setTask(TASK.BUILD, constructionSites[0].id);
        creep.say(creepTalk.surpriseTargetChange);
        run(creep);
        return;
    }

    upgradeController(creep);
}
