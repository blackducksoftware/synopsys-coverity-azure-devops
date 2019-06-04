//split utils(non-coverity, coverity and the unity) as modules.
//move out of root, the non-root things.
module.exports = {
    isBlank: function (value) {
        return typeof value == 'string' && !value.trim() || typeof value == 'undefined' || value === null;
    }
};
