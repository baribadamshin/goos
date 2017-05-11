'use strict';

import getBrowserSupportFeatures from './utils/getBrowserSupportFeatures';
import getOptionsFromClassList from './utils/getOptionsFromClassList'

import fullScreenApi from './ponyfills/fullscreen';

import createArrow from './helpers/createArrow';

export default class Core {
    constructor(container, options) {
        if (container instanceof HTMLElement === false) {
            console.warn('You should pass DOM element as first argument');
            return;
        }

        this.support = getBrowserSupportFeatures(window, document);

        this.setDomElements(container);
        this.setOptions(options);
        this.setUserInterface();
    }

    /**
     * Setter for 'current' property
     * If set a new value - starts the action
     * @param index
     */
    set current(index) {
        this._setCurrentStage(index);

        this.setNavigationState();

        this.action(this.current, this.options, this.support, this.items);
    }

    get current() {
        return this._options.current;
    }

    /**
     * @return {GoosOptions}
     */
    get options() {
        const options = this._options;

        return {
            animateDuration: options.animateDuration,
            allowFullscreen: options.allowFullscreen,
            enableArrows: options.enableArrows,
            enableDots: options.enableDots,
            responsive: options.responsive,
            size: options.size,
            slideBy: options.slideBy,
        }
    }

    /**
     * Возвращает количество экранов
     * Используется для определения количества точек в навигации
     * например, если карусель показывает по 3 элемента, а всего их 30 — точек будет 10
     *
     * @return {number}
     */
    get screens() {
        return Math.floor(this.items.length / this._options.slideBy);
    }

    /**
     * Called each time after `current` value was changed
     *
     * @abstract
     * @param {number} current
     * @param {GoosOptions} options
     * @param {Object} support
     * @param {HTMLCollection} items
     */
    action(current, options, support, items) {}

    prev() {
        this.current -= this._options.slideBy;
    }

    next() {
        this.current += this._options.slideBy;
    }

    /**
     * Check current DOM Element and set it up to private property
     *
     * @public
     * @param {HtmlElement} container
     */
    setDomElements(container) {
        this.classNames = {
            shaft: 'goos__shaft',
            mods: {
                init: 'goos_init',
                scaling: 'goos_scaling',
            },
            item: 'goos__item',
            arrows: {
                base: 'goos__arrow',
                prev: 'goos__arrow_prev',
                next: 'goos__arrow_next'
            },
            dots: {
                init: 'goos_nav_dots',
                base: 'goos__dots',
                item: 'goos__dot',
                active: 'goos__dot_active'
            }
        };

        this.block = container;
        this.shaft = this.block.getElementsByClassName(this.classNames.shaft)[0];
        this.items = this.shaft.children;
        this.head = this.items[0];

        this.dotsContainer = null;
    }

