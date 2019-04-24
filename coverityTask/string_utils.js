module.exports = {
    isBlank: function (value) {
        return typeof value == 'string' && !value.trim() || typeof value == 'undefined' || value === null;
    }
};
