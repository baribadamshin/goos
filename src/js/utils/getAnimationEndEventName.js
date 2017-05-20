'use strict';

// TODO research something better
export default (function () {
    const fakeElement = document.createElement('div');
    const eventNamesMatching = {
        // 'transition'   : 'transitionend', // UC Browser :-(
        'WebkitTransition': 'webkitAnimationEnd',
        'MozTransition'   : 'animationend', // its ok
        'OTransition'     : 'oAnimationEnd',
        'MsTransition'    : 'MSAnimationEnd'
    };

    let eventName;

    for (let name in eventNamesMatching) {
        if (fakeElement.style[name] !== undefined) {
            eventName = eventNamesMatching[name];

            break;
        }
    }

    return eventName;
}());
