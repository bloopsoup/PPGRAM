/** The list element.
 *  @augments HTMLElement 
 *  @author bloopsoup */
export default class PPList extends HTMLElement {
    constructor() { super(); }
    connectedCallback() { this.render(); }

    /** @returns {string[]} The attributes. */
    static get observedAttributes() { return ['name', 'items']; }

    /** Callback that is ran when an attribute is changed.
     *  @param {string} name - The name. 
     *  @param {string} oldValue - The old value.
     *  @param {string} newValue - The new value. */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'name' || name === 'items') this.render();
    }

    /** Renders the element. */
    render() {
        const name = this.getAttribute('name');
        const items = this.getAttribute('items');
        this.innerHTML = `<section>
            ${name ? `<h2>${name}</h2>` : ""}
            ${items ? items.split(',').map((item, i) => `<p>-${i + 1} ${item}</p>`).join('\n') : ""}
        </section>`;
    }
}

customElements.define('pp-list', PPList);
