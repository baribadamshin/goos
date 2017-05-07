'use strict';

const FULLSCREEN_CLASS_NAME = 'goos_fullscreen';
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

function requestFullscreen(eventName) {
    this.classList.add(FULLSCREEN_CLASS_NAME);

    this.dispatchEvent(new CustomEvent(eventName));
}

function exitFullscreen(eventName) {
    this.classList.remove(FULLSCREEN_CLASS_NAME);

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
        currentFullScreenElement: null,
        changeEventType,
        request(container) {
            requestMethod && requestMethod.call(container, changeEventType);

            if (!d[elementProperty]) {
                this.currentFullScreenElement = container;
            }
        },
        exit() {
            if (exitMethod) {
                exitMethod.call(d);
                return;
            }

            exitFullscreen.call(d[elementProperty] || this.currentFullScreenElement, changeEventType);
            this.currentFullScreenElement = null;
        }
    };
}(window, document));

/**
 * @typedef {Object} fullScreenApi
 * @property {Function} request
 * @property {Function} exit
 * @property {string} changeEventType
 */
