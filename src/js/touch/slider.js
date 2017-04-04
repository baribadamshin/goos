import Core from '../core';

export default class TouchSlider extends Core {
    setUserInterface() {
        this._classNames.init = 'goos_init_touch';

        super.setUserInterface();
    }

    bindObservers() {
        // следим за изменением ориентации

    }
}
