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
            this._onHarvestFinished(creep);
            return;
        }

        const sources = creep.room.find(FIND_SOURCES);
        if(creep.harvest(sources[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0]);
        }
    },

    _depositEnergy(creep) {
        if (creep.store.getUsedCapacity() === 0) {
            this._onDepositFinished(creep);
            return;
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
        creep.task = TASK.HARVEST_ENERGY;
        this._harvestEnergy(creep);
    }


};

module.exports = rcl1creep;