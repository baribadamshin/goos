import Desktop from './desktop'
import Touch from './touch'

import '../css/index.css';

function isMobile() {
    // современные мобильные браузеры
    if (window.matchMedia && matchMedia('(pointer:coarse)').matches) {
        return true;
    }

    // фолбек на всякие юсивебы
    return /mobile/i.test(window.navigator.userAgent);
}

module.exports = function goos(domElements, options) {
    const Instance = isMobile() ? Touch : Desktop;
    const init = domElement => new Instance(domElement, options);

    if (domElements && domElements.length) {
        return Array.prototype.map.call(domElements, init);
    } else {
        return init(domElements)
    }
};
