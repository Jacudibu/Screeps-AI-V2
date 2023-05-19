const rangedDefender = {
    run(creep) {
        switch (creep.task) {
            case TASK.DECIDE_WHAT_TO_DO:
                if (ThreatDetection.at(creep.room.name) !== undefined) {
                    creep.setTask(TASK.ATTACK);
                    this.run(creep);
                    return;
                }

                const hive = Hives[creep.origin];
                for (const remoteName in hive.remotes) {
                    if (ThreatDetection.at(remoteName) === undefined) {
                        continue;
                    }

                    creep.setTask(TASK.MOVE_TO_ROOM);
                    creep.targetRoomName = remoteName;
                    this.run(creep);
                    return;
                }

                if (creep.room.name !== creep.origin) {
                    creep.setTask(TASK.MOVE_TO_ROOM);
                    creep.targetRoomName = creep.origin;
                    this.run(creep);
                    return;
                }

                creep.setTask(TASK.IDLE);
                return;

            case TASK.MOVE_TO_ROOM:
                if (creep.moveToRoom() === TASK_RESULT.TARGET_REACHED) {
                    creep.setTask(TASK.DECIDE_WHAT_TO_DO, undefined);
                    this.run(creep);
                }
                return;

            case TASK.ATTACK:
                let target = Game.getObjectById(creep.taskTargetId);
                if (target === null) {
                    const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
                    if (hostiles.length === 0) {
                        creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                        this.run(creep);
                        return;
                    }

                    target = Utils.getClosestRoomObjectToPosition(creep.pos, hostiles);
                    creep.taskTargetId = target.id;
                }
                const nearbyHostiles = creep.findNearbyHostiles();

                const rangeToTarget = creep.pos.getRangeTo(target);
                if (rangeToTarget === 1) {
                    const result = creep.rangedMassAttack();
                    switch (result) {
                        case OK:
                            creep.say(creepTalk.rangedMassAttack, true);
                            if (nearbyHostiles !== ERR_NOT_FOUND) {
                                creep.kite(nearbyHostiles, {range: CREEP_RANGED_ATTACK_RANGE});
                            }
                            return;
                        default:
                            creep.logActionError("rangedMassAttack", result);
                            return;
                    }
                }

                const result = creep.rangedAttack(target);
                switch (result) {
                    case OK:
                        creep.say(creepTalk.rangedAttack, true);
                        if (nearbyHostiles !== ERR_NOT_FOUND) {
                            creep.kite(nearbyHostiles, {range: CREEP_RANGED_ATTACK_RANGE});
                        }
                        return;
                    case ERR_NOT_IN_RANGE:
                        creep.say(creepTalk.chargeAttack, true);
                        creep.travelTo(target.pos, {range: CREEP_RANGED_ATTACK_RANGE});
                        return;
                    default:
                        creep.logActionError("rangedAttack against " + target, result);
                        return;
                }

            case TASK.IDLE:
                if (creep.ticksToLive % 5 === 0) {
                    creep.say(creepTalk.sleep, true);
                }
                if (creep.ticksToLive % 3 === 0) {
                    creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                }
                // TODO: Move to some position where we aren't obstructing anyone
                return;

            default:
                creep.setTask(TASK.DECIDE_WHAT_TO_DO);
                this.run(creep);
                return;
        }
    },

};

module.exports = rangedDefender;
profiler.registerObject(rangedDefender, "rangedDefender");

Creep.prototype.findNearbyHostiles = function() {
    const result = this.room.find(FIND_HOSTILE_CREEPS, {filter: c => this.pos.getRangeTo(c) <= CREEP_RANGED_ATTACK_RANGE});

    if (result.length === 0) {
        return ERR_NOT_FOUND;
    }

    return result;
};

Creep.prototype.attackNearbyHostilesWithRangedAttacks = function(nearbyHostiles) {
    if (nearbyHostiles.length > 3) {
        this.say(creepTalk.rangedMassAttack, true);
        this.rangedMassAttack();
    } else {
        this.say(creepTalk.rangedAttack, true);
        this.rangedAttack(nearbyHostiles[0]);
    }
};