import { Counter, Stacked } from '../common/index.js';

/** A pie chart display.
 *  @author bloopsoup */
export default class PieChart {
    /** @type {HTMLElement | null} */
    #container

    /** Create the pie chart.
     *  @param {string} id - The ID. */
    constructor(id) { this.#container = document.getElementById(id); }

    /** Parses a counter into pie chart slices.
     *  @param {Counter} counter - The counter to parse.
     *  @returns {string[]} The slices. */
    #toSlices(counter) {
        const slices = [];
        counter.forEachPercent((_, i, current, percent) => slices.push(`${Stacked.getColor(Math.floor(i + current))} ${current}% ${current + percent}%`));
        return slices;
    }

    /** Displays the pie chart.
     *  @param {Counter} counter - The counter to parse. */
    display(counter) {
        if (this.#container === null) return;
        this.#container.replaceChildren();

        const figure = document.createElement('figure');
        figure.classList.add('pie');
        figure.style.background = `conic-gradient(${this.#toSlices(counter).join(', ')})`;
        this.#container.appendChild(figure);
    }
}
