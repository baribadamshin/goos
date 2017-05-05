import debounce from '../helpers/debounce';
import animate from '../helpers/animate';

import Core from '../core';

export default class TouchSlider extends Core {
    constructor(container, options) {
        super(container, options);

        this.touched = false;
        this.rotation = false;
        this.scrolling = false;
    }

    setUserInterface() {
        this.classNames.init = 'goos_init_touch';

        // передадим состояния взаимодействия с каруселькой специфичные для тача
        super.setUserInterface();
    }

    setOptions(options) {
        this._setSlideWidth();

        super.setOptions(options);
    }

    action(current, options, support) {
        const correctScroll = Math.round(current * this.slideWidth);

        if (correctScroll !== this.shaft.scrollLeft) {
            // если был поворот экрана, анимации нам не нужны
            if (this.rotation === true) {
                this.shaft.scrollLeft = correctScroll;

                return;
            }

            this._animateToSlide(correctScroll);
        }
    }

    _addEventListeners(w, options, support) {
        this._rotationHandler(support);
        this._scrollingHandler();
        this._doubleTapHandler();
        this._pinchHandler();

        super._addEventListeners.apply(this, arguments);
    }

    _setSlideWidth() {
        this.slideWidth = parseFloat(getComputedStyle(this.head).getPropertyValue('width'));
    }

    _animateToSlide(slidePosition) {
        const startPosition = this.shaft.scrollLeft;
        const delta = startPosition - slidePosition;

        animate(
            progress => {this.shaft.scrollLeft = startPosition - delta * progress},
            this.options.animateDuration,
        );
    }

    _doubleTapHandler() {
        let tapedTwice = false;

        // браузеры не разрешают переходить в фуллскрин с другого события
        // поэтому двойной тап будем определять по клику
        this.shaft.addEventListener('click', () => {
            if (tapedTwice === false) {
                tapedTwice = true;
                setTimeout(() => {tapedTwice = false}, 300);
                return;
            }

            // фулскрин по двойному тапу
            this.fullscreen();
        });
    }

    _scrollingHandler() {
        const shaft = this.shaft;
        const scrollEndHandler = () => {
            this.scrolling = false;

            // только если нет касаний к экрану
            if (this.touched === false) {
                // как только мы поменяем значение, сработает action
                this.current = Math.round(shaft.scrollLeft / this.slideWidth);
            }
        };

        shaft.addEventListener('scroll', () => {this.scrolling = true});
        shaft.addEventListener('scroll', debounce(scrollEndHandler, 100));

        shaft.addEventListener('touchstart', () => {this.touched = true});
        shaft.addEventListener('touchend', () => {
            this.touched = false;

            // скролл или таскание прекратились, палец убрали
            if (this.scrolling === false) {
                scrollEndHandler();
            }
        });
    }

    _rotationHandler(support) {
        // следим за изменением ориентации экрана
        if (support.matchMedia) {
            const matchPortrait = matchMedia('(orientation: portrait)');
            const matchLandscape = matchMedia('(orientation: landscape)');

            // реагирует на поворот экрана
            const orientationChangeHandler = query => {
                if (query.matches === true) {
                    // запомним, что произошел поворот
                    // потом мы сможем свдинуть слайды без анимации зная, что этот сдвиг необходим из-за поворота
                    // во время поворота анимации все равно не работают
                    this.rotation = true;

                    // карусель разберется, что нужно сделать
                    this.setOptions();

                    this.rotation = false;
                }
            };

            matchPortrait.addListener(orientationChangeHandler);
            matchLandscape.addListener(orientationChangeHandler);
        }
    }

    _pinchHandler() {
        /*this.shaft.addEventListener('gesturechange', function(e) {
            console.log(e);

            if (e.scale < 1.0) {
                // User moved fingers closer together
            } else if (e.scale > 1.0) {
                console.log(11111);
                // User moved fingers further apart
            }
        }, false);*/
    }
}
