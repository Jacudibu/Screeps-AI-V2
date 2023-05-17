Creep.prototype.setTask = function(task, newTargetId) {
    this.taskTargetId = newTargetId;
    this.task = task;
};

Creep.prototype.resetTask = function() {
    this.taskTargetId = undefined;
    this.task = undefined;
}

const TASK_RESULT = {
    TARGET_REACHED: 100,
    CONTINUE_MOVING: 101,
}

Creep.prototype.moveToRoom = function(options = undefined) {
    const roomName = this.targetRoomName;

    if (this.room.name === roomName) {
        return TASK_RESULT.TARGET_REACHED;
    }

    const positionInNextRoom = new RoomPosition(25, 25, roomName);
    this.travelTo(positionInNextRoom, options);
    return TASK_RESULT.CONTINUE_MOVING;
};