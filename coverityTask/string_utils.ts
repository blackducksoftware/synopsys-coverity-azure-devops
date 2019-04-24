module.exports = {
    isBlank: function (value: any) {
        return typeof value == 'string' && !value.trim() || typeof value == 'undefined' || value === null;
    }
}