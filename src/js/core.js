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
     * @typedef {Object} OptionsFromBlockClass
     * @property {number} size
     * @property {boolean} responsive
     */

    /**
     * Get options from HtmlElement className property
     * @param {HtmlElement} block
     * @returns {OptionsFromBlockClass}
     */
    static getOptionsFromBlockClass(block) {
        const responsive = block.classList.contains('goos_responsive');
        const size = Number((block.className.match(/goos_size_(\d+)/) || [])[1] || 1);

        return {
            responsive,
            size
        };
    }

    /**
     * @typedef {Object} BrowserSupportFeatures
     * @property {boolean} mutationObserver
     * @property {boolean} matchMedia
     * @property {boolean} scrollSnap
     */

    /**
     * Checks browser features which Goos use
     * @returns {BrowserSupportFeatures}
     */
    static getBrowserSupportFeatures() {
        const mutationObserver = 'MutationObserver' in window;
        const matchMedia = 'matchMedia' in window;

        // выясним умеет ли браузер умную прокрутку
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
     * @param value
     */
    set current(value) {
        this._setCurrentStage(value);
        this.action(this.current, this.options);
    }

    get current() {
        return this._options.current;
    }

    /**
     * @typedef {Object} GoosOptions
     * @property {number} size
     * @property {number} slideBy
     * @property {boolean} enableArrows
     * @property {boolean} responsive
     */
    get options() {
        const options = this._options;

        return {
            size: options.size,
            slideBy: options.slideBy,
            enableArrows: options.enableArrows,
            responsive: options.responsive,
        }
    }

    /**
     * Вызывается всякий раз при изменении значения свойства current
     *
     * @abstract
     * @param {number} current
     * @param {Object} options
     */
    action(current, options) {}

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
     * @param {Object} [options]
     * @public
     */
    setOptions(options = {}) {
        const defineOptions = this.constructor.getOptionsFromBlockClass(this.block);
        const defaultOptions = {
            current: 0,
            size: defineOptions.size || 1,
            slideBy: (options && options.slideBy) || defineOptions.size,
            enableArrows: false
        };

        // опции которые мы пробрасываем из стилей
        let styleOptions = {};

        if (defineOptions.responsive) {
            let size = getComputedStyle(this.block, '::before').getPropertyValue('content').replace(/'/g, '');
            // size !== 'none' for FF
            size = size.length && size !== 'none' && parseInt(JSON.parse(size));

            if (size) {
                styleOptions.size = size;
                styleOptions.slideBy = size;
            } else {
                styleOptions.slideBy = options.slideBy || defineOptions.size;
            }
        }

        // добиваем дефолтные опции модификаторами и внешними параметрами
        this._options = Object.assign(
            {},
            defaultOptions,
            this._options,
            defineOptions,
            options,
            styleOptions
        );

        this.current = this._options.current;
    }

    _setCurrentStage(value) {
        value = Number(value);

        if (value <= 0) {
            this._options.current = 0;
            this._edge = 'left';

            return;
        }

        // попросили больше элементов чем у нас есть
        let lastStep = this.items.length - this._options.size;

        if (value >= lastStep) {
            this._options.current = lastStep;
            this._edge = 'right';

            return;
        }

        this._options.current = value;
        this._edge = false;
    }

    setUserInterface() {
        this.block.classList.add(this.classNames.init)
    }

    createArrows() {
        let arrowPrev = document.createElement('button');
        let arrowNext = arrowPrev.cloneNode(false);

        arrowNext.className = arrowPrev.className = this.classNames.arrows.base;

        arrowPrev.classList.add(this.classNames.arrows.prev);
        arrowNext.classList.add(this.classNames.arrows.next);

        arrowPrev.addEventListener('click', () => this.prev());
        arrowNext.addEventListener('click', () => this.next());

        this.arrowNext = this.block.insertBefore(arrowNext, this.block.firstChild);
        this.arrowPrev = this.block.insertBefore(arrowPrev, this.block.firstChild);

        this.setArrowsActivity();
    }

    // включаем и выключаем стрелки
    setArrowsActivity() {
        if (!this.arrowPrev || !this.arrowNext) {
            return;
        }

        const arrowDisabledClass = this.classNames.arrows.off;

        this._edge === 'left' && this.arrowPrev.classList.add(arrowDisabledClass);
        this._edge === 'right' && this.arrowNext.classList.add(arrowDisabledClass);

        if (!this._edge) {
            this.arrowPrev.classList.remove(arrowDisabledClass);
            this.arrowNext.classList.remove(arrowDisabledClass);
        }
    }

    /**
     *
     * @param {Function} callback
     * @param {number} wait
     * @returns {function()}
     */
    debounce(callback, wait) {
        let timeoutId;

        return function() {
            const later = () => callback.apply(this, arguments);

            clearTimeout(timeoutId);
            timeoutId = setTimeout(later, wait);
        };
    };
}
