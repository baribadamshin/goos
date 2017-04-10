import Core from '../core';

export default class Slider extends Core {
    setDomElements() {
        this._head = this.items[0];
    }

    setUserInterface() {
        this._classNames.init = 'goos_init_desktop';

        super.setUserInterface();

        // запиливаем кнопки
        this._options.enableArrows && this._createArrows();
    }

    action() {
        this._head.style.marginLeft = (-100 * this.current) + '%';
    }

    bindObservers() {
        const config = {
            attributes: true,
            attributeOldValue: true,
            attributeFilter: [
                'class'
            ]
        };

        if (this._support.mutationObserver) {
            const observer = new MutationObserver(mutations => {
                for (let record of mutations) {
                    this.setOptions();
                }
            });

            observer.observe(this.block, config);
        }

        if (this._options.responsive) {
            const windowResizeHandler = () => {
                this.setOptions();
            };

            // когда мы включаем адаптивный режим, нам нужно следить за тем чтобы мы не
            // прокручивали большем элементов чем их видно на экране
            // т.е был слайдер на 4 элемента с прокруткой по 3; окно уменьшилось, теперь слайдер шириной 2
            // а прокрутка все еще по 3! нам нужно сделать прокрутку равной размеру слайдера
            // эта информация лежит в контент псевдоэлемента
            let resizeHandlerId;

            window.addEventListener('resize', () => {
                clearTimeout(resizeHandlerId);
                resizeHandlerId = setTimeout(windowResizeHandler, 250);
            });
        }
    }
}
