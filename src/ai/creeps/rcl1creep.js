const rcl1creep = {
    run(creep) {
        switch (creep.task) {
            case TASK.HARVEST_ENERGY: return this._harvestEnergy(creep);
            case TASK.DEPOSIT_ENERGY: return this._depositEnergy(creep);
            case TASK.UPGRADE_CONTROLLER: return this._upgradeController(creep)
            default: {
                // TODO: error handling
                this._onDepositFinished(creep);
            }
        }
    },

    _harvestEnergy(creep) {
        if(creep.store.getFreeCapacity() === 0) {
            return this._onHarvestFinished(creep);
        }

        const source = Game.getObjectById(creep.taskTargetId);
        if (source === null) {
            return this._onDepositFinished(creep);
        }

        if(creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.travelTo(source);
        }
    },

    _depositEnergy(creep) {
        if (creep.store.getUsedCapacity() === 0) {
            return this._onDepositFinished(creep);
        }

        const spawn = creep.room.spawns[0];
        if (spawn.canStillStoreEnergy()) {
            if(creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE ) {
                creep.travelTo(spawn);
            }

            return;
        }

        creep.setTask(TASK.UPGRADE_CONTROLLER);
        this.run(creep);
    },

    _onHarvestFinished(creep) {
        creep.setTask(TASK.DEPOSIT_ENERGY);
        this.run(creep);
    },

    _onDepositFinished(creep) {
        const source = this._getBestSource(creep);
        creep.setTask(TASK.HARVEST_ENERGY);
        creep.taskTargetId = source.id;

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

    _upgradeController(creep) {
        switch (creep.upgradeController(creep.room.controller)) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                return creep.travelTo(creep.room.controller, {maxRooms: 1, range: 2, stuckValue: 1});
            case ERR_NOT_ENOUGH_RESOURCES:
                creep.setTask(TASK.HARVEST_ENERGY);
                this.run(creep);
                break;
            default:
                log.warning(creep + "upgrading controller", creep.upgradeController(creep.room.controller));
                break;
        }
    }
};

module.exports = rcl1creep;