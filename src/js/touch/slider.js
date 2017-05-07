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

        super.setUserInterface();
    }

    setOptions(options) {
        this._setSlideWidth();

        super.setOptions(options);
    }

    /**
     * @public
     * @param {number} current
     * @param {GoosOptions} options
     * @param {Object} support
     * @param {HTMLCollection} items
     */
    action(current, options, support, items) {
        const correctScroll = Math.round(current * this.slideWidth);

        if (support.scrollSnap === false && correctScroll !== this.shaft.scrollLeft) {
            // while browser doing rotation our animations is not working
            // that's why we immediately change scroll without animations
            if (this.rotation === true) {
                this.shaft.scrollLeft = correctScroll;

                return;
            }

            this._animateToSlide(correctScroll);
        }
    }

    _addEventListeners(w, container, options, support) {
        this._rotationHandler(w, support);
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

        this.shaft.addEventListener('touchend', event => {
            if (tapedTwice === false) {
                tapedTwice = true;
                setTimeout(() => {tapedTwice = false}, 300);
                return;
            }

            event.preventDefault();

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
        shaft.addEventListener('scroll', debounce(scrollEndHandler, 50));

        shaft.addEventListener('touchstart', () => {this.touched = true});
        shaft.addEventListener('touchend', () => {
            this.touched = false;

            // скролл или таскание прекратились, палец убрали
            if (this.scrolling === false) {
                scrollEndHandler();
            }
        });
    }

    _rotationHandler(w, support) {
        // more flexible way to detect change of orientation
        if (support.matchMedia) {
            const matchPortrait = w.matchMedia('(orientation: portrait)');
            const matchLandscape = w.matchMedia('(orientation: landscape)');

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
        } else {
            w.addEventListener('orientationchange', this.setOptions.bind(this));
        }
    }

    _pinchHandler() {}
}
