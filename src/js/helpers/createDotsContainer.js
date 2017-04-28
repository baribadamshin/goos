'use strict';

/**
 * Insert info container wrapper for dots navigation
 *
 * @param {HTMLElement} container (@modifies)
 * @param {string} className
 */
export default (container, className) => {
    const dotsContainer = document.createElement('ul');

    dotsContainer.className = className;

    return container.appendChild(dotsContainer);
}
