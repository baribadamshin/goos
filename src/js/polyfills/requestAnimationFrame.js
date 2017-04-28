'use strict';

import performance from './perfomance';

export default (function() {
    const w = window;
    const requestAnimationFrame = (function () {
        let lastTime = 0;

        return callback => {
            const currTime = performance.now();
            const timeToCall = Math.max(0, 16 - (currTime - lastTime));
            const time = currTime + timeToCall;

            setTimeout(() => callback(time), timeToCall);

            lastTime = time;
        };
    }());

    return w.requestAnimationFrame
        || w.webkitRequestAnimationFrame
        || w.oRequestAnimationFrame
        || w.msRequestAnimationFrame
        || requestAnimationFrame;
}());

