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
            creep.moveTo(source);
        }
    },

    _depositEnergy(creep) {
        if (creep.store.getUsedCapacity() === 0) {
            return this._onDepositFinished(creep);
        }

        if(creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE ) {
            creep.moveTo(Game.spawns['Spawn1']);
        }
    },

    _onHarvestFinished(creep) {
        creep.task = TASK.DEPOSIT_ENERGY;
        this._depositEnergy(creep);
    },

    _onDepositFinished(creep) {
        const sources = creep.room.sources;

        creep.task = TASK.HARVEST_ENERGY;
        creep.taskTargetId = sources[0].id;

        this._harvestEnergy(creep);
    }


};

module.exports = rcl1creep;