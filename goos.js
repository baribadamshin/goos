import Slider from './src/modules/slider'
import Magic from './src/modules/magic'

import './src/styles/goos.css';

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

    if (domElements.length) {
        return Array.prototype.map.call(domElements, init);
    } else {
        return init(domElements)
    }
};
