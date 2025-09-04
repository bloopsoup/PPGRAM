import { Counter, Stacked } from '../common/index.js';

/** The pie chart element.
 *  @augments HTMLElement 
 *  @author bloopsoup */
export default class PieChart extends HTMLElement {
    /** @type {HTMLDivElement} */
    #div

    /** Create the element. */
    constructor() {
        super();

        this.#div = document.createElement('div');
        this.#div.className = 'pie';
        this.appendChild(this.#div);
    }

    /** @returns {string[]} The attributes. */
    static get observedAttributes() { return ['items']; }

    /** Callback that is ran on DOM insertion. */
    connectedCallback() { this.#render(); }

    /** Callback that is ran when an attribute is changed.
     *  @param {string} name - The name. 
     *  @param {string} oldValue - The old value.
     *  @param {string} newValue - The new value. */
    attributeChangedCallback(name, oldValue, newValue) {
        if (!PieChart.observedAttributes.includes(name)) return;
        if (oldValue === newValue) return;
        this.#render();
    }

    /** Creates a conic gradient from a list of items.
     *  @param {string[]} items - The items to use.
     *  @returns {string} The conic gradient. */
    #createConicGradient(items) {
        const counter = new Counter(items);
        const slices = counter.mapEachPercent((_, i, current, percent) => `${Stacked.getColor(Math.floor(i + current))} ${current}% ${current + percent}%`);
        return `conic-gradient(${slices.join(', ')})`;
    }

    /** Renders the element. */
    #render() {
        const items = this.getAttribute('items');
        if (items === null) return;
        this.#div.style.background = this.#createConicGradient(items.split(','));
    }
}

customElements.define('p-pie-chart', PieChart);
