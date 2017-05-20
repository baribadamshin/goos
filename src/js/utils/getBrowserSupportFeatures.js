'use strict';

import isScrollSnapPropertySupport from './isScrollSnapPropertySupport';

/**
 * Checks browser features which Goos use
 *
 * @returns {BrowserSupportFeatures}
 */
export default () => {
    const mutationObserver = 'MutationObserver' in window;
    const scrollSnap = isScrollSnapPropertySupport(window);
    const gestureEvents = 'ongestureend' in document.documentElement;

    return {
        mutationObserver,
        scrollSnap,
        gestureEvents
    }
};

/**
 * @typedef {Object} BrowserSupportFeatures
 * @property {boolean} mutationObserver
 * @property {boolean} scrollSnap
 * @property {boolean} gestureEvents
 */
