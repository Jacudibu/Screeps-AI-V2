const hauler = {
    run(creep) {
        switch (creep.task) {
            case TASK.DECIDE_WHAT_TO_DO: return this.decideWhatToDo(creep);
            case TASK.PULL: return this.pull(creep);
            case TASK.PICK_UP_ENERGY: return this.pickUpEnergy(creep);
            case TASK.DEPOSIT_ENERGY: return this.depositEnergy(creep);
            case TASK.WITHDRAW_ENERGY: return this.withdrawEnergy(creep);
            default:
                this.decideWhatToDo(creep);
                return;
        }
    },

    decideWhatToDo(creep) {
        if (creep.store.getFreeCapacity() === 0) {
            creep.setTask(TASK.DEPOSIT_ENERGY);
            this.depositEnergy(creep);
            return;
        }

        // TODO: Prevent two haulers from deciding to pull that creep!
        const pullableCreeps = creep.room.find(FIND_MY_CREEPS, {filter: x => x.task === TASK.GET_PULLED_TO_TARGET});
        for (const other of pullableCreeps) {
            if (creep.room.find(FIND_MY_CREEPS, {filter: x => x.taskTargetId === other.id}).length === 0) {
                creep.setTask(TASK.PULL, other.id);
                this.pull(creep);
                return;
            }
        }

        const drops = creep.room.find(FIND_DROPPED_RESOURCES, {filter: x => x.resourceType === RESOURCE_ENERGY && x.amount > 200});
        if (drops.length > 0) {
            creep.setTask(TASK.PICK_UP_ENERGY, drops[0].id);
            this.pickUpEnergy(creep);
            return;
        }

        const containers = _.filter(creep.room.containers, (x => x.store[RESOURCE_ENERGY] > creep.store.getCapacity()));
        if (containers.length > 0) {
            const target = _.max(containers, x => x.store[RESOURCE_ENERGY]);
            creep.setTask(TASK.WITHDRAW_ENERGY, target.id);
            this.withdrawEnergy(creep);
            return;
        }

        // TODO: Idle somewhere where you aren't annoying, thanks
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
        let targetPos = target.pos;
        let requiredDistance = 1;
        if (target instanceof Source) {
            const containerPos = target.nearbyContainerPosition;
            if (containerPos !== undefined) {
                targetPos = containerPos;
                requiredDistance = 0;
            }
        }

        const distanceToTarget = creep.pos.getRangeTo(targetPos);
        if (distanceToTarget === requiredDistance) {
            if (creep.fatigue > 0 || other.fatigue > 0) {
                return;
            }
            if (creep.move(other) !== OK) {
                return;
            }
            if (creep.pull(other) !== OK) {
                return;
            }
            if (other.move(creep) !== OK) {
                return;
            }

            creep.say(creepTalk.raisedArms, true);
            creep.setTask(TASK.DECIDE_WHAT_TO_DO);
            other.setTask(TASK.FINISHED_GETTING_PULLED, other.taskTargetId);
            return;
        }

        if (creep.travelTo(targetPos) !== OK) {
            // TODO: Make it so that our hauler is always empty when "hauling" workers, so this cannot happen.
            return;
        }

        creep.pull(other);
        other.move(creep);
        creep.say(creep.ticksToLive % 2 === 0 ? creepTalk.run1 : creepTalk.run2, true);
    },

    pickUpEnergy(creep) {
        if (creep.store.getFreeCapacity() === 0) {
            this.decideWhatToDo(creep);
            return;
        }

        const target = Game.getObjectById(creep.taskTargetId);
        const result = creep.pickup(target);
        switch (result) {
            case OK:
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                return;

            case ERR_INVALID_TARGET:
                creep.taskTargetId = undefined;
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                this.run(creep);
                return;

            case ERR_NOT_IN_RANGE:
                creep.travelTo(target);
                return;

            default:
                creep.logActionError("pickup", result);
        }
    },

    depositEnergy(creep) {
        if (creep.store.getUsedCapacity() === 0) {
            this.decideWhatToDo(creep);
            return;
        }

        let target;
        if (creep.taskTargetId === undefined) {
            target = creep.room.findClosestFreeEnergyStorageTo(creep.pos, creep.store.getUsedCapacity(RESOURCE_ENERGY));
            if (target === null) {
                // TODO ?
                return;
            }

            creep.taskTargetId = target.id;
        } else {
            target = Game.getObjectById(creep.taskTargetId)
        }

        const result = creep.transfer(target, RESOURCE_ENERGY);
        switch (result) {
            case OK:
                creep.taskTargetId = undefined;
                return;
            case ERR_NOT_IN_RANGE:
                creep.travelTo(target);
                return;
            case ERR_FULL:
                creep.taskTargetId = undefined;
                this.depositEnergy(creep);
                return;
            default:
                creep.logActionError("depositEnergy", result);
                return;
        }
    },

    withdrawEnergy(creep) {
        if (creep.taskTargetId === undefined) {
            this.decideWhatToDo(creep);
            return;
        }

        const target = Game.getObjectById(creep.taskTargetId);
        const result = creep.withdraw(target, RESOURCE_ENERGY);
        switch (result) {
            case OK:
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                return;

            case ERR_NOT_IN_RANGE:
                creep.travelTo(target.pos);
                return;

            default:
                creep.logActionError("withdrawEnergy", result);
                return;
        }
    },
};

module.exports = hauler;
profiler.registerObject(hauler, "hauler");