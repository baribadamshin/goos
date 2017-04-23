'use strict';

/**
 * @param {Window} w
 * @returns {boolean}
 */
export default function (w) {
    let scrollSnapProperty = 'scroll-snap-type: mandatory';

    scrollSnapProperty = [
        `(-webkit-${scrollSnapProperty})`,
        `(-ms-${scrollSnapProperty})`,
        `(${scrollSnapProperty})`,
    ].join('or');

    return !!(w.CSS && w.CSS.supports(scrollSnapProperty));
};
