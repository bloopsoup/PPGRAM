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
    /** @type {HTMLAudioElement} */
    #playing

    /** Create the state manager.
     *  @param {string[]} songs - The songs. */
    constructor(songs) {
        this.#callbacks = [];
        this.#songs = new Set(songs);
        this.#enabledSongs = new Set();
        this.#currentSong = '';
        this.#playing = document.createElement('audio');
        this.#playing.preload = 'auto';
        this.#playing.addEventListener('ended', () => this.setRandomSong());
        this.#playing.addEventListener('error', () => {
            console.error(`Unable to load song: ${this.#currentSong}`, this.#playing.error);
        });
        document.body.appendChild(this.#playing);

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

    /** @returns {boolean} Whether audio is currently playing. */
    get isPlaying() { return this.#currentSong !== '' && !this.#playing.paused && !this.#playing.ended; }

    /** @returns {number} Current playback position in seconds. */
    get currentTime() { return Number.isFinite(this.#playing.currentTime) ? this.#playing.currentTime : 0; }

    /** @returns {number} Current song duration in seconds. */
    get duration() { return Number.isFinite(this.#playing.duration) ? this.#playing.duration : 0; }

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

    /** Plays a selected song without changing its pool membership.
     *  @param {string} song - The song. */
    async playSong(song) {
        if (!this.#songs.has(song)) return;

        this.#playing.pause();
        this.#currentSong = song;
        this.broadcast();

        this.#playing.src = `audio/${song}.mp3`;

        try {
            await this.#playing.play();
        } catch (error) {
            if (this.#currentSong !== song) return;
            console.error(`Unable to play song: ${song}`, error);
        }
    }

    /** Pauses or resumes the current song. */
    async togglePlayback() {
        if (this.#currentSong === '') {
            this.setRandomSong();
            return;
        }

        if (!this.#playing.paused) {
            this.#playing.pause();
            this.broadcast();
            return;
        }

        try {
            await this.#playing.play();
        } catch (error) {
            console.error(`Unable to resume song: ${this.#currentSong}`, error);
        }
        this.broadcast();
    }

    /** Sets a random song. */
    setRandomSong() {
        if (this.#enabledSongs.size > 0) {
            let songs = Array.from(this.#enabledSongs);
            if (songs.length > 1) songs = songs.filter(song => song !== this.#currentSong);
            this.playSong(Stacked.getRandomChoice(songs));
        }
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
            if (this.#currentSong === song) {
                this.#currentSong = '';
                this.#stop();
            }
            this.#enabledSongs.delete(song);
        } else this.#enabledSongs.add(song);

        this.#save();
        this.broadcast();
    }

    /** Stops the current song. */
    #stop() {
        this.#playing.pause();
        this.#playing.removeAttribute('src');
        this.#playing.load();
    }
}
