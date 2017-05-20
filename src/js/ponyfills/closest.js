'use strict';

export default (function () {
    return function (cssSelector) {
        let node = this;

        while (node) {
            if (node.classList.contains(cssSelector)) {
                return node;
            } else {
                node = node.parentElement;
            }
        }

        return null;
    }
})();
