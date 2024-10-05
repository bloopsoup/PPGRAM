/** Seeded RNG management.
 *  @author bloopsoup */
export default class Randumb {
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

    /** Computes the gamma function using the Lanczos approximation.
     *  @param {number} z - The input value for the gamma function.
     *  @returns {number} The gamma function value. */
    static #gamma(z) {
        const g = 7;
        const p = [
            0.99999999999980993, 676.5203681218851, -1259.1392167224028,
            771.32342877765313, -176.61502916214059, 12.507343278686905,
            -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
        ];
        if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * Randumb.#gamma(1 - z));
        
        z -= 1;
        let x = p[0];
        for (let i = 1; i < g + 2; i++) x += p[i] / (z + i);
        const t = z + g + 0.5;
        return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
    }

    /** Computes the lower incomplete gamma function.
     *  @param {number} s - The shape parameter of the gamma function.
     *  @param {number} x - The upper limit of integration.
     *  @returns {number} The value of the lower incomplete gamma function. */
    static #lowerIncompleteGamma(s, x) {
        let sum = 1 / s;
        let term = 1 / s;
        for (let n = 1; n < 100; n++) {
            term *= x / (s + n);
            sum += term;
            if (term < sum * 1e-15) break;
        }
        return sum * Math.exp(-x + s * Math.log(x));
    }

    /** Computes the chi-square cumulative distribution function (CDF).
     *  @param {number} x - The chi-square statistic.
     *  @param {number} k - The degrees of freedom.
     *  @returns {number} The value of the CDF. */
    static #chiSquareCDF(x, k) {
        if (x < 0 || k <= 0) return 0;
        return Randumb.#lowerIncompleteGamma(k / 2, x / 2) / Randumb.#gamma(k / 2);
    }

    /** Computes the chi-square p-value.
     *  @param {number} chiSquareStatistic - The chi-square statistic.
     *  @param {number} degreesOfFreedom - The degrees of freedom (number of categories minus 1).
     *  @returns {number} The p-value. */
    static #chiSquaredDistribution(chiSquareStatistic, degreesOfFreedom) {
        return 1 - Randumb.#chiSquareCDF(chiSquareStatistic, degreesOfFreedom);
    }

    /** Picks a random element from a list.
     *  {@link https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript StackOverflow}
     *  @param {string[]} lst - The list to pick from.
     *  @param {number} seed - The seed.
     *  @returns {string} The chosen element. */
    static getChoice(lst, seed) {
        const rand = Randumb.#sfc32(0x9E3779B9, 0x243F6A88, 0xB7E15162, seed);
        for (let i = 0; i < 15; i++) rand();
        return lst[Math.floor(rand() * lst.length)];
    }

    /** Gets a random color.
     *  @param {number} seed - The seed.
     *  @returns {string} A random color. */
    static getColor(seed) {
        const rgb = [];
        const rand = Randumb.#sfc32(0x9E3779B9, 0x243F6A88, 0xB7E15162, seed);
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 15; j++) rand();
            rgb.push(Math.floor(rand() * 255));
        }
        return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`; 
    }

    /** Gets the p value given counts of each item and weights of each item
     *  @param {number[]} counts - The integer counts of each category.
     *  @param {number[]} weights - The normalized weight of each category. */
    static getSignificance(counts, weights) {
        const total = counts.reduce((a, b) => a + b, 0)
        const chiSquareSatistic = counts.reduce((chiSq, observed, i) => {
            const expected = weights[i] * total;
            return chiSq + Math.pow(observed - expected, 2) / expected;
        }, 0);
        const pValue = Randumb.#chiSquaredDistribution(chiSquareSatistic, counts.length - 1)
        return pValue
    }
}
