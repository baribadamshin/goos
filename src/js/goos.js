import Slider from './slider'
import Magic from './magic'

import '../css/goos.css';

module.exports = function goos(domElements, options) {
    const init = (domElement) => {
        if (options && options.method === 'magic') {
            return new Magic(domElement, Object.assign(options, {
                slideBy: 1,
                size: 1
            }));
        } else {
            return new Slider(domElement, options);
        }
    };

    if (domElements && domElements.length) {
        return Array.prototype.map.call(domElements, init);
    } else {
        return init(domElements)
    }
};
