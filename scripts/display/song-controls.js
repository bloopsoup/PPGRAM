import { SongManager } from '../managers/index.js';

/** The song controls element.
 *  @augments HTMLElement
 *  @author bloopsoup */
export default class SongControls extends HTMLElement {
    /** @type {SongManager | null} */
    #manager
    /** @type {HTMLButtonElement} */
    #playButton
    /** @type {HTMLButtonElement} */
    #skipButton
    /** @type {HTMLDivElement} */
    #timeline
    /** @type {HTMLElement} */
    #songName
    /** @type {HTMLTimeElement} */
    #currentTime
    /** @type {HTMLTimeElement} */
    #duration
    /** @type {number | null} */
    #timer

    /** Create the element. */
    constructor() {
        super();
        this.style.display = 'contents';
        this.render = this.render.bind(this);

        this.#manager = null;
        this.#timer = null;

        const panel = document.createElement('div');
        panel.className = 'panel';
        panel.role = 'region';
        panel.ariaLabel = 'song controls';

        const track = document.createElement('div');
        track.className = 'track';
        this.#songName = document.createElement('strong');
        this.#songName.className = 'song-name';
        this.#songName.textContent = 'SONG?';
        track.appendChild(this.#songName);

        const transport = document.createElement('div');
        transport.className = 'transport';
        this.#playButton = this.#createButton('play', 'play');
        this.#playButton.dataset.playing = 'false';
        this.#playButton.append(
            this.#createIcon('M8 5v14l11-7z', 'icon-play'),
            this.#createIcon('M6 19h4V5H6v14zm8-14v14h4V5h-4z', 'icon-pause')
        );
        this.#skipButton = this.#createButton('skip', 'skip to a random song');
        this.#skipButton.appendChild(this.#createIcon('M6 18l8.5-6L6 6v12zm9-12v12h2V6h-2z'));
        transport.append(this.#playButton, this.#skipButton);

        this.#currentTime = this.#createTime('current');
        this.#timeline = document.createElement('div');
        this.#timeline.className = 'timeline';
        this.#timeline.role = 'progressbar';
        this.#timeline.ariaLabel = 'song progress';
        this.#timeline.ariaValueMin = '0';
        this.#timeline.ariaValueMax = '0';
        this.#timeline.ariaValueNow = '0';
        const timelineFill = document.createElement('div');
        timelineFill.className = 'timeline-fill';
        this.#timeline.appendChild(timelineFill);
        this.#duration = this.#createTime('duration');

        panel.append(track, transport, this.#currentTime, this.#timeline, this.#duration);
        this.appendChild(panel);

        this.#playButton.addEventListener('click', () => this.#manager?.togglePlayback());
        this.#skipButton.addEventListener('click', () => this.#manager?.setRandomSong());
    }

    /** Creates a control button.
     *  @param {string} className - The class name.
     *  @param {string} ariaLabel - The accessible label.
     *  @returns {HTMLButtonElement} The button element. */
    #createButton(className, ariaLabel) {
        const button = document.createElement('button');
        button.className = className;
        button.type = 'button';
        button.ariaLabel = ariaLabel;
        return button;
    }

    /** Creates an SVG icon.
     *  @param {string} pathData - The path data.
     *  @param {string} className - The class name.
     *  @returns {SVGSVGElement} The icon element. */
    #createIcon(pathData, className = '') {
        const namespace = 'http://www.w3.org/2000/svg';
        const icon = document.createElementNS(namespace, 'svg');
        if (className) icon.classList.add(className);
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('aria-hidden', 'true');
        const path = document.createElementNS(namespace, 'path');
        path.setAttribute('d', pathData);
        icon.appendChild(path);
        return icon;
    }

    /** Creates a time element.
     *  @param {string} className - The class name.
     *  @returns {HTMLTimeElement} The time element. */
    #createTime(className) {
        const time = document.createElement('time');
        time.className = className;
        time.textContent = '00:00';
        return time;
    }

    /** Callback that is ran on DOM insertion. */
    connectedCallback() {
        if (this.#timer === null) this.#timer = window.setInterval(this.render, 250);
    }

    /** Callback that is ran on DOM removal. */
    disconnectedCallback() {
        if (this.#timer !== null) window.clearInterval(this.#timer);
        this.#timer = null;
    }

    /** Links the controls to the centralized manager.
     *  @param {SongManager} manager - The song manager. */
    link(manager) {
        this.#manager = manager;
        manager.register(this.render);
        this.render();
    }

    /** Renders the element. */
    render() {
        if (this.#manager === null) return;

        const duration = this.#manager.duration;
        const currentTime = Math.min(this.#manager.currentTime, duration || 0);
        const isPlaying = this.#manager.isPlaying;
        const song = this.#manager.currentSong;

        this.#songName.textContent = song || 'SONG?';
        this.#songName.title = song;
        this.#playButton.dataset.playing = String(isPlaying);
        this.#playButton.ariaLabel = isPlaying ? 'pause' : 'play';
        const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
        this.#timeline.style.setProperty('--progress', `${progress}%`);
        this.#timeline.ariaValueMax = String(duration);
        this.#timeline.ariaValueNow = String(currentTime);
        this.#currentTime.textContent = SongControls.#formatTime(currentTime);
        this.#duration.textContent = SongControls.#formatTime(duration);
    }

    /** Formats seconds as a clock value.
     *  @param {number} seconds - Time in seconds.
     *  @returns {string} The formatted time. */
    static #formatTime(seconds) {
        const total = Math.max(0, Math.floor(seconds));
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const remainder = total % 60;
        const clock = `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
        return hours > 0 ? `${hours}:${clock}` : clock;
    }
}

customElements.define('p-song-controls', SongControls);
