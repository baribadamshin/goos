'use strict';

import ANIMATION_END_EVENT_NAME from '../../utils/getAnimationEndEventName';
import './cinema.css';

const FULLSCREEN_CHANGE_EVENT = 'fullscreenChange';

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

// TODO do it better
export default (function (html) {
    let cinema;
    const state = {
        enabled: false,
        goos: null
    };

    const afterCinemaOut = event => {
        html.classList.remove(CLASS_NAMES.outer);
        cinema.parentNode.removeChild(cinema);
    };

    const afterGoosOut = event => {
        const goos = event.target;

        goos.classList.remove(CLASS_NAMES.goos.out);
        goos.classList.remove(CLASS_NAMES.goos.in);

        cinema.classList.add(CLASS_NAMES.block.out);

        goos.dispatchEvent(new CustomEvent(FULLSCREEN_CHANGE_EVENT));
        goos.removeEventListener(ANIMATION_END_EVENT_NAME, afterGoosOut);

        state.enabled = false;
    };

    const afterFakeSlideShowedUp = (goos, event) => {
        goos.dispatchEvent(new CustomEvent(FULLSCREEN_CHANGE_EVENT));

        goos.classList.add(CLASS_NAMES.goos.in);

        html.classList.add(CLASS_NAMES.outer);

        cinema.removeChild(event.target);

        state.enabled = true;
        state.goos = goos;
    };

    return {
        changeEventName: FULLSCREEN_CHANGE_EVENT,
        state,
        request(goos, slide) {
            if (state.enabled) {
                return;
            }

            const slideClone = slide.cloneNode(true);

            cinema = createCinema();

            slideClone.classList.add(CLASS_NAMES.slide);

            slideClone.addEventListener(ANIMATION_END_EVENT_NAME, afterFakeSlideShowedUp.bind(0, goos), false);

            cinema.appendChild(slideClone);
        },
        close() {
            state.goos.addEventListener(ANIMATION_END_EVENT_NAME, afterGoosOut, false);
            state.goos.classList.add(CLASS_NAMES.goos.out);

            cinema.addEventListener(ANIMATION_END_EVENT_NAME, afterCinemaOut, false);
        }
    };
}(document.documentElement));

function createCinema() {
    let wrapper = document.createElement('div');

    wrapper.className = CLASS_NAMES.block.in;

    return document.body.appendChild(wrapper);
}
