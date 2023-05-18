const earlyWorker = require("ai/earlyworker")

const earlyRemoteWorker = {
    run(creep) {
        switch (creep.task) {
            case TASK.DECIDE_WHAT_TO_DO: return this._decideWhatToDo(creep);
            case TASK.HARVEST_ENERGY: return this._harvestEnergy(creep);
            case TASK.DEPOSIT_ENERGY: return this._depositEnergy(creep);
            case TASK.MOVE_TO_ROOM:
                if (creep.moveToRoom({preferHighway: true, offRoad: true}) === TASK_RESULT.TARGET_REACHED) {
                    creep.setTask(TASK.DECIDE_WHAT_TO_DO, undefined);
                    this.run(creep);
                }
                return;
            case TASK.BUILD: return this._build(creep)
            case TASK.UPGRADE_CONTROLLER: return this._upgradeController(creep)
            case TASK.UPGRADE_CONTROLLER_BUT_LOOK_OUT_FOR_CONSTRUCTION_SITES: return this._upgradeControllerButLookOutForConstructionSites(creep)
            default: {
                // TODO: error handling
                this._getMoreEnergy(creep);
            }
        }
    },

    _decideWhatToDo(creep) {
        if (creep.room.name === creep.origin) {
            if (creep.storage[RESOURCE_ENERGY]) {

            }
        }
    },
}

module.exports = earlyRemoteWorker;
profiler.registerObject(earlyRemoteWorker, "earlyRemoteWorker")