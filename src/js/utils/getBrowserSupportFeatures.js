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
    const matchMedia = 'matchMedia' in w;
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
