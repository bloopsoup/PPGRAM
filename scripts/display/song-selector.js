import { SongManager } from '../managers/index.js';

/** The song selector element.
 *  @augments HTMLElement
 *  @author qxbytes */
export default class SongSelector extends HTMLElement {
    /** @type {SongManager | null} */
    #manager
    /** @type {string[]} */
    #choices
    /** @type {HTMLDivElement[]} */
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

    /** Plays a song through the manager.
     *  @param {string} song - The song. */
    #playSong(song) { this.#manager?.playSong(song); }

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
     *  @returns {HTMLDivElement} The button element. */
    #createButton(choice) {
        const button = document.createElement('div');
        button.className = 'song-selector-button';
        const label = document.createElement('button');
        label.className = 'song-selector-label';
        label.innerText = choice;
        label.title = choice;
        label.ariaLabel = `play ${choice}`;
        label.addEventListener('click', () => this.#playSong(choice));

        const action = document.createElement('button');
        action.className = 'song-selector-action';
        action.addEventListener('click', () => this.#toggleSong(choice));

        button.append(label, action);
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
            const label = button.querySelector('.song-selector-label');
            const song = label?.textContent;
            const action = button.querySelector('.song-selector-action');
            const isEnabled = song !== null && this.#manager.isEnabled(song);
            button.classList.toggle('faded', !isEnabled);
            if (action) {
                action.innerText = isEnabled ? '−' : '+';
                action.ariaLabel = isEnabled
                    ? `remove ${song} from rotation`
                    : `add ${song} to rotation`;
            }

            const isPlaying = this.#manager.currentSong === song;
            button.classList.toggle('playing', isPlaying);
            label?.classList.toggle('glow', isPlaying);
        }
    }
}

customElements.define('p-song-selector', SongSelector);
