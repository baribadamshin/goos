import Core from '../core';

export default class TouchSlider extends Core {
    setUserInterface() {
        this._classNames.init = 'goos_init_touch';

        // состояния взаимодействия пользователя с каруселькой
        this._state = {
            touch: false,
            rotation: false,
            scroll: false,
        };

        super.setUserInterface();
    }

    action() {
        // если браузер не умеет умную прокрутку, нам нужно самим допнуть элемент куда надо
        if (this._support.scrollSnap === false) {
            const correctScroll = this.current * this._options.unitWidth;

            if (correctScroll !== this.shaft.scrollLeft) {
                // если был поворот экрана, анимации нам не нужны
                if (this._state.rotation === true) {
                    this.shaft.scrollLeft = correctScroll;
                    return;
                }

                $(this.shaft).animate({scrollLeft: correctScroll}, 700);
            }
        }
    }

    setOptions(options) {
        super.setOptions({
            unitWidth: parseFloat(getComputedStyle(this.items[0]).getPropertyValue('width'))
        });
    }

    bindObservers() {
        // следим за изменением ориентации экрана
        if (this._support.matchMedia) {
            const matchPortrait = matchMedia('(orientation: portrait)');
            const matchLandscape = matchMedia('(orientation: landscape)');

            // реагирует на поворот экрана
            const orientationChangeHandler = query => {
                if (query.matches === true) {
                    // запомним, что произошел поворот
                    // в скриптах отключим анимации, они во время поворота все равно не работают
                    this._state.rotation = true;

                    // прыжок на нужную позицию без анимации
                    this.setOptions();

                    this._state.rotation = false;
                }
            };

            matchPortrait.addListener(orientationChangeHandler);
            matchLandscape.addListener(orientationChangeHandler);
        }

        // следим за скроллом
        // после скрола нам нужно поменять значение текущего активного элемента
        const scrollEndHandler = () => {
            this._state.scroll = false;

            // только если нет касаний к экрану
            if (this._state.touch === false) {
                // как только мы поменяем значение, сработает action
                this.current = Math.round(this.shaft.scrollLeft / this._options.unitWidth);
            }
        };

        let scrollEndHandlerId;
        this.shaft.addEventListener('scroll', () => {
            this._state.scroll = true;

            clearTimeout(scrollEndHandlerId);
            scrollEndHandlerId = setTimeout(scrollEndHandler, 50);
        });

        // следим за прикосновением к экрану
        this.shaft.addEventListener('touchstart', () => {this._state.touch = true});
        this.shaft.addEventListener('touchend', () => {
            this._state.touch = false;

            // для тех случаев, когда браузер не умеет умную прокрутку
            // скролл или таскание прекратились, палец убрали, нужно скорректировать положение слайда
            if (this._support.scrollSnap === false && this._state.scroll === false) {
                this.shaft.scrollLeft++;
            }
        });
    }
}
