import { SongManager } from '../managers/index.js';

/** The song selector element.
 *  @augments HTMLElement
 *  @author qxbytes */
export default class SongSelector extends HTMLElement {
    /** @type {SongManager | null} */
    #manager
    /** @type {string[]} */
    #choices
    /** @type {HTMLButtonElement[]} */
    #buttons
    /** @type {HTMLDivElement} */
    #container

    /** Create the element. */
    constructor() {
        super();
        this.style.display = 'contents';

        this.render = this.render.bind(this);

        this.#manager = null;
        this.#choices = [];
        this.#buttons = [];
        this.#container = this.#createContainer();
        this.appendChild(this.#container);
    }

    /** @returns {string[]} The attributes. */
    static get observedAttributes() { return ['choices']; }

    /** Callback that is ran when an attribute is changed.
     *  @param {string} name - The name. 
     *  @param {string} oldValue - The old value.
     *  @param {string} newValue - The new value. */
    attributeChangedCallback(name, oldValue, newValue) {
        if (!SongSelector.observedAttributes.includes(name)) return;
        if (oldValue === newValue) return;

        this.render();
    }

    /** Toggles a song through the manager. 
     *  @param {string} song - The song. */
    #toggleSong(song) { this.#manager?.toggle(song); }

    /** Creates a container element.
     *  @returns {HTMLDivElement} The container element. */
    #createContainer() {
        const container = document.createElement('div');
        container.className = 'song-selector-container';
        return container;
    }

    /** Creates a button element.
     *  @param {string} choice - The choice.
     *  @returns {HTMLButtonElement} The button element. */
    #createButton(choice) {
        const button = document.createElement('button');
        button.className = 'song-selector-button';
        button.innerText = choice;
        button.ariaLabel = `toggle ${choice}`;
        button.addEventListener('click', () => this.#toggleSong(choice));
        return button;
    }

    /** Links the song selector to a song manager.
     *  @param {SongManager} manager - The song manager. */
    link(manager) {
        this.#manager = manager;
        this.#manager.register(this.render);
    }

    /** Renders the element. */
    render() {
        if (this.#manager === null) return;
        const choicesAttribute = this.getAttribute('choices');
        if (!choicesAttribute) return;

        // Reconcile button elements
        if (this.#choices.join(',') !== choicesAttribute) {
            this.#choices = choicesAttribute.split(',');
            this.#buttons = this.#choices.map(choice => this.#createButton(choice));
            this.#container.replaceChildren(...this.#buttons);
        }

        // Update the styles per button element
        for (const button of this.#buttons) {
            if (this.#manager.isEnabled(button.innerText)) button.style.opacity = '1';
            else button.style.opacity = '0.3';

            button.classList.remove('glow');
            if (this.#manager.currentSong === button.innerText) button.classList.add('glow');
        }
    }
}

customElements.define('p-song-selector', SongSelector);
