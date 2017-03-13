export default class Core {
    constructor(containerElement, options, customClassNames) {
        this._setDomElements(containerElement, customClassNames);

        this.setOptions(options);
        this.setUserInterface();
        this.bindObservers();
    }

    /**
     * Checks element is instanceof HTMLElement
     * @param {HTMLElement} domElement
     * @returns {boolean}
     */
    static check(domElement) {
        return domElement instanceof HTMLElement;
    }

    /**
     * @returns {{size: *}}
     * @param {string} className
     */
    static getOptionsFromClassName(className) {
        // бабель транспайлит дефолтные значения вот в такой ад
        // var className = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        className = className || '';

        const responsive = /goos_responsive/.test(className);
        const margin = /goos_margin/.test(className);
        const size = Number(className.replace(/.+goos_size_(\d).{0,}/, '$1')) || 1;

        return {size, responsive, margin};
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
     * @param {Object} customClassNames
     */
    _setDomElements(containerElement, customClassNames) {
        if (this.constructor.check(containerElement) === false) {
            throw new TypeError('You should pass DOM element as first argument');
        }

        const defaultClassNames = {
            init: 'goos_init',
            shaft: 'goos__shaft',
            item: 'goos__item',
            arrows: {
                base: 'goos__arrow',
                prev: 'goos__arrow_prev',
                next: 'goos__arrow_next',
                off: 'goos__arrow_disabled'
            }
        };

        this._classNames = Object.assign({}, defaultClassNames, customClassNames);

        this.block = containerElement;
        this.items = this.block.getElementsByClassName(this._classNames.item);

        // если хочется что-то доопределить в дочерних классах
        this.setCustomDomElements();
    }

    /**
     * Set default options and extend it with new options
     *
     * @param {Object} options
     * @private
     */
    setOptions(options) {
        // сохраним оригинальные значения
        this._originalOptions = options;

        const defineOptions = this.constructor.getOptionsFromClassName(this.block.className);
        const defaultOptions = {
            current: 0,
            size: defineOptions.size || 1,
            slideBy: (options && options.slideBy) || defineOptions.size,
            enableArrows: true
        };

        // опции которые мы пробрасываем из стилей
        let styleOptions = {};

        if (defineOptions.responsive) {
            let size = getComputedStyle(this.block, '::before').getPropertyValue('content').replace(/'/g, '');
            size = size.length && parseInt(JSON.parse(size));

            if(size) {
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

    setUserInterface() {
        // запиливаем кнопки
        this._options.enableArrows && this._createArrows();
        this._options.enableArrows && this._setArrowsActivity();

        this.block.classList.add(this._classNames.init);
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
    setCustomDomElements() {}
}