    /**
     * Set default options and extend it with new options
     *
     * @public
     * @param {Object} [options]
     */
    setOptions(options = {}) {
        const optionsFromClassNames = getOptionsFromClassList(this.block.classList);
        const defaultOptions = {
            current: 0,
            size: optionsFromClassNames.size || 1,
            slideBy: options.slideBy || optionsFromClassNames.size,
            enableArrows: false,
            enableDots: false,
            allowFullscreen: true,
            animateDuration: 250,
        };

        const allowFullscreen = options.allowFullscreen || (this._options && this._options.allowFullscreen);

        // опции которые мы пробрасываем из стилей
        let styleOptions = {};

        if (optionsFromClassNames.responsive || allowFullscreen) {
            let size = getComputedStyle(this.block, ':before').getPropertyValue('content').replace(/'/g, '');
            // size !== 'none' for FF
            size = size.length && size !== 'none' && parseInt(JSON.parse(size));

            if (size) {
                styleOptions.size = size;
                styleOptions.slideBy = size;
            } else {
                styleOptions.slideBy = options.slideBy || optionsFromClassNames.size;
            }
        }

        // добиваем дефолтные опции модификаторами и внешними параметрами
        this._options = Object.assign(
            {},
            defaultOptions,
            this._options,
            optionsFromClassNames,
            options,
            styleOptions
        );

        if (this._options.current !== this.current) {
            this.current = this._options.current;
        }
    }

    /**
     * Устанавливает правильное значение для свойства current и определяет
     * пограниченые состояния
     * @param value
     * @private
     */
    _setCurrentStage(value) {
        value = Number(value);

        if (value <= 0) {
            this._options.current = 0;
            this._edge = 'start';

            return;
        }

        // попросили больше элементов чем у нас есть
        let lastStep = this.items.length - this._options.size;

        if (value >= lastStep) {
            this._options.current = lastStep;
            this._edge = 'end';

            return;
        }

        this._options.current = value;
        this._edge = false;
    }

    setUserInterface() {
        this.block.classList.add(this.classNames.mods.init);

        this._options.enableDots && this.createDotsNavigation();

        this._addEventListeners(window, this.block, this.options, this.support);
    }

    /**
     * @param {Window} w
     * @param {object} options
     * @param {object} support
     * @param {HTMLElement} container
     * @protected
     */
    _addEventListeners(w, container, options, support) {
        container.addEventListener('click', event => {
            const target = event.target;
            const classNames = this.classNames;

            // клик по точке в навигации
            if (target.classList.contains(classNames.dots.item)) {
                const dotIndex = Array.prototype.indexOf.call(this.dotsContainer.children, target);
                const screenIndex = Math.round(this.items.length / this.screens * dotIndex);

                if (this.current !== screenIndex) {
                    this.current = screenIndex;
                }
            }
        });

        if (options.allowFullscreen) {
            container.addEventListener(fullScreenApi.changeEventType, () => {
                this.setOptions();
                this.setNavigationState();
            });
        }
    }

    createArrows() {
        const arrowBaseClass = this.classNames.arrows.base;
        const prevArrowClassName = `${arrowBaseClass} ${this.classNames.arrows.prev}`;
        const nextArrowClassName = `${arrowBaseClass} ${this.classNames.arrows.next}`;

        this.arrowNext = createArrow(this.block, nextArrowClassName);
        this.arrowPrev = createArrow(this.block, prevArrowClassName);

        this.setArrowsActivity();
    }

    createDotsNavigation() {
        const dotsContainer = document.createElement('ul');

        dotsContainer.className = this.classNames.dots.base;

        this.dotsContainer = this.block.appendChild(dotsContainer);

        this.setDots();

        this.block.classList.add(this.classNames.dots.init);
    }

    // Draws dots navigation and call setActiveDot method
    setDots() {
        const container = this.dotsContainer;
        const dotsCount = this.screens;

        if (container && container.children.length !== dotsCount) {
            container.innerHTML = new Array(dotsCount + 1).join(`<li class="${this.classNames.dots.item}"></li>`);
        }

        this.setActiveDot();
    }

    // Calculates which dot should be selected and marks one
    setActiveDot() {
        const container = this.dotsContainer;
        const activeDotClassName = this.classNames.dots.active;
        const dotIndex = Math.round(this.current / this._options.slideBy);

        const currentActiveDot = container.getElementsByClassName(activeDotClassName)[0];

        currentActiveDot && currentActiveDot.classList.remove(activeDotClassName);
        container.children[dotIndex].classList.add(activeDotClassName);
    }

    setArrowsActivity() {
        if (!this.arrowPrev || !this.arrowNext) {
            return;
        }

        const arrowDisabledAttribute = 'disabled';

        if (!this._edge) {
            this.arrowPrev.removeAttribute(arrowDisabledAttribute);
            this.arrowNext.removeAttribute(arrowDisabledAttribute);

            return;
        }

        if (this._edge === 'start') {
            this.arrowPrev.setAttribute(arrowDisabledAttribute, true);

            this.arrowNext.removeAttribute(arrowDisabledAttribute);
        }

        if (this._edge === 'end') {
            this.arrowPrev.removeAttribute(arrowDisabledAttribute);

            this.arrowNext.setAttribute(arrowDisabledAttribute, true);
        }
    }

    setNavigationState() {
        this._options.enableArrows && this.setArrowsActivity();
        this._options.enableDots && this.dotsContainer && this.setDots();
    }

    /**
     * Toggle fullscreen mode
     * (important) you can't call fullscreen mode as method on instance.
     * its always should be callback for user action like click
     *
     * @param {boolean} exit - immediately exit from fullscreen mode
     */
    toggleFullscreen(exit = false) {
        if (this._options.allowFullscreen === false) {
            return;
        }

        if (fullScreenApi.isFullscreenOn()) {
            fullScreenApi.exit();
        } else if (exit === false) {
            fullScreenApi.request(this.block);
        }
    }
}

/**
 * @typedef {Object} GoosOptions
 * @property {number} animateSpeed
 * @property {boolean} allowFullscreen
 * @property {boolean} enableArrows
 * @property {boolean} enableDots
 * @property {boolean} responsive
 * @property {number} size
 * @property {number} slideBy
 */
