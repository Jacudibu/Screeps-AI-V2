global.toggleHiveLayout = function() {
    return Memory.settings.drawHiveLayout = !Memory.settings.drawHiveLayout;
};

global.print = function(value) {
    return JSON.stringify(value, null, 2);
};