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
    /** (1 - Value) is the p value, .95 = .05 p value
     *  @type {number} */
    static #susThreshold = .95

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

    /** Gets the probability of achieving this distribution.
     *  {@link https://en.wikipedia.org/wiki/Stirling%27s_approximation Stirling's Approximation}
     *  @param {Object<string, number>} counts - The counts.
     *  @param {number} total - The total.
     *  @returns {number} The probability. */
    static #getProbability(counts, total) {
        const lgamma = num => num * Math.log(num) - num + 0.5 * Math.log(2 * Math.PI * num);
        let coefficient = lgamma(total);
        for (const name in counts) coefficient -= lgamma(counts[name]);
        return Math.exp(coefficient - total * Math.log(this.#names.length)) * 100;
    }

    /**
     * Computes the gamma function using the Lanczos approximation.
     * @param {number} z - The input value for the gamma function.
     * @returns {number} The gamma function value.
     */
    static #gamma(z) {
        const g = 7;
        const p = [
            0.99999999999980993, 676.5203681218851, -1259.1392167224028,
            771.32342877765313, -176.61502916214059, 12.507343278686905,
            -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
        ];

        if (z < 0.5) {
            return Math.PI / (Math.sin(Math.PI * z) * Picker.#gamma(1 - z));
        } else {
            z -= 1;
            let x = p[0];
            for (let i = 1; i < g + 2; i++) {
                x += p[i] / (z + i);
            }
            const t = z + g + 0.5;
            return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
        }
    }

    /**
     * Computes the lower incomplete gamma function.
     * @param {number} s - The shape parameter of the gamma function.
     * @param {number} x - The upper limit of integration.
     * @returns {number} The value of the lower incomplete gamma function.
     */
    static #lowerIncompleteGamma(s, x) {
        let sum = 1 / s;
        let term = 1 / s;

        for (let n = 1; n < 100; n++) {
            term *= x / (s + n);
            sum += term;
            if (term < sum * 1e-15) {
                break;
            }
        }

        return sum * Math.exp(-x + s * Math.log(x));
    }

    /**
     * Computes the chi-square cumulative distribution function (CDF).
     * @param {number} x - The chi-square statistic.
     * @param {number} k - The degrees of freedom.
     * @returns {number} The value of the CDF.
     */
    static #chiSquareCDF(x, k) {
        if (x < 0 || k <= 0) {
            return 0;
        }
        return Picker.#lowerIncompleteGamma(k / 2, x / 2) / Picker.#gamma(k / 2);
    }

    /**
     * Computes the chi-square p-value.
     * @param {number} chiSquareStatistic - The chi-square statistic.
     * @param {number} degreesOfFreedom - The degrees of freedom (number of categories minus 1).
     * @returns {number} The p-value.
     */
    static #chiSquaredDistribution(chiSquareStatistic, degreesOfFreedom) {
        return 1 - Picker.#chiSquareCDF(chiSquareStatistic, degreesOfFreedom);
    }

    /**
     * Gets the p value given counts of each item and weights of each item
     * @param {number[]} - The integer counts of each category
     * @param {number[]} - The normalized weight of each category
     * 
     */
    static #getSignificance(counts, weights) {
        const total = counts.reduce((a, b) => a + b, 0)
        const chiSquareSatistic = counts.reduce((chiSq, observed, i) => {
            const expected = weights[i] * total;
            return chiSq + Math.pow(observed - expected, 2) / expected;
        }, 0);
        const pValue = Picker.#chiSquaredDistribution(chiSquareSatistic, counts.length - 1)
        
        return pValue
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
        const pValue = Picker.#getSignificance(Object.keys(counts).map((key) => counts[key]), weights)
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
        const days = this.#getDays(new Date(now.getTime() + 60 * 60 * 1000));
        const total = days - this.#getDays(this.#start);

        const todayName = Picker.#getRandomName(days);
        const previousNames = Array.from({length: total}, (_, i) => Picker.#getRandomName(days - i));

        Picker.#displayText(this.#statusDisplayID, 'victim');
        Picker.#displayText(this.#dateDisplayID, now.toLocaleString());
        Picker.#displayText(this.#pickedDisplayID, todayName);
        Picker.#displayRecent(previousNames.slice(1, 6));
        Picker.#displayStats(previousNames);
    }
}

setInterval(() => Picker.update(), 1000);
