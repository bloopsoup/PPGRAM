/** The splash image element.
 *  @augments HTMLElement 
 *  @author bloopsoup */
export default class SplashImage extends HTMLElement {
    constructor() { super(); }
    connectedCallback() { this.render(); }

    /** @returns {string[]} The attributes. */
    static get observedAttributes() { return ['src', 'hidden']; }

    /** Callback that is ran when an attribute is changed.
     *  @param {string} name - The name. 
     *  @param {string} oldValue - The old value.
     *  @param {string} newValue - The new value. */
    attributeChangedCallback(name, oldValue, newValue) {
        if (!SplashImage.observedAttributes.includes(name)) return;
        if (oldValue === newValue) return;
        this.render();
    }

    /** Renders the element. */
    render() {
        const src = this.getAttribute('src');
        const hidden = this.getAttribute('hidden');
        if (src === null) {this.innerHTML = ''; return;}

        this.innerHTML = `<img class="splash" src="${src}" alt="" aria-hidden="true" ${hidden !== null ? 'style="display: none;"' : ''}>`;
    }
}

customElements.define('p-splash-image', SplashImage);
