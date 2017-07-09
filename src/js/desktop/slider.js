import debounce from '../helpers/debounce';
import Core from '../core';

export default class Slider extends Core {
    action(current, options) {
        this.head.style.marginLeft = (-100 * current) + '%';
    }

    setUserInterface() {
        this.options.enableArrows && this.createArrows();

        super.setUserInterface();
    }

    _addEventListeners(w, container, options, support) {
        if (options.responsive === true) {
            // когда мы включаем адаптивный режим, нам нужно следить за тем чтобы мы не
            // прокручивали больше элементов чем их видно на экране
            // т.е был слайдер на 4 элемента с прокруткой по 3; окно уменьшилось — теперь слайдер шириной 2
            // а прокрутка все еще по 3
            w.addEventListener('resize', debounce(this.setOptions.bind(this), 250));
        }

        if (options.enableArrows) {
            container.addEventListener('click', event => {
                const target = event.target;
                const classNames = this.classNames;

                if (options.enableArrows) {
                    // стрелка влево
                    if (target.classList.contains(classNames.arrows.prev)) {
                        this.prev();
                    }

                    // стрелка вправо
                    if (target.classList.contains(classNames.arrows.next)) {
                        this.next();
                    }
                }

                // клик по точке в навигации
                if (options.enableDots && target.classList.contains(classNames.dots.item)) {
                    const dotIndex = [].indexOf.call(this.dotsContainer.children, target);
                    const screenIndex = Math.round(this.items.length / this.screens * dotIndex);

                    if (this.current !== screenIndex) {
                        this.current = screenIndex;
                    }
                }
            });
        }

        super._addEventListeners.apply(this, arguments);
    }
}
