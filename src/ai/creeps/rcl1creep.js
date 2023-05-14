const rcl1creep = {
    run(creep) {
        switch (creep.task) {
            case TASK.HARVEST_ENERGY: return this._harvestEnergy(creep);
            case TASK.DEPOSIT_ENERGY: return this._depositEnergy(creep);
            case TASK.BUILD: return this._build(creep)
            case TASK.UPGRADE_CONTROLLER: return this._upgradeController(creep)
            case TASK.UPGRADE_CONTROLLER_BUT_LOOK_OUT_FOR_CONSTRUCTION_SITES: return this._upgradeControllerButLookOutForConstructionSites(creep)
            default: {
                // TODO: error handling
                this._getMoreEnergy(creep);
            }
        }
    },

    _harvestEnergy(creep) {
        if(creep.store.getFreeCapacity() === 0) {
            return this._onHarvestFinished(creep);
        }

        const source = Game.getObjectById(creep.taskTargetId);
        if (source === null) {
            return this._getMoreEnergy(creep);
        }

        if(creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.travelTo(source, {stuckValue: 1});
        }
    },

    _depositEnergy(creep) {
        if (creep.store.getUsedCapacity() === 0) {
            return this._getMoreEnergy(creep);
        }

        const spawn = creep.room.spawns[0];
        if (spawn.canStillStoreEnergy()) {
            if(creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE ) {
                creep.travelTo(spawn);
            }

            return;
        }

        const constructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
        if (constructionSites.length > 0) {
            creep.setTask(TASK.BUILD, constructionSites[0].id);
        } else {
            creep.setTask(TASK.UPGRADE_CONTROLLER, undefined);
        }
        this.run(creep);
    },

    _onHarvestFinished(creep) {
        creep.setTask(TASK.DEPOSIT_ENERGY, undefined);
        this.run(creep);
    },

    _getMoreEnergy(creep) {
        const source = this._getBestSource(creep);
        creep.setTask(TASK.HARVEST_ENERGY, source.id);

        this.run(creep);
    },

    _getBestSource(creep) {
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
    },

    _build(creep) {
        if (creep.store.getUsedCapacity() === 0) {
            return this._getMoreEnergy(creep);
        }

        const target = Game.getObjectById(creep.taskTargetId);
        if (target === undefined) {
            this._onHarvestFinished() // still got some juice, so let's pretend we are harvesters and let's see when this will cause issues, lul.
        }

        switch (creep.build(target)) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                return creep.travelTo(target, {maxRooms: 1, range: 2, stuckValue: 1});
            case ERR_NOT_ENOUGH_RESOURCES:
                this._getMoreEnergy(creep);
                break;
            case ERR_INVALID_TARGET:
                // Probably finished building
                creep.setTask(TASK.DEPOSIT_ENERGY, undefined);
                break;
            default:
                log.warning(creep + "building " + target + " " + creep.build(creep.taskTargetId));
                break;
        }
    },

    _upgradeController(creep) {
        switch (creep.upgradeController(creep.room.controller)) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                return creep.travelTo(creep.room.controller, {maxRooms: 1, range: 2, stuckValue: 1});
            case ERR_NOT_ENOUGH_RESOURCES:
                this._getMoreEnergy(creep);
                this.run(creep);
                break;
            default:
                log.warning(creep + "upgrading controller" + " " + creep.upgradeController(creep.room.controller));
                creep.setTask(TASK.DEPOSIT_ENERGY, undefined)
                break;
        }
    },

    _upgradeControllerButLookOutForConstructionSites(creep) {
        const constructionSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
        if (constructionSites.length > 0) {
            creep.setTask(TASK.BUILD, constructionSites[0].id);
            creep.say(creepTalk.surpriseTargetChange);
            this.run(creep);
            return;
        }

        this._upgradeController(creep);
    }
};

module.exports = rcl1creep;