'use strict';

import performance from '../ponyfills/perfomance';
import requestAnimation from '../ponyfills/requestAnimationFrame';

/**
 *
 * @param {Function} draw
 * @param {number} duration
 * @param {Function} [easing]
 */
export default (draw, duration, easing) => {
    const start = performance.now();

    requestAnimation(function animate(time) {
        let timeFraction = (time - start) / duration;

        if (timeFraction > 1) {
            timeFraction = 1;
        }

        const progress = (easing) ? easing(timeFraction) : timeFraction;

        draw(progress);

        if (timeFraction < 1) {
            requestAnimation(animate);
        }
    });
}
