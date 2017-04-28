'use strict';

const className = 'goos_fullscreen';
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

function requestFullscreen() {
    this.classList.add(className);
}

function exitFullscreen() {
    this.classList.remove(className);
}

/**
 * @return {fullScreenApi}
 */
export default (function (d) {
    let changeEventType = 'fullscreenchange';
    const element = d.createElement('div');

    const requestMethod = element.requestFullscreen
        || element.webkitRequestFullScreen
        || element.webkitRequestFullscreen
        || element.mozRequestFullScreen
        || element.msRequestFullscreen
        || requestFullscreen;

    const exitMethod = d.exitFullscreen
        || d.cancelFullScreen
        || d.webkitExitFullscreen
        || d.webkitCancelFullScreen
        || d.mozCancelFullScreen
        || d.msExitFullscreen;


    changeEvents.forEach(eventType => {
        if (`on${eventType}` in d) {
            changeEventType = eventType;
        }
    });

    let elementProperty;
    elementProperties.forEach(property => {
        if (property in d) {
            elementProperty = property;
        }
    });

    return {
        changeEventType,
        request(container) {
            if (!elementProperty) {
                d[elementProperties[0]] = container;
            }

            requestMethod.call(container, undefined);
        },
        exit() {
            if (exitMethod) {
                exitMethod.call(d);
                return;
            }

            exitFullscreen.call(d[elementProperties[0]]);
        }
    };
}(document));

/**
 * @typedef {Object} fullScreenApi
 * @property {Function} request
 * @property {Function} exit
 * @property {string} changeEventType
 */
