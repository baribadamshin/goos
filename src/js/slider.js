import Core from './core';

export default class Slider extends Core {
    setCustomDomElements() {
        this._head = this.items[0];
    }

    action() {
        this._head.style.marginLeft = (100 * this.current * -1) + '%';
    }

    bindObservers() {
        let observer;
        const config = {
            attributes: true,
            attributeOldValue: true,
            attributeFilter: [
                'class'
            ]
        };

        // в древних браузерах этого нет
        // а мы поддерживаем UC browser и Opera mini
        try {
            observer = new MutationObserver(mutations => {
                for (let record of mutations) {
                    this.setOptions();
                }
            });
        } catch (e) {}

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

        observer && observer.observe(this.block, config);
    }
}
