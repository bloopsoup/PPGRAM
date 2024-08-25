/** Picks victims in a totally fair and unbiased way.
 *  @author gitdoge (initial version) and bloopsoup */
class Picker {
    /** @type {Date} */
    static #start = new Date(2024, 6, 31)
    /** @type {string[]} */
    static #names = ['cHRIS - mR oSU kING', 'walter', 'mrs. until', 'poopsicle'];
    /** @type {string} */
    static #statusDisplayID = 'status'
    /** @type {string} */
    static #pickedDisplayID = 'picked'
    /** @type {string} */
    static #dateDisplayID = 'date'
    /** @type {string} */
    static #recentDisplayID = 'recent'
    /** @type {string} */
    static #statsDisplayID = 'stats'
    /** @type {string} */
    static #pieDisplayID = 'pie'

    /** Magic black box math to make good random stuff.
     *  {@link https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript StackOverflow}
     *  {@link https://pracrand.sourceforge.net/ PractRand}
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

    /** Gets a random name.
     *  {@link https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript StackOverflow}
     *  @param {number} seed - The seed.
     *  @returns {string} The name. */
    static #getRandomName(seed) {
        const rand = Picker.#sfc32(0x9E3779B9, 0x243F6A88, 0xB7E15162, seed);
        for (let i = 0; i < 15; i++) rand();
        return this.#names[Math.floor(rand() * Picker.#names.length)];
    }

    /** Gets a random color.
     *  @param {number} seed - The seed.
     *  @returns {string} A random color. */
    static #getRandomColor(seed) {
        const rgb = [];
        const rand = Picker.#sfc32(0x9E3779B9, 0x243F6A88, 0xB7E15162, seed);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 15; j++) rand();
            rgb.push(Math.floor(rand() * 255));
        }
        return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`; 
    }

    /** Converts a date into the number of total days.
     *  @param {Date} date - The date. */
    static #getDays(date) {
        const yearStart = new Date(date.getFullYear(), 0, 0);
        const dayOfYear = Math.floor((date - yearStart) / (24 * 60 * 60 * 1000));
        return dayOfYear + date.getFullYear() * 365;
    }

    /** Displays text inside an element retrieved by ID.
     *  @param {string} id - The ID of the element displaying the text.
     *  @param {string} text - The text to show. */
    static #displayText(id, text) {
        const display = document.getElementById(id);
        if (display === null) return;
        display.textContent = text;
    }

    /** Displays the recently picked names in the RECENT section.
     *  @param {string[]} names - The names. */
    static #displayRecent(names) {
        const recentDisplay = document.getElementById(Picker.#recentDisplayID);
        if (recentDisplay === null) return;
        recentDisplay.replaceChildren();

        const header = document.createElement('h2');
        header.textContent = 'previous victims';
        recentDisplay.appendChild(header);

        names.forEach((name, i) => {
            const p = document.createElement('p');
            p.textContent = `-${i+1} ${name}`;
            recentDisplay.appendChild(p);
        });
    }

    /** Displays the lifetime stats of ALL picked names in the STATS section.
     *  @param {string[]} names - The names. */
    static #displayStats(names) {
        const counts = {};
        for (const name of names) {
            if (!(name in counts)) counts[name] = 0;
            counts[name] += 1
        }

        const statsDisplay = document.getElementById(Picker.#statsDisplayID);
        if (statsDisplay === null) return;
        statsDisplay.replaceChildren();

        const pieDisplay = document.getElementById(Picker.#pieDisplayID);
        if (pieDisplay === null) return;
        pieDisplay.replaceChildren();

        const header = document.createElement('h2');
        header.textContent = `stats (${names.length} total)`;
        statsDisplay.appendChild(header);

        const figure = document.createElement('figure');
        figure.classList.add('pie');
        pieDisplay.appendChild(figure);

        let colors = [];
        let current = 0;
        Object.keys(counts).sort((a, b) => counts[b] - counts[a]).forEach((name, i) => {
            const p = document.createElement('p');
            p.textContent = `${name} ${counts[name]}`;
            p.style.color = Picker.#getRandomColor(Math.floor(i + current));
            statsDisplay.appendChild(p);

            const percent = (counts[name] / names.length) * 100;
            colors.push(`${Picker.#getRandomColor(Math.floor(i + current))} ${current}% ${current + percent}%`);
            current += percent;
        });

        figure.style.background = `conic-gradient(${colors.join(', ')})`;
    }

    /** Updates the page. */
    static update() {
        const now = new Date();
        const days = this.#getDays(now);
        const total = days - this.#getDays(this.#start) - 1;

        const todayName = Picker.#getRandomName(days);
        const previousNames = Array.from({length: total}, (_, i) => Picker.#getRandomName(days - i - 1));

        Picker.#displayText(this.#statusDisplayID, 'victim');
        Picker.#displayText(this.#dateDisplayID, now.toLocaleString());
        Picker.#displayText(this.#pickedDisplayID, todayName);
        Picker.#displayRecent(previousNames.slice(0, 5));
        Picker.#displayStats(previousNames);
    }
}

setInterval(() => Picker.update(), 1000);
