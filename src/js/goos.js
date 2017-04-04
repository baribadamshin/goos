import Slider from './desktop/slider'
import TouchSlider from './touch/slider'

import '../css/goos.css';

function isMobile() {
    // современные мобильные браузеры
    if (matchMedia('(pointer:coarse)').matches) {
        return true;
    }

    // фолбек на всякие юсивебы
    return /mobile/i.test(window.navigator.userAgent);
}

module.exports = function goos(domElements, options) {
    const Instance = isMobile() ? TouchSlider : Slider;
    const init = (domElement) => new Instance(domElement, options);

    if (domElements && domElements.length) {
        return Array.prototype.map.call(domElements, init);
    } else {
        return init(domElements)
    }
};
