Creep.prototype.countBodyPartsOfType = function(type) {
    return Utils.count(this.body, bodyPart => bodyPart.type === type);
};

class CreepClassifications {
    static canDealSomeSortOfDamage(creep) {
        return creep.countBodyPartsOfType(RANGED_ATTACK) > 0
            || creep.countBodyPartsOfType(ATTACK) > 0
            || creep.countBodyPartsOfType(WORK) > 0
    }

    isHealer(creep) {
        return creep.countBodyPartsOfType(HEAL) > 0;
    }

    isRangedAttacker(creep) {
        return creep.countBodyPartsOfType(RANGED_ATTACK) > 0;
    };

    isMeleeAttacker(creep) {
        return creep.countBodyPartsOfType(ATTACK) > 0;
    };

    isDismantler(creep) {
        return creep.countBodyPartsOfType(WORK) > 0;
    };

    canAttackController(creep) {
        return creep.countBodyPartsOfType(CLAIM) > 0;
    };
}

global.CreepClassifications = CreepClassifications;