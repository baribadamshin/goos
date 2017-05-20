'use strict';

const initTime = +new Date();

export default (window.performance || {
    now: () => +new Date() - initTime
});
