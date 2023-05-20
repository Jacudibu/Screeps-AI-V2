const ai = {
    [ROLE.EARLY_WORKER]: require('ai/earlyworker'),
    [ROLE.HARVESTER]: require('ai/harvester'),
    [ROLE.HAULER]: require('ai/hauler'),
    [ROLE.RANGED_DEFENDER]: require('ai/rangeddefender'),
    [ROLE.SCOUT]: require('ai/scout'),
};

const creepAI = {
    run() {
        for (let name in Game.creeps) {
            const creep = Game.creeps[name];

            if (creep.spawning) {
                continue;
            }

            this._tryRunCreepLogic(creep);
        }
    },

    _tryRunCreepLogic(creep) {
        try {
            this._runCreepLogic(creep);
        } catch (e) {
            let message = creep + " -> caught error: " + e;
            if (e.stack) {
                message += "\nTrace:\n" + e.stack;
            }
            log.error(message);
        }
    },

    _runCreepLogic: function(creep) {
        ai[creep.role].run(creep);
    },
};

profiler.registerObject(creepAI, "creepAI");
module.exports = creepAI;