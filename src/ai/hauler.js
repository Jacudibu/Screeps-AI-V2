const hauler = {
    run(creep) {
        switch (creep.task) {
            case TASK.DECIDE_WHAT_TO_DO: return this.decideWhatToDo(creep);
            case TASK.PULL: return this.pull(creep);
            case TASK.PICK_UP_ENERGY: return this.pickUpEnergy(creep);
            case TASK.DEPOSIT_ENERGY: return this.depositEnergy(creep);
            default:
                this.decideWhatToDo(creep);
                return;
        }
    },

    decideWhatToDo(creep) {
        // TODO: Prevent two haulers from deciding to pull that creep!
        const pullableCreeps = creep.room.find(FIND_MY_CREEPS, {filter: x => x.task === TASK.GET_PULLED_TO_TARGET});
        for (const other of pullableCreeps) {
            if (creep.room.find(FIND_MY_CREEPS, {filter: x => x.taskTargetId === other.id}).length === 0) {
                creep.setTask(TASK.PULL, other.id);
                return;
            }
        }

        // TODO: pick up energy
        // TODO: store energy
        // TODO: idle
    },

    pull(creep) {
        if (creep.taskTargetId === undefined) // Might have died or something
        {
            this.decideWhatToDo(creep);
            return;
        }

        const other = Game.getObjectById(creep.taskTargetId);
        const distanceToOther = creep.pos.getRangeTo(other.pos);
        if (distanceToOther > 1) {
            creep.travelTo(other);
            return;
        }

        if (other.taskTargetId === undefined) {
            log.error(creep + " unable to pull " + other + " to target, its taskTargetId was undefined.");
            this.decideWhatToDo(creep);
            return;
        }

        const target = Game.getObjectById(other.taskTargetId);
        const distanceToTarget = creep.pos.getRangeTo(target.pos);
        if (distanceToTarget === 1) {
            // Swap positions and be done!
            creep.move(other);
            creep.pull(other);
            other.move(creep);

            creep.say(creepTalk.raisedArms, true);
            other.setTask(TASK.FINISHED_GETTING_PULLED, other.taskTargetId);
            creep.setTask(TASK.DECIDE_WHAT_TO_DO);
            return;
        }

        creep.travelTo(target);
        creep.pull(other);
        other.move(creep);
        creep.say(creep.ticksToLive % 2 === 0 ? creepTalk.run1 : creepTalk.run2, true);
    },

    pickUpEnergy(creep) {
        // TODO
    },

    depositEnergy(creep) {
        // TODO
    }

};

module.exports = hauler;
profiler.registerObject(hauler, "hauler");