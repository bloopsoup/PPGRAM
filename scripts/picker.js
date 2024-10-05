import Randumb from './randumb.js'

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
    /** @type {number} */
    static #susThreshold = .95

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

        let header = document.createElement('h2');
        header.textContent = `stats (${names.length} total)`;
        statsDisplay.appendChild(header);

        const weights = Array.from({ length: Picker.#names.length }, () => 1.0 / Picker.#names.length)
        const pValue = Randumb.getSignificance(Object.keys(counts).map((key) => counts[key]), weights)
        const sus = ((1 - pValue) / Picker.#susThreshold) * 100;
        header = document.createElement('h2');
        header.textContent = `sus meter ${sus.toFixed(2)}% (p=${pValue.toFixed(2)})`;
        statsDisplay.appendChild(header);

        const figure = document.createElement('figure');
        figure.classList.add('pie');
        pieDisplay.appendChild(figure);

        let colors = [];
        let current = 0;
        Object.keys(counts).sort((a, b) => counts[b] - counts[a]).forEach((name, i) => {
            const p = document.createElement('p');
            p.textContent = `${name} ${counts[name]}`;
            p.style.color = Randumb.getColor(Math.floor(i + current));
            statsDisplay.appendChild(p);

            const percent = (counts[name] / names.length) * 100;
            colors.push(`${Randumb.getColor(Math.floor(i + current))} ${current}% ${current + percent}%`);
            current += percent;
        });

        figure.style.background = `conic-gradient(${colors.join(', ')})`;
    }

    /** Updates the page. */
    static update() {
        const now = new Date();
        const days = this.#getDays(new Date(now.getTime() + 60 * 60 * 1000));
        const total = days - this.#getDays(this.#start);

        const todayName = Randumb.getChoice(this.#names, days);
        const previousNames = Array.from({length: total}, (_, i) => Randumb.getChoice(this.#names, days - i));

        Picker.#displayText(this.#statusDisplayID, 'victim');
        Picker.#displayText(this.#dateDisplayID, now.toLocaleString());
        Picker.#displayText(this.#pickedDisplayID, todayName);
        Picker.#displayRecent(previousNames.slice(1, 6));
        Picker.#displayStats(previousNames);
    }
}

setInterval(() => Picker.update(), 1000);
