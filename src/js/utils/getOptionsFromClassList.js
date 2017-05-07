'use strict';

/**
 * Returns modifiers from classList property
 * @param {DOMTokenList} classList
 * @returns {OptionsFromBlockClassList}
 */
export default classList => {
    const responsive = classList.contains('goos_responsive');
    const size = Number((classList.toString().match(/goos_size_(\d+)/) || [])[1] || 1);

    return {
        responsive,
        size
    };
}

/**
 * @typedef {Object} OptionsFromBlockClassList
 * @property {number} size
 * @property {boolean} responsive
 */
