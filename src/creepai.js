const ai = {
    [ROLE.RCL1_CREEP]: require('ai/creeps/rcl1creep'),
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
        ai[creep.role](creep);
    },
};

profiler.registerObject(creepAI, "creepAI");
module.exports = creepAI;