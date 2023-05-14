Creep.prototype.setTask = function(task, keepTaskTargetId) {
    if (!keepTaskTargetId) {
        this.taskTargetId = undefined;
    }

    this.task = task;
};