let lastRCL = {};
Room.prototype.checkForRCLUpdate = function() {
    if (this.memory.lastRCL === undefined) {
        this.memory.lastRCL = this.controller.level;
        lastRCL[this.name] = this.controller.level;

        if (this.controller.level === 1) {
            log.warning(this + " new room established!");
        }

        return true;
    }

    if (!lastRCL[this.name]) {
        lastRCL[this.name] = this.memory.lastRCL;
        return false;
    }

    if (lastRCL[this.name] === this.controller.level) {
        return false;
    }

    log.info(this + " RCL UPDATE! " + lastRCL[this.name] + " -> " + this.controller.level);

    lastRCL[this.name] = this.controller.level;
    this.memory.lastRCL = this.controller.level;

    return true;
};