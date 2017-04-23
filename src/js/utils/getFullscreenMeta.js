'use strict';

/**
 * Returns Fullscreen API methods or false if not support
 *
 * @param {HTMLDocument} d
 * @returns {fullScreenMeta}
 */
export default function (d) {
    const body = d.body;
    let fullScreen = false;

    const request = body.requestFullscreen
        || body.webkitRequestFullscreen
        || body.mozRequestFullScreen
        || body.msRequestFullscreen;

    const exit = d.exitFullscreen
        || d.cancelFullScreen
        || d.webkitExitFullscreen
        || d.webkitCancelFullScreen
        || d.mozCancelFullScreen
        || d.msExitFullscreen;

    let changeEventType = 'fullscreenchange';
    const fullScreenChangeEvents = [
        'webkitfullscreenchange',
        'mozfullscreenchange',
        'MSFullscreenChange'
    ];

    fullScreenChangeEvents.forEach(eventType => {
        if (`on${eventType}` in d) {
            changeEventType = eventType;
        }
    });

    let elementProperty = 'fullscreenElement';
    const fullScreenElementProperties = [
        'webkitFullscreenElement',
        'webkitCurrentFullScreenElement',
        'mozFullScreenElement',
        'msFullscreenElement'
    ];

    fullScreenElementProperties.forEach(property => {
        if (property in d) {
            elementProperty = property;
        }
    });

    if (request && exit) {
        fullScreen = {
            request,
            exit,
            changeEventType,
            elementProperty,
        };
    }

    return fullScreen;
};

/**
 * @typedef {Object|boolean} fullScreenMeta
 * @property {Function} request
 * @property {Function} exit
 * @property {string} changeEventType
 * @property {string} elementProperty
 */
