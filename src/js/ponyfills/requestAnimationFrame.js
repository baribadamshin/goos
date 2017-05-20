'use strict';

import performance from './perfomance';

export default (function() {
    const w = window;
    const requestAnimation = (function () {
        let lastTime = 0;

        return callback => {
            const currTime = performance.now();
            const timeToCall = Math.max(0, 16 - (currTime - lastTime));
            const time = currTime + timeToCall;

            setTimeout(() => callback(time), timeToCall);

            lastTime = time;
        };
    }());

    // he has a broken requestAnimationFrame
    if (/ucbrowser/i.test(w.navigator.userAgent) === true) {
        return requestAnimation;
    }

    return w.requestAnimationFrame
        || w.webkitRequestAnimationFrame
        || w.oRequestAnimationFrame
        || w.msRequestAnimationFrame
        || w.mozRequestAnimationFrame
        || requestAnimation;
}());

