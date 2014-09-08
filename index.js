var through = require('through'),
    ieify = require('ieify');

module.exports = function (file) {
    if (!/\.js/.test(file)) {
        return through();
    }

    var buffer = '';

    return through(function(chunk) {
       buffer += chunk.toString();
    },
    function() {
       this.queue(ieify(buffer));
       this.queue(null);
    });
};
