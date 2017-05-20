'use strict';

/**
 * @returns {boolean}
 */
export default () => {
    let scrollSnapProperty = 'scroll-snap-type: mandatory';

    scrollSnapProperty = [
        `(-webkit-${scrollSnapProperty})`,
        `(-ms-${scrollSnapProperty})`,
        `(${scrollSnapProperty})`,
    ].join('or');

    return !!(window.CSS && CSS.supports(scrollSnapProperty));
};
