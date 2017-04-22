export default class Core {
    constructor(container, options) {
        if (container instanceof HTMLElement === false) {
            console.warn('You should pass DOM element as first argument');
            return;
        }

        this.support = this.constructor.getBrowserSupportFeatures();

        this.setDomElements(container);
        this.setOptions(options);
        this.setUserInterface();
    }

    /**
     * Returns modifiers from classList property
     * @param {DOMTokenList} classList
     * @returns {OptionsFromBlockClassList}
     */
    static getOptionsFromClassList(classList) {
        const responsive = classList.contains('goos_responsive');
        const size = Number((classList.toString().match(/goos_size_(\d+)/) || [])[1] || 1);

        return {
            responsive,
            size
        };
    }

    /**
     * Checks browser features which Goos use
     * @returns {BrowserSupportFeatures}
     */
    static getBrowserSupportFeatures() {
        const mutationObserver = 'MutationObserver' in window;
        const matchMedia = 'matchMedia' in window;

        let scrollSnapProperty = 'scroll-snap-type: mandatory';

        scrollSnapProperty = [
            `(-webkit-${scrollSnapProperty})`,
            `(-ms-${scrollSnapProperty})`,
            `(${scrollSnapProperty})`,
        ].join('or');

        const scrollSnap = !!(window.CSS && CSS.supports(scrollSnapProperty));

        return {
            matchMedia,
            mutationObserver,
            scrollSnap
        }
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
     * Returns Goos public options
     *
     * @return {GoosOptions}
     */
    get options() {
        const options = this._options;

        return {
            size: options.size,
            slideBy: options.slideBy,
            enableArrows: options.enableArrows,
            enableDots: options.enableDots,
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
                base: 'goos__arrow',
                prev: 'goos__arrow_prev',
                next: 'goos__arrow_next',
                off: 'goos__arrow_disabled'
            },
            dots: {
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
        const optionsFromClassNames = this.constructor.getOptionsFromClassList(this.block.classList);
        const defaultOptions = {
            current: 0,
            size: optionsFromClassNames.size || 1,
            slideBy: (options && options.slideBy) || optionsFromClassNames.size,
            enableArrows: false,
            enableDots: false,
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

    setUserInterface() {
        this.block.classList.add(this.classNames.init);

        this._options.enableDots && this.createDotsNavigation();
    }

    createArrows() {
        let arrowPrev = document.createElement('button');

        arrowPrev.innerHTML = '<i/>';

        let arrowNext = arrowPrev.cloneNode(true);

        arrowNext.className = arrowPrev.className = this.classNames.arrows.base;

        arrowPrev.classList.add(this.classNames.arrows.prev);
        arrowNext.classList.add(this.classNames.arrows.next);

        arrowPrev.addEventListener('click', () => this.prev());
        arrowNext.addEventListener('click', () => this.next());

        this.arrowNext = this.block.insertBefore(arrowNext, this.block.firstChild);
        this.arrowPrev = this.block.insertBefore(arrowPrev, this.block.firstChild);

        this.setArrowsActivity();
    }

    createDotsNavigation() {
        let dotsContainer = document.createElement('ul');

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
        this.setActiveDot();
    }

    /**
     * Рисует нужное количество точек в dotsContainer
     */
    setDots() {
        this.dotsContainer.innerHTML = new Array(this.screens + 1).join(`<li class="${this.classNames.dots.item}" />`)
    }

    // подсвечивает нужную точку
    setActiveDot() {
        if (this.dotsContainer) {
            const activeDotClassName = this.classNames.dots.active;
            const dotIndex = Math.round(this.current / this.options.slideBy);
            const lastActiveDot = this.dotsContainer.querySelector('.' + activeDotClassName);

            lastActiveDot && lastActiveDot.classList.remove(activeDotClassName);

            this.dotsContainer.children[dotIndex].classList.add(activeDotClassName);
        }
    }

    // меняет активное состояние стрелок
    setArrowsActivity() {
        if (!this.arrowPrev || !this.arrowNext) {
            return;
        }

        const arrowDisabledClass = this.classNames.arrows.off;
        const arrowDisabledAttribute = 'disabled';

        if (!this._edge) {
            this.arrowPrev.removeAttribute(arrowDisabledAttribute);
            this.arrowPrev.classList.remove(arrowDisabledClass);

            this.arrowNext.removeAttribute(arrowDisabledAttribute);
            this.arrowNext.classList.remove(arrowDisabledClass);

            return true;
        }

        if (this._edge === 'start') {
            this.arrowPrev.setAttribute(arrowDisabledAttribute, true);
            this.arrowPrev.classList.add(arrowDisabledClass);

            this.arrowNext.removeAttribute(arrowDisabledAttribute);
            this.arrowNext.classList.remove(arrowDisabledClass);
        }

        if (this._edge === 'end') {
            this.arrowPrev.removeAttribute(arrowDisabledAttribute);
            this.arrowPrev.classList.remove(arrowDisabledClass);

            this.arrowNext.setAttribute(arrowDisabledAttribute, true);
            this.arrowNext.classList.add(arrowDisabledClass);
        }
    }

    setNavigationState() {
        this.options.enableDots && this.setActiveDot();
    }

    /**
     * Creates a debounced function that delays invoking callback until after wait milliseconds
     *
     * @public
     * @param {Function} callback
     * @param {number} wait
     * @returns {function()}
     */
    debounce(callback, wait) {
        let timeoutId;

        return function () {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(callback, wait);
        };
    };
}

/**
 * @typedef {Object} OptionsFromBlockClassList
 * @property {number} size
 * @property {boolean} responsive
 */

/**
 * @typedef {Object} BrowserSupportFeatures
 * @property {boolean} mutationObserver
 * @property {boolean} matchMedia
 * @property {boolean} scrollSnap
 */

/**
 * @typedef {Object} GoosOptions
 * @property {number} size
 * @property {number} slideBy
 * @property {boolean} enableArrows
 * @property {boolean} responsive
 */
