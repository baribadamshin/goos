'use strict';

import getBrowserSupportFeatures from './utils/getBrowserSupportFeatures';
import getOptionsFromClassList from './utils/getOptionsFromClassList'

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
            size: options.size,
            slideBy: options.slideBy,
            enableArrows: options.enableArrows,
            enableDots: options.enableDots,
            allowFullscreen: options.allowFullscreen,
            responsive: options.responsive,
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
        return Math.ceil(this.items.length / this.options.slideBy);
    }

    /**
     * Called each time after `current` value was changed
     *
     * @abstract
     * @param {number} current
     * @param {Object} options
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
            init: 'goos_init',
            shaft: 'goos__shaft',
            arrows: {
                init: 'goos_nav_arrows',
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
            slideBy: (options && options.slideBy) || optionsFromClassNames.size,
            enableArrows: false,
            enableDots: false,
            allowFullscreen: true,
        };

        // опции которые мы пробрасываем из стилей
        let styleOptions = {};

        if (optionsFromClassNames.responsive) {
            let size = getComputedStyle(this.block, '::before').getPropertyValue('content').replace(/'/g, '');
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

        this.current = this._options.current;
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

    /**
     *
     * @param {Object} specific
     */
    setUserInterface(specific = {}) {
        this.block.classList.add(this.classNames.init);

        this.options.enableArrows && this.createArrows();
        this.options.enableDots && this.createDotsNavigation();

        this.state = Object.assign({fullscreen: false}, specific);

        this.addEventListeners(this.options, this.support);
    }

    /**
     *
     * @param {object} options
     * @param {object} support
     * @public
     */
    addEventListeners(options, support) {
        if (options.allowFullscreen && support.fullScreen.changeEventType) {
            this.block.addEventListener(support.fullScreen.changeEventType, () => {
                this.state.fullscreen = !!document[support.fullScreen.elementProperty];

                console.log(this.state);
            });
        }
    }

    createArrows() {
        const arrowPrev = document.createElement('button');

        arrowPrev.innerHTML = '<i/>';

        const arrowNext = arrowPrev.cloneNode(true);

        arrowNext.className = arrowPrev.className = this.classNames.arrows.base;

        arrowPrev.classList.add(this.classNames.arrows.prev);
        arrowNext.classList.add(this.classNames.arrows.next);

        arrowPrev.addEventListener('click', this.prev.bind(this));
        arrowNext.addEventListener('click', this.next.bind(this));

        this.arrowNext = this.block.insertBefore(arrowNext, this.block.firstChild);
        this.arrowPrev = this.block.insertBefore(arrowPrev, this.block.firstChild);

        this.setArrowsActivity();

        this.block.classList.add(this.classNames.arrows.init);
    }

    createDotsNavigation() {
        const dotsContainer = document.createElement('ul');

        dotsContainer.classList.add(this.classNames.dots.base);

        dotsContainer.addEventListener('click', e => {
            const target = e.target;

            if (target.classList.contains(this.classNames.dots.item)) {
                const dotIndex = Array.prototype.indexOf.call(dotsContainer.children, target);

                this.current = Math.round(this.items.length / this.screens * dotIndex);
            }
        });

        this.dotsContainer = this.block.appendChild(dotsContainer);

        this.setDots();

        this.block.classList.add(this.classNames.dots.init);
    }

    /**
     * Рисует нужное количество точек в dotsContainer
     */
    setDots() {
        this.dotsContainer.innerHTML = new Array(this.screens + 1).join(`<li class="${this.classNames.dots.item}" />`);

        this.setActiveDot();
    }

    // подсвечивает нужную точку
    setActiveDot() {
        if (!this.dotsContainer) {
            return;
        }

        const activeDotClassName = this.classNames.dots.active;
        const dotIndex = Math.round(this.current / this.options.slideBy);
        const currentActiveDot = this.dotsContainer.getElementsByClassName(activeDotClassName)[0];

        currentActiveDot && currentActiveDot.classList.remove(activeDotClassName);

        this.dotsContainer.children[dotIndex].classList.add(activeDotClassName);
    }

    // меняет активное состояние стрелок
    setArrowsActivity() {
        if (!this.arrowPrev || !this.arrowNext) {
            return;
        }

        const arrowDisabledAttribute = 'disabled';

        if (!this._edge) {
            this.arrowPrev.removeAttribute(arrowDisabledAttribute);
            this.arrowNext.removeAttribute(arrowDisabledAttribute);

            return true;
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
        this.options.enableArrows && this.setArrowsActivity();
        this.options.enableDots && this.setActiveDot();
    }
}

/**
 * @typedef {Object} GoosOptions
 * @property {number} size
 * @property {number} slideBy
 * @property {boolean} enableArrows
 * @property {boolean} responsive
 */
