import { SongManager } from '../managers/index.js';

/** The song player element.
 *  @augments HTMLElement
 *  @author bloopsoup */
export default class SongPlayer extends HTMLElement {
    /** @type {SongManager | null} */
    #manager
    /** @type {HTMLAudioElement | null} */
    #playing
    /** @type {HTMLSelectElement} */
    #select

    /** Create the element. */
    constructor() {
        super();
        this.style.display = 'contents';

        this.setSong = this.setSong.bind(this);
        this.setRandomSong = this.setRandomSong.bind(this);
        this.render = this.render.bind(this);

        this.#manager = null;
        this.#playing = null;
        this.#select = this.#createSelect();
        this.appendChild(this.#select);
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

    /** Sets a song through the manager. */
    setSong() { if (this.#manager !== null) this.#manager.currentSong = this.#select.value; }

    /** Sets a random song through the manager. */
    setRandomSong() { this.#manager?.setRandomSong() }

    /** Links the song player to a song manager.
     *  @param {SongManager} manager - The song manager. */
    link(manager) {
        this.#manager = manager;
        this.#manager.register(this.render);
        this.#select.addEventListener('change', this.setSong);
    }

    /** Renders the element. */
    render() {
        if (this.#manager === null) return;

        // Reconcile audio element state
        if (this.#playing === null) this.#play(this.#manager.currentSong);
        else if (this.#playing.ended) this.#play(this.#manager.currentSong);
        else if (this.#playing.src.split('/').at(-1) !== `${this.#manager.currentSong}.mp3`) this.#play(this.#manager.currentSong);
        
        // Render the select element
        const songs = [''].concat(this.#manager.enabledSongs);
        this.#select.replaceChildren(...songs.map(this.#createOption));
        this.#select.value = this.#manager.currentSong;
    }
}

customElements.define('p-song-player', SongPlayer);
