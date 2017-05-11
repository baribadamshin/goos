'use strict';

import isScrollSnapPropertySupport from './isScrollSnapPropertySupport';

/**
 * Checks browser features which Goos use
 *
 * @param {Window} w
 * @param {HTMLDocument} d
 * @returns {BrowserSupportFeatures}
 */
export default (w, d) => {
    const mutationObserver = 'MutationObserver' in w;
    // UC browser thinks that he can matchMedia but he's not
    const matchMedia = 'matchMedia' in w && /ucbrowser/i.test(w.navigator.userAgent) !== true;
    const scrollSnap = isScrollSnapPropertySupport(w);
    const gestureEvents = 'ongestureend' in d.documentElement;

    return {
        matchMedia,
        mutationObserver,
        scrollSnap,
        gestureEvents
    }
};

/**
 * @typedef {Object} BrowserSupportFeatures
 * @property {boolean} mutationObserver
 * @property {boolean} matchMedia
 * @property {boolean} scrollSnap
 * @property {boolean} gestureEvents
 */
