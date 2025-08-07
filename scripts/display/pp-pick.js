/** The pick element.
 *  @augments HTMLElement 
 *  @author bloopsoup */
export default class PPPick extends HTMLElement {
    constructor() { super(); }
    connectedCallback() { this.render(); }

    /** @returns {string[]} The attributes. */
    static get observedAttributes() { return ['name', 'date']; }

    /** Callback that is ran when an attribute is changed.
     *  @param {string} name - The name. 
     *  @param {string} oldValue - The old value.
     *  @param {string} newValue - The new value. */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'name' || name === 'date') this.render();
    }

    /** Renders the element. */
    render() {
        const name = this.getAttribute('name');
        const date = this.getAttribute('date');
        this.innerHTML = `<section>
            <h2>${name ? 'victim' : 'loading...'}</h2>
            <h3 style="color: rgb(255, 202, 237);">${name || ""}</h3>
            <h2 style="text-align: right;">${date ? date : ""}</h2>
        </section>`;
    }
}

customElements.define('pp-pick', PPPick);
