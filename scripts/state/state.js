/** Centralized state management for song player and selectors.
 *  Uses CustomEvent dispatched on window for component communication. */
class State {
    /** @type {Set<string>} */
    #allSongs
    /** @type {Set<string>} */
    #visibleSongs
    /** @type {string} */
    #currentSong

    /** Create the state manager. */
    constructor() {
        this.#allSongs = new Set();
        this.#visibleSongs = new Set();
        this.#currentSong = '';
    }

    /** Gets all registered songs.
     *  @returns {string[]} All songs. */
    get allSongs() {
        return Array.from(this.#allSongs);
    }

    /** Gets currently visible songs.
     *  @returns {string[]} Visible songs. */
    get visibleSongs() {
        return Array.from(this.#visibleSongs);
    }

    /** Gets the current song.
     *  @returns {string} Current song. */
    get currentSong() {
        return this.#currentSong;
    }

    /** Registers songs into the state.
     *  @param {string[]} songs - Songs to register. */
    registerSongs(songs) {
        songs.forEach(song => {
            this.#allSongs.add(song);
            this.#visibleSongs.add(song);
        });

        // deselect songs previously deselected
        const deselected = this.#loadDeselectedSongs();
        deselected.forEach(song => {
            if (this.#allSongs.has(song)) {
                this.#visibleSongs.delete(song);
            }
        });

        this.#dispatchVisibleSongsChanged();
    }

    /** Toggles a song's visibility.
     *  @param {string} song - The song to toggle.
     *  @param {boolean} isVisible - Whether the song should be visible. */
    toggleSongVisibility(song, isVisible) {
        if (isVisible) {
            this.#visibleSongs.add(song);
        } else {
            this.#visibleSongs.delete(song);
        }
        this.#saveDeselectedSongs();
        this.#dispatchVisibleSongsChanged();
    }

    /** Sets the current song.
     *  @param {string} song - The song to set as current. */
    setCurrentSong(song) {
        this.#currentSong = song;
        this.#dispatchCurrentSongChanged();
    }

    /** Saves deselected songs to cookies. */
    #saveDeselectedSongs() {
        const deselected = this.allSongs.filter(song => !this.#visibleSongs.has(song));
        document.cookie = `deselectedSongs=${JSON.stringify(deselected)}; path=/; max-age=31536000`;
    }

    /** Loads deselected songs from cookies.
     *  @returns {string[]} Array of deselected song keys. */
    #loadDeselectedSongs() {
        const match = document.cookie.match(/deselectedSongs=([^;]+)/);
        return match ? JSON.parse(decodeURIComponent(match[1])) : [];
    }

    /** Dispatches visible songs changed event. */
    #dispatchVisibleSongsChanged() {
        window.dispatchEvent(new CustomEvent('stateVisibleSongsChanged', {
            detail: { songs: this.visibleSongs }
        }));
    }

    /** Dispatches current song changed event. */
    #dispatchCurrentSongChanged() {
        window.dispatchEvent(new CustomEvent('stateCurrentSongChanged', {
            detail: { song: this.#currentSong }
        }));
    }
}

export default new State();
