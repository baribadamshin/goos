import debounce from '../helpers/debounce';
import animate from '../helpers/animate';
import closest from '../ponyfills/closest';
import getScale from '../utils/getScale';
import cinema from '../components/cinema';

import Core from '../core';

export default class TouchSlider extends Core {
    setUserInterface() {
        // специфичные тачовые классы
        this.classNames.mods = Object.assign(this.classNames.mods, {
            init: 'goos_init_touch',
            scaling: 'goos_scaling',
            touched: 'goos_touched'
        });

        super.setUserInterface();
    }

    setOptions(options) {
        this.slideWidth = this.head.getBoundingClientRect().width;

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
        if (this.preventCorrection === true) {
            return;
        }

        const correctScroll = Math.round(current * this.slideWidth);

        if (correctScroll === this.shaft.scrollLeft && this.unstableState) {
            this.unstableState = false;
            return;
        }

        if (correctScroll !== this.shaft.scrollLeft) {
            if (this.unstableState) {
                this.shaft.scrollLeft = correctScroll;

                return;
            }

            this._animateToSlide(correctScroll, options.animateDuration);
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

    _animateToSlide(slidePosition, duration) {
        const startPosition = this.shaft.scrollLeft;
        const delta = startPosition - slidePosition;

        animate(
            progress => {this.shaft.scrollLeft = startPosition - delta * progress},
            duration
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

            let tapedSlide = closest.call(event.target, this.classNames.item);

            if (!tapedSlide) {
                return;
            }

            this.unstableState = true;

            cinema.request(this.block, tapedSlide, () => {
                // перед тем как показать карусель
                this.current = Array.prototype.slice.call(this.items).indexOf(tapedSlide);
            });
        });
    }

    _scrollingHandler() {
        const shaft = this.shaft;
        const scrollEndHandler = () => {
            if (this.preventCorrection === false) {
                this.current = Math.round(shaft.scrollLeft / this.slideWidth);
            }

            this.preventCorrection = false;
            this.unstableState = false;
        };

        shaft.addEventListener('scroll', debounce(scrollEndHandler, 350), false);
    }

    _rotationHandler(w, support) {
        w.addEventListener('resize', () => {
            // если это не экстренный случай, такие браузеры сами корректируют свое содержимое
            if (support.scrollSnap && this.unstableState === true) {
                this.preventCorrection = true;
            }

            this.setOptions();
        });
    }

    _pinchHandler(container, support) {
        const MAX_SCALE = 1.2; // значение после которого увеличение будет гаситься
        const MIN_SCALE = 0.8;
        const FACTOR = 20;

        const onPinchStartHandler = () => {
            container.classList.add(this.classNames.mods.scaling);
            container.classList.add(this.classNames.mods.touched);
        };

        const onScaleChangeHandler = event => {
            event.preventDefault();

            let scale = event.scale;

            if (scale > MAX_SCALE && cinema.state.enabled === false) {
                scale = MAX_SCALE + Math.log(scale) / FACTOR;
            }

            if (scale < MIN_SCALE) {
                scale = MIN_SCALE + Math.log(scale) / Math.pow(FACTOR, 2);
            }

            this.shaft.style.transform = `scale(${scale.toFixed(3)})`;
        };

        const onPinchEndHandler = event => {
            if (event.scale > MIN_SCALE && cinema.state.enabled === false) {
                cinema.request(this.block, this.items[this.current]);
            }

            this.shaft.style.transform = '';

            container.classList.remove(this.classNames.mods.touched);
            container.classList.remove(this.classNames.mods.scaling);
        };

        // native gesture events
        if (support.gestureEvents === true) {
            this.block.addEventListener('gesturestart', onPinchStartHandler, false);
            this.block.addEventListener('gesturechange', onScaleChangeHandler, false);
            this.block.addEventListener('gestureend', onPinchEndHandler, false);
        } else {
            let manualCalculatedScale;
            let pinchStartEvent;

            this.block.addEventListener('touchstart', event => {
                if (event.touches.length !== 2) {
                    return;
                }

                pinchStartEvent = event;

                onPinchStartHandler(event);
            }, false);

            this.block.addEventListener('touchmove', event => {
                if (!pinchStartEvent) {
                    return;
                }

                const myEvent = {
                    preventDefault: event.preventDefault.bind(event),
                    scale: getScale(pinchStartEvent.touches, event.touches)
                };

                onScaleChangeHandler(myEvent);
            }, false);

            this.block.addEventListener('touchend', event => {
                if (!pinchStartEvent) {
                    return;
                }

                onPinchEndHandler(event, manualCalculatedScale);

                pinchStartEvent = null;
            });
        }
    }
}
