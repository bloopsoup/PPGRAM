import { Counter, Stacked } from '../common/index.js';

/** The stats element.
 *  @augments HTMLElement 
 *  @author bloopsoup */
export default class Stats extends HTMLElement {
    /** @type {HTMLOListElement} */
    #ol

    /** Create the element. */
    constructor() {
        super();

        this.#ol = document.createElement('ol');
        this.appendChild(this.#ol);
    }

    /** @returns {string[]} The attributes. */
    static get observedAttributes() { return ['items', 'summarize']; }

    /** Callback that is ran on DOM insertion. */
    connectedCallback() { this.#render(); }

    /** Callback that is ran when an attribute is changed.
     *  @param {string} name - The name. 
     *  @param {string} oldValue - The old value.
     *  @param {string} newValue - The new value. */
    attributeChangedCallback(name, oldValue, newValue) {
        if (!Stats.observedAttributes.includes(name)) return;
        if (oldValue === newValue) return;

        this.#render();
    }

    /** Creates a list of list items.
     *  @param {string[]} items - The items to use.
     *  @returns {HTMLLIElement[]} The list of list items. */
    #createListItems(items) {
        return items.map(item => {
            const li = document.createElement('li');
            li.innerText = item;
            return li;
        });
    }

    /** Creates a summary list of list items.
     *  @param {string[]} items - The items to use.
     *  @returns {HTMLLIElement[]} The list of list items. */
    #createSummaryListItems(items) {
        const counter = new Counter(items);
        return counter.mapEachPercent((key, i, current, _) => {
            const li = document.createElement('li');
            li.style.color = Stacked.getColor(Math.floor(i + current));
            li.innerText = `${key} ${counter.count(key)}`;
            return li;
        });
    }

    /** Renders the element. */
    #render() {
        const items = this.getAttribute('items');
        const summarize = this.getAttribute('summarize');
        if (items === null) return;
        this.#ol.replaceChildren(...(summarize !== null ? this.#createSummaryListItems(items.split(',')) : this.#createListItems(items.split(','))));
    }
}

customElements.define('p-stats', Stats);
