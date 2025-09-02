/** The splash dialog element.
 *  @augments HTMLElement
 *  @author bloopsoup */
export default class SplashDialog extends HTMLElement {
    /** @type {HTMLElement} */
    #header

    /** Create the element. */
    constructor() {
        super();
        this.role = 'dialog';
        this.ariaModal = 'true';
        this.tabIndex = -1;
        this.classList.add('column', 'dialog');

        this.#header = this.#createHeader();
        this.appendChild(this.#header);
    }

    /** @returns {string[]} The attributes. */
    static get observedAttributes() { return ['content']; }

    /** Callback that is ran on DOM insertion. */
    connectedCallback() {
        this.#header.id = `${this.id}-header`;
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
     *  @returns {HTMLElement} The header. */
    #createHeader() {
        const header = document.createElement('h1');
        header.style = 'width: auto; font-size: 10rem;';
        return header;
    }

    /** Renders the element. */
    #render() {
        this.#header.textContent = this.getAttribute('content') || '';
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
