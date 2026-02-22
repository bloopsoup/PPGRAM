import state from '../state/state.js';

/** The song selector element.
 *  @augments HTMLElement */
export default class SongSelector extends HTMLElement {
    /** @type {string[]} */
    #managedSongs
    /** @type {Set<string>} */
    #selectedSongs
    /** @type {HTMLDivElement} */
    #container
    /** @type {Function} */
    #currentSongHandler

    /** Create the element. */
    constructor() {
        super();
        this.style.display = 'contents';
        this.#currentSongHandler = (e) => this.#handleCurrentSongChanged(e);

        this.#managedSongs = [];
        this.#selectedSongs = new Set();
        this.#container = this.#createContainer();
        this.appendChild(this.#container);
    }

    /** @returns {string[]} The attributes. */
    static get observedAttributes() { return ['songs']; }

    /** Callback that is ran on DOM insertion. */
    connectedCallback() {
        window.addEventListener('stateCurrentSongChanged', this.#currentSongHandler);
        this.#initialize();
    }

    /** Callback that is ran on DOM removal. */
    disconnectedCallback() {
        window.removeEventListener('stateCurrentSongChanged', this.#currentSongHandler);
    }

    /** Callback that is ran when an attribute is changed.
     *  @param {string} name - The name. 
     *  @param {string} oldValue - The old value.
     *  @param {string} newValue - The new value. */
    attributeChangedCallback(name, oldValue, newValue) {
        if (!SongSelector.observedAttributes.includes(name)) return;
        if (oldValue === newValue) return;

        this.#initialize();
    }

    /** Handles current song changed event.
     *  @param {CustomEvent} event - The event. */
    #handleCurrentSongChanged(event) {
        const { song } = event.detail;

        // remove active class from all buttons
        const buttons = this.#container.querySelectorAll('.song-button');
        buttons.forEach(button => button.classList.remove('active'));

        // add active class to matching button
        if (song) {
            const matches = this.#container.querySelectorAll(`[data-song="${song}"]`);
            matches.forEach(button => button.classList.add('active'))
        }
    }

    /** Initializes the selector from its own songs attribute. */
    #initialize() {
        const songsAttribute = this.getAttribute('songs');
        if (!songsAttribute) return;

        this.#managedSongs = songsAttribute.split(',');
        this.#selectedSongs = new Set(this.#managedSongs);
        // also unselects songs that were deselected in storage
        state.registerSongs(this.#managedSongs);
        // sync with state's visible songs from all selectors and get ones we manage
        this.#selectedSongs = new Set(state.visibleSongs.filter(song => this.#managedSongs.includes(song)));
        this.#render();
    }

    /** Creates a container element.
     *  @returns {HTMLDivElement} The container element. */
    #createContainer() {
        const container = document.createElement('div');
        container.className = 'song-selector-container';
        return container;
    }

    /** Creates a song button element.
     *  @param {string} song - The song name.
     *  @returns {HTMLButtonElement} The button element. */
    #createSongButton(song) {
        const button = document.createElement('button');
        button.className = 'song-button';
        button.innerText = song;
        button.ariaLabel = `toggle ${song}`;
        button.dataset.song = song;
        button.addEventListener('click', () => this.#toggleSong(song));
        if (!this.#selectedSongs.has(song)) {
            button.classList.add('faded');
        }
        return button;
    }

    /** Updates button style based on active state.
     *  @param {HTMLButtonElement} button - The button element.
     *  @param {boolean} isActive - Whether the song is active. */
    #updateButtonStyle(button, isActive) {
        if (isActive) {
            button.classList.remove('faded');
        } else {
            button.classList.add('faded');
        }
    }

    /** Toggles a song's active state.
     *  @param {string} song - The song to toggle. */
    #toggleSong(song) {
        const isActive = this.#selectedSongs.has(song);

        if (isActive) {
            this.#selectedSongs.delete(song);
            state.toggleSongVisibility(song, false);
        } else {
            this.#selectedSongs.add(song);
            state.toggleSongVisibility(song, true);
        }

        this.#updateButton(song);
    }

    /** Updates a specific button's style.
     *  @param {string} song - The song whose button to update. */
    #updateButton(song) {
        const buttons = this.#container.querySelectorAll(`[data-song="${song}"]`);
        buttons.forEach(button => this.#updateButtonStyle(button, this.#selectedSongs.has(song)));
    }

    /** Renders the element. */
    #render() {
        const buttons = this.#managedSongs.map(song => this.#createSongButton(song));
        this.#container.replaceChildren(...buttons);
    }
}

customElements.define('p-song-selector', SongSelector);