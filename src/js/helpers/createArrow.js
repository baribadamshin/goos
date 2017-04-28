'use strict';

/**
 * Insert info container two arrows
 *
 * @param {HTMLElement} container (@modifies)
 * @param {string} className
 */
export default (container, className) => {
    const arrow = document.createElement('button');

    arrow.className = className;
    arrow.innerHTML = '<i/>';

    return container.insertBefore(arrow, container.firstChild);
}
