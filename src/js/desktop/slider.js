import Core from '../core';

export default class Slider extends Core {
    setUserInterface() {
        super.setUserInterface();

        // запиливаем кнопки
        this.options.enableArrows && this.createArrows();

        this._addEventListeners();
    }

    action(current, options) {
        this.options.enableArrows && this.setArrowsActivity();

        this.head.style.marginLeft = (-100 * current) + '%';
    }

    _addEventListeners() {
        const config = {
            attributes: true,
            attributeOldValue: true,
            attributeFilter: [
                'class',
            ]
        };

        if (this.support.mutationObserver) {
            const observer = new MutationObserver(() => {
                this.setOptions();
            });

            observer.observe(this.block, config);
        }

        if (this.options.responsive) {
            const windowResizeHandler = this.debounce(this.setOptions.bind(this), 250);

            // когда мы включаем адаптивный режим, нам нужно следить за тем чтобы мы не
            // прокручивали большем элементов чем их видно на экране
            // т.е был слайдер на 4 элемента с прокруткой по 3; окно уменьшилось, теперь слайдер шириной 2
            // а прокрутка все еще по 3
            // эта информация лежит в контент псевдоэлемента
            window.addEventListener('resize', windowResizeHandler);
        }
    }
}
