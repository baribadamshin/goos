'use strict';

import ANIMATION_END_EVENT_NAME from '../../utils/getAnimationEndEventName';
import './cinema.css';

const CHANGE_EVENT = 'fullscreenChange';

const CLASS_NAMES = {
    block: {
        in: 'cinema',
        out: 'cinema_out'
    },
    outer: 'cinema__outer',
    slide: 'cinema__slide',
    goos: {
        in: 'cinema__goos',
        out: 'cinema__goos_out',
    },
};

/**
 * 1. создает контейнер и копирует в него переданный объект
 * 2. показывает контейнер
 * 3. после того как контейнер показан
 */



// TODO: do it better
export default (function (html) {
    const cinema = {
        enabled: false,
        container: null,
        goos: null
    };

    const afterCinemaOut = event => {
        html.classList.remove(CLASS_NAMES.outer);

        cinema.container.parentNode.removeChild(cinema.container);
    };

    const afterGoosOut = event => {
        const goos = event.target;

        goos.classList.remove(CLASS_NAMES.goos.out);
        goos.classList.remove(CLASS_NAMES.goos.in);

        goos.dispatchEvent(new CustomEvent(CHANGE_EVENT));

        cinema.container.addEventListener(ANIMATION_END_EVENT_NAME, afterCinemaOut, false);
        cinema.container.classList.add(CLASS_NAMES.block.out);

        goos.removeEventListener(ANIMATION_END_EVENT_NAME, afterGoosOut);

        cinema.enabled = false;
    };

    const afterFakeSlideShowedUp = (goos, beforeShowingGoos, event) => {
        if (typeof beforeShowingGoos === 'function') {
            beforeShowingGoos();
        }

        goos.dispatchEvent(new CustomEvent(CHANGE_EVENT));

        goos.classList.add(CLASS_NAMES.goos.in);
        html.classList.add(CLASS_NAMES.outer);

        cinema.container.removeChild(event.target);

        cinema.enabled = true;
    };

    return {
        changeEventName: CHANGE_EVENT,
        cinema,
        request(goos, slide, beforeShowingGoos) {
            if (cinema.enabled) {
                return;
            }

            const slideClone = slide.cloneNode(true);
            const afterFakeSlideShowedUpHandler = afterFakeSlideShowedUp.bind(0, goos, beforeShowingGoos);

            slideClone.classList.add(CLASS_NAMES.slide);
            slideClone.addEventListener(ANIMATION_END_EVENT_NAME, afterFakeSlideShowedUpHandler, false);

            cinema.container = createCinemaContainer();
            cinema.container.appendChild(slideClone);

            cinema.goos = goos;
        },
        close() {
            cinema.goos.addEventListener(ANIMATION_END_EVENT_NAME, afterGoosOut, false);
            cinema.goos.classList.add(CLASS_NAMES.goos.out);
        }
    };
}(document.documentElement));

function createCinemaContainer() {
    let wrapper = document.createElement('div');

    wrapper.className = CLASS_NAMES.block.in;

    return document.body.appendChild(wrapper);
}
