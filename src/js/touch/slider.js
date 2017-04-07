import Core from '../core';

export default class TouchSlider extends Core {
    setUserInterface() {
        this._classNames.init = 'goos_init_touch';

        super.setUserInterface();
    }

    action() {
        // если браузер не умеет умную прокрутку, нам нужно сами допнуть элемент куда надо
        if (this.support.scrollSnap === false && isNaN(this._options.unitWidth) === false) {
            this.shaft.scrollLeft = this.current * this._options.unitWidth;
        }
    }

    setOptions(options) {
        super.setOptions(options);

        this._options.unitWidth = parseFloat(getComputedStyle(this.items[0]).getPropertyValue('width'));
    }

    bindObservers() {
        // следим за изменением ориентации экрана
        if (this.support.matchMedia) {
            const matchPortrait = matchMedia('(orientation: portrait)');
            const matchLandscape = matchMedia('(orientation: landscape)');

            // эта функция будет дергаться когда ориентация изменилась
            const orientationChangeHandler = query => {
                if (query.matches === true) {
                    this.setOptions();
                }
            };

            matchPortrait.addListener(orientationChangeHandler);
            matchLandscape.addListener(orientationChangeHandler);
        }

        // следим за скроллом
        // после скрола нам нужно поменять значение текущего активного элемента
        const scrollEndHandler = () => {
            // как только мы поменяем значение, сработает action
            this.current = Math.round(this.shaft.scrollLeft / this._options.unitWidth);
        };
        let scrollEndHandlerId;

        this.shaft.addEventListener('scroll', () => {
            clearTimeout(scrollEndHandlerId);
            scrollEndHandlerId = setTimeout(scrollEndHandler, 50);
        });
    }
}
