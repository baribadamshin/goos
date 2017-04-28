'use strict';

import getBrowserSupportFeatures from './utils/getBrowserSupportFeatures';
import getOptionsFromClassList from './utils/getOptionsFromClassList'

import fullScreenApi from './helpers/fullscreen';
import createArrow from './helpers/createArrow';
import createDotsContainer from './helpers/createDotsContainer';

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
            animateSpeed: options.animateSpeed,
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
        return Math.ceil(this.items.length / this.options.slideBy);
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
            init: 'goos_init',
            shaft: 'goos__shaft',
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
            animateSpeed: 250,
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

        this.options.enableDots && this.createDotsNavigation();

        this.state = Object.assign({fullscreen: false}, specific);

        this.addEventListeners(window, this.options, this.support);
    }

    /**
     *
     * @param {Window} w
     * @param {object} options
     * @param {object} support
     * @public
     */
    addEventListeners(w, options, support) {
        this.block.addEventListener('click', event => {
            const target = event.target;
            const classNames = this.classNames;

            this.fullscreen();

            // клик по точке в навигации
            if (target.classList.contains(classNames.dots.item)) {
                const dotIndex = Array.prototype.indexOf.call(this.dotsContainer.children, target);

                this.current = Math.round(this.items.length / this.screens * dotIndex);
            }
        });

        if (options.allowFullscreen) {
            this.block.addEventListener(fullScreenApi.changeEventType, () => {
                this.setOptions();
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
        this.dotsContainer = createDotsContainer(this.block, this.classNames.dots.base);

        this.setDots();

        this.block.classList.add(this.classNames.dots.init);
    }

    /**
     * Рисует, если это необходимо, нужное количество точек в dotsContainer
     * и отмечает точку соответствующую current
     */
    setDots() {
        const container = this.dotsContainer;
        const dotsCount = this.screens + 1;

        if (container && container.children.length !== dotsCount) {
            container.innerHTML = new Array(dotsCount).join(`<li class="${this.classNames.dots.item}" />`);
        }

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
        this.options.enableDots && this.setDots();
    }

    // в настольном сафари нельзя просто взять и запустить фулскрин
    // он должнен быть запущен в ответ на действие пользователя
    fullscreen() {
        if (this.options.allowFullscreen === true) {
            this.state.fullscreen = true;

            fullScreenApi.request(this.block);
        }
    }

    exitFromFullscreen() {
        this.state.fullscreen = false;

        fullScreenApi.exit();
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
