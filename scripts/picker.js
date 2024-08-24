/** Picks victims in a totally fair and unbiased way.
 *  @author gitdoge
 *  @author bloopsoup */
class Picker {
    /** @type {string[]} */
    static #names = ['cHRIS - mR oSU kING', 'walter', 'mrs. until', 'poopsicle'];
    /** @type {string} */
    static #statusDisplayID = 'status'
    /** @type {string} */
    static #pickedDisplayID = 'picked'
    /** @type {string} */
    static #dateDisplayID = 'date'
    /** @type {string} */
    static #historyDisplayID = 'history'

    /** Magic black box math to make good random stuff.
     *  {@link https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript StackOverflow}
     *  @param {number} a - Math.
     *  @param {number} b - Math.
     *  @param {number} c - Math.
     *  @param {number} d - Math.
     *  @return {CallableFunction} The random function. */
    static #sfc32(a, b, c, d) {
        return function() {
            a |= 0; b |= 0; c |= 0; d |= 0;
            const t = (a + b | 0) + d | 0;
            d = d + 1 | 0;
            a = b ^ b >>> 9;
            b = c + (c << 3) | 0;
            c = (c << 21 | c >>> 11);
            c = c + t | 0;
            return (t >>> 0) / 4294967296;
        }
    }

    /** Gets a random number.
     *  @param {number} seed - The seed.
     *  @returns {number} The random number. */
    static #getRandomNumber(seed) {
        const rand = Picker.#sfc32(0x9E3779B9, 0x243F6A88, 0xB7E15162, seed);
        for (let i = 0; i < 15; i++) rand();
        return Math.floor(rand() * 4);
    }

    /** Displays the recently picked names in the history section.
     *  @param {string[]} names - The names. */
    static #displayHistory(names) {
        const historyDisplay = document.getElementById(Picker.#historyDisplayID);
        if (historyDisplay === null) return;
        historyDisplay.replaceChildren();

        const header = document.createElement('h2');
        header.textContent = 'previous victims';
        historyDisplay.appendChild(header);

        names.forEach((name, i) => {
            const p = document.createElement('p');
            p.textContent = `-${i+1} ${name}`;
            historyDisplay.appendChild(p);
        });
    }

    /** Displays text inside an element retrieved by ID.
     *  @param {string} id - The ID of the element displaying the text.
     *  @param {string} text - The text to show. */
    static #displayText(id, text) {
        const display = document.getElementById(id);
        if (display === null) return;
        display.textContent = text;
    }

    /** Updates the page. */
    static update() {
        const now = new Date();
        const yearStart = new Date(now.getFullYear(), 0, 0);
        const dayOfYear = Math.floor((now - yearStart) / (24 * 60 * 60 * 1000));
        const days = dayOfYear + now.getFullYear() * 365;

        const todayName = Picker.#names[Picker.#getRandomNumber(days)];
        const previousNames = Array.from({length: 5}, (_, i) => Picker.#names[Picker.#getRandomNumber(days - i - 1)]);

        Picker.#displayText(this.#statusDisplayID, 'victim');
        Picker.#displayText(this.#dateDisplayID, now.toLocaleString());
        Picker.#displayText(this.#pickedDisplayID, todayName);
        Picker.#displayHistory(previousNames);
    }
}

setInterval(() => Picker.update(), 1000);
