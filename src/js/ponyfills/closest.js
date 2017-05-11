'use strict';

export default (function (e) {
    return e.closest || (cssSelector => {
        let node = this;

        while (node) {
            if (node.matches(cssSelector)) {
                return node;
            } else {
                node = node.parentElement;
            }
        }

        return null;
    });
})(Element.prototype);
