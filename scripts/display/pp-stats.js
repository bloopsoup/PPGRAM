import { Counter, Stacked } from '../common/index.js';

/** The stats element.
 *  @augments HTMLElement 
 *  @author bloopsoup */
export default class PPStats extends HTMLElement {
    constructor() { super(); }
    connectedCallback() { this.render(); }

    /** @returns {string[]} The attributes. */
    static get observedAttributes() { return ['headers', 'items']; }

    /** Callback that is ran when an attribute is changed.
     *  @param {string} name - The name. 
     *  @param {string} oldValue - The old value.
     *  @param {string} newValue - The new value. */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'headers' || name === 'items') this.render();
    }

    /** Renders the element. */
    render() {
        const headers = this.getAttribute('headers');
        const items = this.getAttribute('items');
        if (items === null) {this.innerHTML = ''; return;}

        const elements = [];
        const counter = new Counter(items.split(','));
        counter.forEachPercent((key, i, current, _) => elements.push(`<p style="color: ${Stacked.getColor(Math.floor(i + current))}">${key} ${counter.count(key)}</p>`));

        this.innerHTML = `<div class="column">
            ${headers ? headers.split(',').map(header => `<h2>${header}</h2>`).join('\n') : ""}
            ${elements.join('\n')}
        </div>`;
    }
}

customElements.define('pp-stats', PPStats);
