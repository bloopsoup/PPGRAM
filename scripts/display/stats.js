import { Counter, Stacked } from '../common/index.js';

/** The list element.
 *  @augments HTMLElement 
 *  @author bloopsoup */
export default class Stats extends HTMLElement {
    constructor() { super(); }
    connectedCallback() { this.render(); }

    /** @returns {string[]} The attributes. */
    static get observedAttributes() { return ['headers', 'items', 'summarize']; }

    /** Callback that is ran when an attribute is changed.
     *  @param {string} name - The name. 
     *  @param {string} oldValue - The old value.
     *  @param {string} newValue - The new value. */
    attributeChangedCallback(name, oldValue, newValue) {
        if (!Stats.observedAttributes.includes(name)) return;
        if (oldValue === newValue) return;
        this.render();
    }

    /** Renders the element. */
    render() {
        const headers = this.getAttribute('headers');
        const items = this.getAttribute('items');
        const summarize = this.getAttribute('summarize');
        if (items === null) {this.innerHTML = ''; return;}

        const elements = [];
        const counter = new Counter(items.split(','));
        if (summarize === null) items.split(',').forEach(item => elements.push(`<li>${item}</li>`));
        else counter.forEachPercent((key, i, current, _) => elements.push(`<li style="color: ${Stacked.getColor(Math.floor(i + current))}">${key} ${counter.count(key)}</li>`));

        this.innerHTML = `<div class="column">
            ${headers ? headers.split(',').map(header => `<h2>${header}</h2>`).join('\n') : ""}
            <ol>
                ${elements.join('\n')}
            </ol>
        </div>`;
    }
}

customElements.define('p-stats', Stats);
