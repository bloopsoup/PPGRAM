import { Counter, Stacked } from '../common/index.js';

/** A stats display.
 *  @author bloopsoup */
export default class Stats {
    /** @type {HTMLElement | null} */
    #container

    /** Create the stats display.
     *  @param {string} id - The ID. */
    constructor(id) { this.#container = document.getElementById(id); }

    /** Displays the headers.
     *  @param {string[]} headers - The headers to display. */
    #displayHeaders(headers) {
        for (const header of headers) {
            const element = document.createElement('h2');
            element.textContent = header;
            this.#container?.appendChild(element);
        }
    }

    /** Displays the counter.
     *  @param {Counter} counter - The counter to display. */
    #displayCounter(counter) {
        counter.forEachPercent((key, i, current, _) => {
            const element = document.createElement('p');
            element.textContent = `${key} ${counter.count(key)}`;
            element.style.color = Stacked.getColor(Math.floor(i + current));
            this.#container?.append(element);
        });
    }

    /** Displays the stats.
     *  @param {string[]} headers - The headers to display.
     *  @param {Counter} counter - The counter to display. */
    display(headers, counter) {
        if (this.#container === null) return;
        this.#container.replaceChildren();
        this.#displayHeaders(headers);
        this.#displayCounter(counter);
    }
}
