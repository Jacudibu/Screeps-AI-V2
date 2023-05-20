Creep.prototype.setTask = function(task, newTargetId) {
    this.taskTargetId = newTargetId;
    this.task = task;
};

Creep.prototype.resetTask = function() {
    this.taskTargetId = undefined;
    this.task = undefined;
};

global.TASK_RESULT = {
    TARGET_REACHED: 100,
    CONTINUE_MOVING: 101,
};

Creep.prototype.moveToRoom = function(options = undefined) {
    const roomName = this.targetRoomName;

    const positionInNextRoom = new RoomPosition(25, 25, roomName);
    this.travelTo(positionInNextRoom, options);

    if (this.room.name === roomName) {
        return TASK_RESULT.TARGET_REACHED;
    } else {
        return TASK_RESULT.CONTINUE_MOVING;
    }
};

readableErrorCodes = {
    [ERR_NOT_OWNER]: "ERR_NOT_OWNER (-1)",
    [ERR_NO_PATH]: "ERR_NO_PATH (-2)",
    [ERR_NAME_EXISTS]: "ERR_NAME_EXISTS (-3)",
    [ERR_BUSY]: "ERR_BUSY (-4)",
    [ERR_NOT_FOUND]: "ERR_NOT_FOUND (-5)",
    [ERR_NOT_ENOUGH_ENERGY]: "ERR_NOT_ENOUGH_ENERGY (-6)",
    [ERR_NOT_ENOUGH_RESOURCES]: "ERR_NOT_ENOUGH_RESOURCES (-6)",
    [ERR_INVALID_TARGET]: "ERR_INVALID_TARGET (-7)",
    [ERR_FULL]: "ERR_FULL (-8)",
    [ERR_NOT_IN_RANGE]: "ERR_NOT_IN_RANGE (-9)",
    [ERR_INVALID_ARGS]: "ERR_INVALID_ARGS (-10)",
    [ERR_TIRED]: "ERR_TIRED (-11)",
    [ERR_NO_BODYPART]: "ERR_NO_BODYPART (-12)",
    [ERR_NOT_ENOUGH_EXTENSIONS]: "ERR_NOT_ENOUGH_EXTENSIONS (-6)",
    [ERR_RCL_NOT_ENOUGH]: "ERR_RCL_NOT_ENOUGH (-14)",
    [ERR_GCL_NOT_ENOUGH]: "ERR_GCL_NOT_ENOUGH (-15)",
};

Creep.prototype.logActionError = function(action, errorCode) {
    log.warning(this + " " + action + " resulted in unhandled error code " + readableErrorCodes[errorCode])
};