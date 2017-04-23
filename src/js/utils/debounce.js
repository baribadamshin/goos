'use strict';

/**
 * Creates a debounced function that delays invoking callback until after wait milliseconds
 *
 * @public
 * @param {Function} callback
 * @param {number} wait
 * @returns {function()}
 */
export default function (callback, wait) {
    let timeoutId;

    return function () {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(callback, wait);
    };
}
