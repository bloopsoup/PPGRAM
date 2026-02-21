import { Stacked } from '../common/index.js';
import state from '../state/state.js';

/** The song player element.
 *  @augments HTMLElement
 *  @author bloopsoup */
export default class SongPlayer extends HTMLElement {
    /** @type {HTMLAudioElement | null} */
    #playing
    /** @type {HTMLSelectElement} */
    #select
    /** @type {Function} */
    #visibleSongsHandler
    /** @type {Function} */
    #currentSongHandler

    /** Create the element. */
    constructor() {
        super();
        this.style.display = 'contents';
        this.setRandomSong = this.setRandomSong.bind(this);
        this.#visibleSongsHandler = (e) => this.#handleVisibleSongsChanged(e);
        this.#currentSongHandler = (e) => this.#handleCurrentSongChanged(e);

        this.#playing = null;
        this.#select = this.#createSelect();
        this.appendChild(this.#select);
    }

    /** Callback that is ran on DOM insertion. */
    connectedCallback() {
        // All songs being played should trigger this event handler
        this.#select.addEventListener('change', () => this.#play(this.#select.value));

        // Subscribe to state events
        window.addEventListener('stateVisibleSongsChanged', this.#visibleSongsHandler);
        window.addEventListener('stateCurrentSongChanged', this.#currentSongHandler);

        this.#render();
    }

    /** Callback that is ran on DOM removal. */
    disconnectedCallback() {
        window.removeEventListener('stateVisibleSongsChanged', this.#visibleSongsHandler);
        window.removeEventListener('stateCurrentSongChanged', this.#currentSongHandler);
    }

    /** Handles visible songs changed event.
     *  @param {CustomEvent} event - The event. */
    #handleVisibleSongsChanged(event) {
        this.#render();
    }

    /** Handles current song changed event.
     *  @param {CustomEvent} event - The event. */
    #handleCurrentSongChanged(event) {
        const { song } = event.detail;
        const songs = [''].concat(state.visibleSongs);

        if (songs.includes(song)) {
            this.#select.value = song;
        } else {
            this.#select.value = '';
        }
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
        state.setCurrentSong(song);
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
        const currentSong = state.currentSong;

        const songs = [''].concat(state.visibleSongs);
        this.#select.replaceChildren(...songs.map(this.#createOption));

        if (songs.includes(currentSong)) {
            this.#select.value = currentSong;
        } else {
            this.#select.value = '';
        }
    }
}

customElements.define('p-song-player', SongPlayer);
