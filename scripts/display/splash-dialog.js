/** The splash dialog element.
 *  @augments HTMLElement
 *  @author bloopsoup */
export default class SplashDialog extends HTMLElement {
    /** @type {HTMLHeadingElement} */
    #h1

    /** Create the element. */
    constructor() {
        super();
        this.role = 'dialog';
        this.ariaModal = 'true';
        this.tabIndex = 0;
        this.classList.add('column', 'dialog');

        this.#h1 = this.#createHeader();
        this.appendChild(this.#h1);
    }

    /** @returns {string[]} The attributes. */
    static get observedAttributes() { return ['content']; }

    /** Callback that is ran on DOM insertion. */
    connectedCallback() {
        this.#h1.id = `${this.id}-header`;
        this.setAttribute('aria-labelledby', `${this.id}-header`);

        this.#render();
    }

    /** Callback that is ran when an attribute is changed.
     *  @param {string} name - The name. 
     *  @param {string} oldValue - The old value.
     *  @param {string} newValue - The new value. */
    attributeChangedCallback(name, oldValue, newValue) {
        if (!SplashDialog.observedAttributes.includes(name)) return;
        if (oldValue === newValue) return;

        this.#render();
    }

    /** Creates a header.
     *  @returns {HTMLHeadingElement} The header. */
    #createHeader() {
        const h1 = document.createElement('h1');
        h1.style = 'width: auto; font-size: 10rem;';
        return h1;
    }

    /** Renders the element. */
    #render() {
        this.#h1.textContent = this.getAttribute('content') || '';
        this.focus();
    }

    /** Dismisses the dialog. */
    dismiss() {
        this.style.transition = 'opacity 4s ease';
        this.style.opacity = '0';
        this.style.pointerEvents = 'none';
        this.addEventListener('transitionend', this.remove);
    }
}

customElements.define('p-splash-dialog', SplashDialog);
