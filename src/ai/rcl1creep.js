const rcl1creep = {
    run(creep) {
        switch (creep.task) {
            case TASK.HARVEST_ENERGY: {
                this._harvestEnergy(creep);
                break;
            }
            case TASK.DEPOSIT_ENERGY: {
                this._depositEnergy(creep);
                break;
            }
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

        if(creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE ) {
            creep.travelTo(Game.spawns['Spawn1']);
        }
    },

    _onHarvestFinished(creep) {
        creep.task = TASK.DEPOSIT_ENERGY;
    },

    _onDepositFinished(creep) {
        const source = this._getBestSource(creep);

        creep.task = TASK.HARVEST_ENERGY;
        creep.taskTargetId = source.id;
    },

    _getBestSource(creep) {
        const allRCL1Workers = creep.room.find(FIND_MY_CREEPS, { filter: creep => creep.role === ROLE.RCL1_CREEP});
        const sources = _.sortBy(creep.room.sources, source => source.distanceToSpawn);

        for (let i = 0; i < sources.length; i++) {
            const source = sources[i];
            const creepsAssignedToSource = utils.count(allRCL1Workers, creep => creep.taskTargetId === source.id);
            const sourceMaxHarvesterCount = source.freeTileCount + source.distanceToSpawn / 10;

            if (creepsAssignedToSource < sourceMaxHarvesterCount){
                return source;
            }
        }

        log.warning(creep + "Unable to determine which source to pick, choosing the first one instead...")
        return sources[0];
    }

};

module.exports = rcl1creep;