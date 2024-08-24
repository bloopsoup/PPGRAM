/** Picks victims in a totally fair and unbiased way.
 *  @author gitdoge
 *  @author bloopsoup */
class Picker {
    /** @type {string} */
    static #url = `https://worldtimeapi.org/api/timezone/America/Los_Angeles`;
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
    static sfc32(a, b, c, d) {
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
    static getRandomNumber(seed) {
        const rand = Picker.sfc32(0x9E3779B9, 0x243F6A88, 0xB7E15162, seed);
        for (let i = 0; i < 15; i++) rand();
        return Math.floor(rand() * 4);
    }

    /** Displays the recently picked names in the history section.
     *  @param {string[]} names - The names. */
    static displayHistory(names) {
        const historyDisplay = document.getElementById(Picker.#historyDisplayID);
        if (historyDisplay === null) return;

        const header = document.createElement('h2');
        header.textContent = 'previous victims';
        historyDisplay.appendChild(header);

        names.forEach((name, i) => {
            const p = document.createElement('p');
            p.textContent = `-${i+1} ${name}`;
            p.classList.add(`floating${Math.floor(Math.random() * 3) + 1}`);
            historyDisplay.appendChild(p);
        });
    }

    /** Initializes the page. */
    static async initialize() {
        const data = await (await fetch(this.#url)).json();
        const currentTime = new Date(data.datetime);
        const daysAD = data.day_of_year + currentTime.getFullYear() * 365;

        const statusDisplay = document.getElementById(this.#statusDisplayID);
        if (statusDisplay === null) return;
        statusDisplay.textContent = 'victim';

        const dateDisplay = document.getElementById(this.#dateDisplayID);
        if (dateDisplay === null) return;
        dateDisplay.textContent = currentTime.toLocaleString();

        const todayName = Picker.#names[Picker.getRandomNumber(daysAD)];
        const previousNames = Array.from({length: 5}, (_, i) => Picker.#names[Picker.getRandomNumber(daysAD - i - 1)]);
        
        const pickedDisplay = document.getElementById(Picker.#pickedDisplayID);
        if (pickedDisplay === null) return;
        pickedDisplay.textContent = todayName;
        Picker.displayHistory(previousNames);
    }
}

Picker.initialize();
