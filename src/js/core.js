export default class Core {
    constructor(containerElement, options) {
        if (this._setDomElements(containerElement) === true) {
            this._support = this.constructor.getBrowserSupportFeatures();

            this.setOptions(options);
            this.setUserInterface();
            this.bindObservers();
        }
    }

    /**
     * @typedef {Object} OptionsFromBlockClass
     * @property {number} size
     * @property {boolean} margin
     * @property {boolean} responsive
     */

    /**
     * Get options from HtmlElement classNames property
     * @param {HtmlElement} block
     * @returns {OptionsFromBlockClass}
     */
    static getOptionsFromBlockClass(block) {
        const responsive = block.classList.contains('goos_responsive');
        const margin = block.classList.contains('goos_margin');
        const size = Number((block.className.match(/goos_size_(\d+)/) || [])[1] || 1);

        return {responsive, margin, size};
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
        this._options.enableArrows && this._setArrowsActivity();

        this.action();
    }

    get current() {
        return this._options.current;
    }

    prev() {
        this.current -= this._options.slideBy;
    }

    next() {
        this.current += this._options.slideBy;
    }

    /**
     * Check current DOM Element and set it up to private property
     *
     * @private
     * @param {HtmlElement} containerElement
     */
    _setDomElements(containerElement) {
        if (containerElement instanceof HTMLElement === false) {
            console.warn('You should pass DOM element as first argument');
            return false;
        }

        this._classNames = {
            init: 'goos_init_desktop',
            shaft: 'goos__shaft',
            arrows: {
                base: 'goos__arrow',
                prev: 'goos__arrow_prev',
                next: 'goos__arrow_next',
                off: 'goos__arrow_disabled'
            }
        };

        this.block = containerElement;
        this.shaft = this.block.getElementsByClassName(this._classNames.shaft)[0];
        this.items = this.shaft.children;

        // если хочется что-то доопределить в дочерних классах
        this.setDomElements();

        return true;
    }

    /**
     * Set default options and extend it with new options
     *
     * @param {Object} options
     * @public
     */
    setOptions(options) {
        // сохраним оригинальные значения
        this._originalOptions = options;

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
                styleOptions.slideBy = (this._originalOptions && this._originalOptions.slideBy) || defineOptions.size;
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
        this.block.classList.add(this._classNames.init)
    }

    _createArrows() {
        let arrowPrev = document.createElement('button');
        let arrowNext = arrowPrev.cloneNode(false);

        arrowNext.className = arrowPrev.className = this._classNames.arrows.base;

        arrowPrev.classList.add(this._classNames.arrows.prev);
        arrowNext.classList.add(this._classNames.arrows.next);

        arrowPrev.addEventListener('click', () => this.prev());
        arrowNext.addEventListener('click', () => this.next());

        this.arrowNext = this.block.insertBefore(arrowNext, this.block.firstChild);
        this.arrowPrev = this.block.insertBefore(arrowPrev, this.block.firstChild);

        this._setArrowsActivity();
    }

    // включаем и выключаем стрелки
    _setArrowsActivity() {
        if (!this.arrowPrev || !this.arrowNext) {
            return;
        }

        const arrowDisabledClass = this._classNames.arrows.off;

        this._edge === 'left' && this.arrowPrev.classList.add(arrowDisabledClass);
        this._edge === 'right' && this.arrowNext.classList.add(arrowDisabledClass);

        if (!this._edge) {
            this.arrowPrev.classList.remove(arrowDisabledClass);
            this.arrowNext.classList.remove(arrowDisabledClass);
        }
    }

    action() {}
    bindObservers() {}
    setDomElements() {}
}
