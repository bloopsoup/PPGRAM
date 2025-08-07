import { Counter, Stacked } from '../common/index.js';

/** The pie chart element.
 *  @augments HTMLElement 
 *  @author bloopsoup */
export default class PPPieChart extends HTMLElement {
    constructor() { super(); }
    connectedCallback() { this.render(); }

    /** @returns {string[]} The attributes. */
    static get observedAttributes() { return ['items']; }

    /** Callback that is ran when an attribute is changed.
     *  @param {string} name - The name. 
     *  @param {string} oldValue - The old value.
     *  @param {string} newValue - The new value. */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'items') this.render();
    }

    /** Renders the element. */
    render() {
        const items = this.getAttribute('items');
        if (items === null) {this.innerHTML = ''; return;}
        
        const slices = [];
        const counter = new Counter(items.split(','));
        counter.forEachPercent((_, i, current, percent) => slices.push(`${Stacked.getColor(Math.floor(i + current))} ${current}% ${current + percent}%`));
        console.log(`conic-gradient(${slices.join(', ')})`);

        this.innerHTML = `<div class="column">
            <figure class="pie" style="background: conic-gradient(${slices.join(', ')})"></figure>
        </div>`;
    }
}

customElements.define('pp-pie-chart', PPPieChart);
