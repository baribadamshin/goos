'use strict';

function getDistance(finger1, finger2) {
    const x = finger2.clientX - finger1.clientX;
    const y = finger2.clientY - finger1.clientY;

    return Math.sqrt((x * x) + (y * y));
}

export default (startTouchEvent, endTouchEvent) => {
    return getDistance(endTouchEvent[0], endTouchEvent[1]) / getDistance(startTouchEvent[0], startTouchEvent[1]);
}
