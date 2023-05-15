Creep.prototype.setTask = function(task, newTargetId) {
    this.taskTargetId = newTargetId;
    this.task = task;
};

Creep.prototype.resetTask = function() {
    this.taskTargetId = undefined;
    this.task = undefined;
}