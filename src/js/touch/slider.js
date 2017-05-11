import debounce from '../helpers/debounce';
import animate from '../helpers/animate';
import closest from '../ponyfills/closest';
import getScale from '../utils/getScale';

import Core from '../core';

export default class TouchSlider extends Core {
    constructor(container, options) {
        super(container, options);

        this.pinch = false;
        this.touched = false;
        this.rotation = false;
        this.scrolling = false;

        // скролл или любое другое событие вызванное программным путем
        this.programAction = false;
    }

    setUserInterface() {
        this.classNames.mods.init = 'goos_init_touch';

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

        if (correctScroll !== this.shaft.scrollLeft) {
            this.programAction = true;
            //this.head.style.marginLeft = ((correctScroll - this.shaft.scrollLeft) * -1) + 'px';

            this.shaft.scrollLeft = correctScroll;
            //this.shaft.scrollLeft = correctScroll;
            //setTimeout(() => {this.programAction = false}, 200);

            // while browser doing rotation our animations is not working
            // that's why we immediately change scroll without animations
            // for browsers with scrollSnap change immediately as well
            /*if (support.scrollSnap || this.rotation === true) {
                this.shaft.scrollLeft = correctScroll;

                return;
            }

            this._animateToSlide(correctScroll);*/
        }
    }

    _addEventListeners(w, container, options, support) {
        this._scrollingHandler();
        this._rotationHandler(w, support);

        if (options.allowFullscreen) {
            this._doubleTapHandler();
            this._pinchHandler(container, support);
        }

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
        let tapedSlide;
        let originalCurrent;

        this.shaft.addEventListener('touchend', event => {
            if (tapedTwice === false) {
                tapedTwice = true;
                setTimeout(() => {tapedTwice = false}, 300);
                return;
            }

            event.preventDefault();

            if (tapedSlide) {
                tapedSlide = null;

                this.current = originalCurrent;
            } else {
                tapedSlide = closest.call(event.target, '.' + this.classNames.item);

                if (tapedSlide) {
                    originalCurrent = this.current;
                    // change current to taped slide
                    this.current = [].indexOf.call(this.items, tapedSlide);
                }
            }

            this.toggleFullscreen();
        });
    }

    _scrollingHandler() {
        const shaft = this.shaft;
        const scrollEndHandler = () => {
            this.scrolling = false;

            // только если нет касаний к экрану и это не программный скролл
            if (this.touched === false && this.programAction === false) {
                console.log('scrollEndHandler');
                // как только мы поменяем значение, сработает action
                this.current = Math.round(shaft.scrollLeft / this.slideWidth);
            }

            this.programAction = false;
        };

        shaft.addEventListener('scroll', () => {this.scrolling = true}, false);
        shaft.addEventListener('scroll', debounce(scrollEndHandler, 100), false);

        shaft.addEventListener('touchstart', event => {
            this.touched = true;
        });
        shaft.addEventListener('touchend', () => {
            this.touched = false;

            // скролл или таскание прекратились, палец убрали
            if (this.scrolling === false && this.pinch === false) {
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

    _pinchHandler(container, support) {
        const MAX_SCALE = 1.6; // значение после которого увеличение будет гаситься
        const MIN_SCALE = 0.8;
        const FACTOR = 8;

        let zoomedSlideIndex;
        let originalCurrent;
        let zoomedSlide;
        let pinchStartEvent;

        const onPinchStartHandler = event => {
            this.pinch = true;

            container.classList.add(this.classNames.mods.scaling);
        };

        const onScaleChangeHandler = (event, manualCalculatedScale) => {
            event.preventDefault();

            let scale = (manualCalculatedScale || event.scale);

            if (scale > MAX_SCALE) {
                scale = MAX_SCALE + Math.log(scale) / FACTOR;
            }

            if (scale < MIN_SCALE) {
                scale = MIN_SCALE + Math.log(scale) / Math.pow(FACTOR, 2);
            }

            this.shaft.style.transform = `scale(${scale.toFixed(3)})`;
        };

        const onPinchEndHandler = (event) => {
            this.toggleFullscreen(event.scale < MIN_SCALE);

            this.shaft.style.transform = '';

            container.classList.remove(this.classNames.mods.scaling);

            // prevent touch end handler
            setTimeout(() => {this.pinch = false}, 50);
        };

        // mobile safari
        if (support.gestureEvents === true) {
            this.block.addEventListener('gesturestart', onPinchStartHandler, false);
            this.block.addEventListener('gesturechange', onScaleChangeHandler, false);
            this.block.addEventListener('gestureend', onPinchEndHandler, false);
        } else {
            let manualCalculatedScale;

            this.shaft.addEventListener('touchstart', event => {
                if (event.touches.length !== 2) {return;}

                pinchStartEvent = event;

                onPinchStartHandler(event);
            }, false);

            this.shaft.addEventListener('touchmove', event => {
                if (!pinchStartEvent) {return;}

                const myEvent = {
                    preventDefault: event.preventDefault.bind(event),
                    scale: getScale(pinchStartEvent.touches, event.touches)
                };

                onScaleChangeHandler(myEvent);
            }, false);

            this.shaft.addEventListener('touchend', event => {
                if (!pinchStartEvent) {return;}

                onPinchEndHandler(event, manualCalculatedScale);

                pinchStartEvent = null;
            });
        }
    }
}
