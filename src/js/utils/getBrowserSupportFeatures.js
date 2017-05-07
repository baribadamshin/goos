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

    return {
        matchMedia,
        mutationObserver,
        scrollSnap
    }
};

/**
 * @typedef {Object} BrowserSupportFeatures
 * @property {boolean} mutationObserver
 * @property {boolean} matchMedia
 * @property {boolean} scrollSnap
 */
