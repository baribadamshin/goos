'use strict';

/**
 * Creates a debounced function that delays invoking callback until after wait milliseconds
 *
 * @public
 * @param {Function} callback
 * @param {number} wait
 * @returns {function()}
 */
export default (callback, wait) => {
    let timeoutId;

    return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(callback, wait);
    };
}
