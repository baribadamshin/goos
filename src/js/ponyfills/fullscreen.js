'use strict';

const FULLSCREEN_CLASS_NAME = 'goos_fullscreen';
const BODY_FULLSCREEN_CLASS_NAME = 'fullscreen-mode-fallback';

const elementProperties = [
    'fullscreenElement',
    'webkitFullscreenElement',
    'webkitCurrentFullScreenElement',
    'mozFullScreenElement',
    'msFullscreenElement'
];
const changeEvents = [
    'webkitfullscreenchange',
    'mozfullscreenchange',
    'MSFullscreenChange'
];

function requestFullscreen(d, elementProperty, eventName) {
    d[elementProperty] = this;

    d.documentElement.classList.add(BODY_FULLSCREEN_CLASS_NAME);
    this.classList.add(FULLSCREEN_CLASS_NAME);

    this.dispatchEvent(new CustomEvent(eventName));
}

function exitFullscreen(d, elementProperty, eventName) {
    d[elementProperty] = undefined;

    this.classList.remove(FULLSCREEN_CLASS_NAME);
    d.documentElement.classList.remove(BODY_FULLSCREEN_CLASS_NAME);

    this.dispatchEvent(new CustomEvent(eventName));
}

/**
 * @return {fullScreenApi}
 */
export default (function (w, d) {
    let elementProperty = elementProperties[0];
    let changeEventType = 'fullscreenchange';
    let requestMethod;
    let exitMethod;

    const element = d.createElement('div');

    // UC browsers full screen mode little bit terrible, better we will use fallback
    if (/ucbrowser/i.test(w.navigator.userAgent) === true) {
        requestMethod = requestFullscreen;
    } else {
        requestMethod = element.requestFullscreen
            || element.webkitRequestFullScreen
            || element.webkitRequestFullscreen
            || element.mozRequestFullScreen
            || element.msRequestFullscreen
            || requestFullscreen;

        exitMethod = d.exitFullscreen
            || d.cancelFullScreen
            || d.webkitExitFullscreen
            || d.webkitCancelFullScreen
            || d.mozCancelFullScreen
            || d.msExitFullscreen;
    }

    changeEvents.forEach(eventType => {
        if (`on${eventType}` in d) {
            changeEventType = eventType;
        }
    });

    elementProperties.forEach(property => {
        if (property in d) {
            elementProperty = property;
        }
    });

    return {
        elementProperty,
        isFullscreenOn() {
            return !!d[elementProperty];
        },
        changeEventType,
        request(container) {
            requestMethod.call(container, d, elementProperty, changeEventType);
        },
        exit() {
            if (exitMethod) {
                exitMethod.call(d);
                return;
            }

            exitFullscreen.call(d[elementProperty], d, elementProperty, changeEventType);
        }
    };
}(window, document));

/**
 * @typedef {Object} fullScreenApi
 * @property {boolean} contentInFullScreenMode
 * @property {string} elementProperty
 * @property {string} changeEventType
 * @property {Function} request
 * @property {Function} exit
 */
