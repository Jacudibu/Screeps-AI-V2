Room.prototype.checkForRCLUpdate = function() {
    if (this.memory.rcl === undefined) {
        this.memory.rcl = this.controller.level;
        return true;
    }

    if (this.memory.rcl === this.controller.level) {
        return false;
    }

    log.info(this + " RCL UPDATE! " + this.memory.rcl + " -> " + this.controller.level);
    this.memory.rcl = this.controller.level;
    return true;
};