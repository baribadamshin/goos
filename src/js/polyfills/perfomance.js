'use strict';

export default (window.performance || {
    offset: Date.now(),
    now: () => Date.now() - this.offset
});
