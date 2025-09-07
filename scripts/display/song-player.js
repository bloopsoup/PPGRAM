import { Stacked } from '../common/index.js';

/** The song player element.
 *  @augments HTMLElement
 *  @author bloopsoup */
export default class SongPlayer extends HTMLElement {
    /** @type {HTMLAudioElement | null} */
    #playing
    /** @type {HTMLSelectElement} */
    #select

    /** Create the element. */
    constructor() {
        super();
        this.style.display = 'contents';
        this.setRandomSong = this.setRandomSong.bind(this);

        this.#playing = null;
        this.#select = this.#createSelect();
        this.appendChild(this.#select);
    }

    /** @returns {string[]} The attributes. */
    static get observedAttributes() { return ['songs']; }

    /** Callback that is ran on DOM insertion. */
    connectedCallback() {
        // All songs being played should trigger this event handler
        this.#select.addEventListener('change', () => this.#play(this.#select.value));
        this.#render();
    }

    /** Callback that is ran when an attribute is changed.
     *  @param {string} name - The name. 
     *  @param {string} oldValue - The old value.
     *  @param {string} newValue - The new value. */
    attributeChangedCallback(name, oldValue, newValue) {
        if (!SongPlayer.observedAttributes.includes(name)) return;
        if (oldValue === newValue) return;

        this.#render();
    }

    /** Creates a select element.
     *  @returns {HTMLSelectElement} The select element. */
    #createSelect() {
        const select = document.createElement('select');
        select.ariaLabel = 'song player';
        select.value = '';
        return select;
    }

    /** Creates an option element.
     * @param {string} value - The value to use. 
     * @returns  {HTMLOptionElement} The option element. */
    #createOption(value) {
        const option = document.createElement('option');
        option.value = value;
        option.innerText = value ? value : "SONG?";
        return option;
    }

    /** Stops the current song. */
    #stop() {
        if (this.#playing === null) return;
        this.#playing.removeEventListener('ended', this.setRandomSong);
        this.#playing.pause();
        this.#playing.currentTime = 0;
        this.#playing.removeAttribute('src');
        this.#playing.load();
        this.#playing.remove();
        this.#playing = null;
    }

    /** Plays a song.
     *  @param {string} song - The song to play. */
    #play(song) {
        this.#stop();
        if (song === '') return;

        const audio = document.createElement('audio');
        audio.addEventListener('ended', this.setRandomSong);
        audio.src = `audio/${song}.mp3`;
        audio.play();
        this.#playing = audio;
    }

    /** Sets a random song. */
    setRandomSong() {
        const songs = [];
        for (const option of this.#select.options) {
            if (option.value === '') continue;
            songs.push(option.value);
        }
        const chosen = Stacked.getRandomChoice(songs);

        // Trigger event
        this.#select.value = chosen;
        this.#select.dispatchEvent(new Event('change'));
    }

    /** Renders the element. */
    #render() {
        const songsAttribute = this.getAttribute('songs');
        if (songsAttribute === null) return;

        const songs = [''].concat(songsAttribute.split(','));
        this.#select.replaceChildren(...songs.map(this.#createOption));
    }
}

customElements.define('p-song-player', SongPlayer);
