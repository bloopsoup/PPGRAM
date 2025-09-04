/** The splash image element.
 *  @augments HTMLElement 
 *  @author bloopsoup */
export default class SplashImage extends HTMLElement {
    /** @type {HTMLImageElement} */
    #img

    /** Create the element. */
    constructor() {
        super();

        this.#img = this.#createImage();
        this.appendChild(this.#img);
    }

    /** @returns {string[]} The attributes. */
    static get observedAttributes() { return ['src']; }

    /** Callback that is ran on DOM insertion. */
    connectedCallback() { this.#render(); }

    /** Callback that is ran when an attribute is changed.
     *  @param {string} name - The name. 
     *  @param {string} oldValue - The old value.
     *  @param {string} newValue - The new value. */
    attributeChangedCallback(name, oldValue, newValue) {
        if (!SplashImage.observedAttributes.includes(name)) return;
        if (oldValue === newValue) return;

        this.#render();
    }

    /** Creates an image element.
     *  @returns {HTMLImageElement} The image element. */
    #createImage() {
        const img = document.createElement('img');
        img.draggable = false;
        img.className = 'splash';
        img.alt = '';
        img.ariaHidden = 'true';
        return img;
    }

    /** Renders the element. */
    #render() { this.#img.src = this.getAttribute('src') || ''; }
}

customElements.define('p-splash-image', SplashImage);
