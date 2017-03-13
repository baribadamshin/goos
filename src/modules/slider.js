import Core from './core';

export default class Slider extends Core {
    setCustomDomElements() {
        this._head = this.items[0];
    }

    action() {
        // в сафари есть разница между размерами в процентах и размерами в "проценты +/- пиксели"
        // в первом случае не будет округления, а во втором — будет
        // Поэтому если мы указываем элементу "нечестные" проценты, то и сдвигать нам нужно так же
        // в остальных браузерах все ок
        const safariExpression = (this._options.margin) ? '+ 0px' : '';

        this._head.style.marginLeft = `calc(100% * ${this.current} * -1 ${safariExpression})`;
    }

    bindObservers() {
        const config = {
            attributes: true,
            attributeOldValue: true,
            attributeFilter: [
                'class'
            ]
        };

        const observer = new MutationObserver(mutations => {
            for (let record of mutations) {
                this.setOptions();
            }
        });

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

        observer.observe(this.block, config);
    }
}
