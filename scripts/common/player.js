import Stacked from './stacked.js';

/** Music player.
 *  @author bloopsoup */
export default class Player {
    /** @type {string[]} */
    #songs
    /** @type {HTMLAudioElement | null} */
    #playing

    /** Create the player.
     * @param {string[]} songs - The songs to load. */
    constructor(songs) {
        this.#songs = songs;
        this.#playing = null;
    }

    /** Stops the current song. */
    #stop() {
        if (this.#playing === null) return;
        this.#playing.pause();
        this.#playing.currentTime = 0;
        this.#playing.removeAttribute('src');
        this.#playing.load();
        this.#playing.remove();
        this.#playing = null;
    }

    /** Plays a song.
     *  @param {string} song - The song to play. */
    playSong(song) {
        this.#stop();
        if (!this.#songs.includes(song)) return;

        const audio = document.createElement('audio');
        audio.src = `audio/${song}.mp3`;
        audio.loop = true;
        audio.play();
    }

    /** PLays a random song. */
    playRandomSong() { this.playSong(Stacked.getRandomChoice(this.#songs)); }
}
