import { Stacked } from '../common/index.js';

/** It loves managing songs.
 *  @author qxbytes
 *  @author bloopsoup (refactor) */
export default class SongManager {
    /** @type {(() => void)[]} */
    #callbacks
    /** @type {Set<string>} */
    #songs
    /** @type {Set<string>} */
    #enabledSongs
    /** @type {string} */
    #currentSong

    /** Create the state manager.
     *  @param {string[]} songs - The songs. */
    constructor(songs) {
        this.#callbacks = [];
        this.#songs = new Set(songs);
        this.#enabledSongs = new Set();
        this.#currentSong = '';

        // Load previous settings
        const disabledSongs = this.#load();
        this.#songs.forEach(song => {if (!disabledSongs.includes(song)) this.#enabledSongs.add(song);});
    }

    /** @returns {string[]} All songs. */
    get songs() { return Array.from(this.#songs); }

    /** @returns {string[]} Enabled songs. */
    get enabledSongs() { return Array.from(this.#enabledSongs); }

    /** @returns {string} Current song. */
    get currentSong() { return this.#currentSong; }

    /** @param {string} song - The song to set as current. */
    set currentSong(song) {
        if (song !== '' && !this.#enabledSongs.has(song)) return;
        this.#currentSong = song;

        this.broadcast();
    }

    /** Saves the currently disabled songs into cookies. */
    #save() {
        const disabledSongs = Array.from(this.#songs).filter(song => !this.#enabledSongs.has(song));
        document.cookie = `disabledSongs=${JSON.stringify(disabledSongs)}; path=/; max-age=31536000`;
    }

    /** Loads the previously disabled songs from cookies.
     *  @returns {string[]} The disabled songs. */
    #load() {
        const match = document.cookie.match(/disabledSongs=([^;]+)/);
        return match ? JSON.parse(decodeURIComponent(match[1])) : [];
    }

    /** Registers a callback to this manager.
     *  @param {() => void} callback - The callback. */
    register(callback) { this.#callbacks.push(callback); }

    /** Broadcasts an update to the registered callbacks. */
    broadcast() { this.#callbacks.forEach(callback => callback());}

    /** Sets a random song. */
    setRandomSong() {
        if (this.#enabledSongs.size > 0) this.#currentSong = Stacked.getRandomChoice(Array.from(this.#enabledSongs));
        
        this.broadcast();
    }

    /** Checks if a song is enabled.
     *  @param {string} song - The song.
     *  @returns {boolean} The result. */
    isEnabled(song) { return this.#enabledSongs.has(song); }

    /** Toggles the song.
     *  @param {string} song - The song. */
    toggle(song) {
        if (!this.#songs.has(song)) return;

        if (this.#enabledSongs.has(song)) {
            if (this.#currentSong === song) this.#currentSong = '';
            this.#enabledSongs.delete(song);
        } else this.#enabledSongs.add(song);

        this.#save();
        this.broadcast();
    }
}
