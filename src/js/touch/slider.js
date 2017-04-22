import Core from '../core';

export default class TouchSlider extends Core {
    setUserInterface() {
        this.block.classList.add('goos_init_touch');

        // состояния взаимодействия пользователя с каруселькой
        this.state = {
            touch: false,
            rotation: false,
            scroll: false,
        };

        super.setUserInterface();
        this.addEventListeners();
    }

    setOptions() {
        super.setOptions();

        this.headWidth = parseFloat(getComputedStyle(this.head).getPropertyValue('width'));
    }

    action(current, options, support) {
        // если браузер не умеет умную прокрутку, нам нужно самим дотолкать элемент
        if (this.state && support.scrollSnap === false) {
            const correctScroll = current * this.headWidth;

            if (correctScroll !== this.shaft.scrollLeft) {
                // если был поворот экрана, анимации нам не нужны
                if (this.state.rotation === true) {
                    this.shaft.scrollLeft = correctScroll;
                    return;
                }

                $(this.shaft).animate({scrollLeft: correctScroll});
            }
        }
    }

    addEventListeners() {
        // следим за изменением ориентации экрана
        if (this.support.matchMedia) {
            const matchPortrait = matchMedia('(orientation: portrait)');
            const matchLandscape = matchMedia('(orientation: landscape)');

            // реагирует на поворот экрана
            const orientationChangeHandler = query => {
                if (query.matches === true) {
                    // запомним, что произошел поворот
                    // в скриптах отключим анимации, они во время поворота все равно не работают
                    this.state.rotation = true;

                    // прыжок на нужную позицию без анимации
                    this.setOptions();

                    this.state.rotation = false;
                }
            };

            matchPortrait.addListener(orientationChangeHandler);
            matchLandscape.addListener(orientationChangeHandler);
        }

        // следим за скроллом
        // после скрола нам нужно поменять значение текущего активного элемента
        const scrollEndHandler = () => {
            this.state.scroll = false;

            // только если нет касаний к экрану
            if (this.state.touch === false) {
                // как только мы поменяем значение, сработает action
                this.current = Math.round(this.shaft.scrollLeft / this.headWidth);
            }
        };

        this.shaft.addEventListener('scroll', () => this.state.scroll = true);
        this.shaft.addEventListener('scroll', this.debounce(scrollEndHandler, 100));

        // следим за прикосновением к экрану
        this.shaft.addEventListener('touchstart', () => {this.state.touch = true});
        this.shaft.addEventListener('touchend', () => {
            this.state.touch = false;

            // для тех случаев, когда браузер не умеет умную прокрутку
            // скролл или таскание прекратились, палец убрали, нужно скорректировать положение слайда
            if (this.support.scrollSnap === false && this.state.scroll === false) {
                scrollEndHandler();
            }
        });
    }
}
