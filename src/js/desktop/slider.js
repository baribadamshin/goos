import debounce from '../helpers/debounce';
import Core from '../core';

export default class Slider extends Core {
    action(current, options) {
        this.head.style.marginLeft = (-100 * current) + '%';
    }

    setUserInterface(specific) {
        this.options.enableArrows && this.createArrows();

        super.setUserInterface(arguments);
    }

    addEventListeners(w, options, support) {
        const config = {
            attributes: true,
            attributeOldValue: true,
            attributeFilter: [
                'class',
            ]
        };

        if (support.mutationObserver) {
            const observer = new MutationObserver(() => {
                this.setOptions();
            });

            observer.observe(this.block, config);
        }

        if (options.responsive) {
            const windowResizeHandler = debounce(this.setOptions.bind(this), 250);

            // когда мы включаем адаптивный режим, нам нужно следить за тем чтобы мы не
            // прокручивали больше элементов чем их видно на экране
            // т.е был слайдер на 4 элемента с прокруткой по 3; окно уменьшилось — теперь слайдер шириной 2
            // а прокрутка все еще по 3
            // эта информация лежит в контент псевдоэлемента
            w.addEventListener('resize', windowResizeHandler);
        }

        if (options.enableArrows) {
            this.block.addEventListener('click', event => {
                const target = event.target;
                const classNames = this.classNames;

                // стрелка влево
                if (target.classList.contains(classNames.arrows.prev)) {
                    this.prev();
                }

                // стрелка вправо
                if (target.classList.contains(classNames.arrows.next)) {
                    this.next();
                }
            });
        }

        super.addEventListeners.apply(this, arguments);
    }
}
