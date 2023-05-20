const harvester = {
    run(creep) {
        switch (creep.task) {
            case TASK.GET_PULLED_TO_TARGET: return this.getPulled(creep);
            case TASK.HARVEST_ENERGY: return this.harvestEnergy(creep);
            case TASK.FINISHED_GETTING_PULLED:
                creep.setTask(TASK.HARVEST_ENERGY, creep.taskTargetId);
                this.harvestEnergy(creep);
                return;

            default:
                this.decideWhatToDo(creep);
                return;
        }
    },

    decideWhatToDo(creep) {
        if (creep.taskTargetId === undefined) {
            this.findUnoccupiedSource(creep);
        }

        const source = Game.getObjectById(creep.taskTargetId);
        if (creep.pos.getRangeTo(source.pos) === 1) {
            this.startHarvesting(creep);
            return;
        }

        creep.setTask(TASK.GET_PULLED_TO_TARGET, creep.taskTargetId);
    },

    findUnoccupiedSource(creep) {
        for (const source of creep.room.sources) {
            // TODO: Cache this state
            const harvesters = creep.room.find(FIND_MY_CREEPS, {filter: x => x.role === ROLE.HARVESTER && x.taskTargetId === source.id});
            if (harvesters.length === 0) {
                creep.taskTargetId = source.id;
                return;
            }

            // Alternatively, maybe a harvester creep is about to die? Although taskTargetId should be inherited if we do that
        }

        log.error(creep + " no unoccupied sources found!")
    },

    getPulled(creep) {
        // const target = Game.getObjectById(creep.taskTargetId);
        // const distance = creep.pos.getRangeTo(target.pos);
        // if (distance === 1) {
        //     this.startHarvesting(creep);
        // }

        // TODO: Maybe some error logging if TTL < 1300 or so
    },

    startHarvesting(creep) {
        creep.setTask(TASK.HARVEST_ENERGY, creep.taskTargetId);
        this.run(creep);
    },

    harvestEnergy(creep) {
        const target = Game.getObjectById(creep.taskTargetId);
        const result = creep.harvest(target);
        switch (result) {
            case OK: return;
            case ERR_NOT_IN_RANGE:
                log.error(creep + " was set to harvest energy but not in range!");
                creep.setTask(TASK.GET_PULLED_TO_TARGET, creep.taskTargetId);
        }
    }
};

module.exports = harvester;
profiler.registerObject(harvester, "harvester");