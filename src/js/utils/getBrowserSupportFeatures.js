'use strict';

import getFullscreenMeta from './getFullscreenMeta';
import isScrollSnapPropertySupport from './isScrollSnapPropertySupport';

/**
 * Checks browser features which Goos use
 *
 * @param {Window} w
 * @param {HTMLDocument} d
 * @returns {BrowserSupportFeatures}
 */
export default function(w, d) {
    const mutationObserver = 'MutationObserver' in w;
    const matchMedia = 'matchMedia' in w;
    const fullScreen = getFullscreenMeta(d);
    const scrollSnap = isScrollSnapPropertySupport(w);

    return {
        matchMedia,
        mutationObserver,
        scrollSnap,
        fullScreen
    }
};

/**
 * @typedef {Object} BrowserSupportFeatures
 * @property {boolean} mutationObserver
 * @property {boolean} matchMedia
 * @property {boolean} scrollSnap
 * @property {fullScreenMeta} fullScreen
 */
