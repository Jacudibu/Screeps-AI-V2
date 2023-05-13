const memoryManagement = {
    run() {
        this._deleteDeadCreeps();
    },

    _deleteDeadCreeps() {
        for (let creepName in Memory.creeps) {
            if (Game.creeps[creepName]) {
                continue;
            }

            utility.deleteCreepCacheOnDeath(creepName);
            delete Memory.creeps[creepName];
        }
    }
}

profiler.registerObject(memoryManagement, "memoryManagement");
module.exports = memoryManagement;