/** It counts.
 *  @author bloopsoup */
export default class Counter {
    /** @type {Record<string, number>} */
    #data
    /** @type {number} */
    #total

    /** Create the counter.
     *  @param {string[]} items - The items to count. */
    constructor(items) {
        this.#data = {};
        this.#total = 0;
        items.forEach(item => this.add(item));
    }

    /** Add the item to the counter.
     *  @param {string} item - The item to add. */
    add(item) {
        if (!(item in this.#data)) this.#data[item] = 0;
        this.#data[item]++;
        this.#total++;
    }

    /** @returns {number} The total. */
    get total() { return this.#total; }

    /** @returns {number[]} All counts. */
    get counts() { return Object.keys(this.#data).map(key => this.#data[key]); }

    /** Gets the count for a key.
     *  @param {string} key - The key. 
     *  @returns {number} The count. */
    count(key) {
        if (!(key in this.#data)) return 0;
        return this.#data[key];
    }

    /** Iterates through the counter based on percents with a callback.
     *  @param {(key: string, i: number, current: number, percent: number) => void} callback - The callback to use. */
    forEachPercent(callback) {
        let current = 0;
        Object.keys(this.#data).sort((a, b) => this.#data[b] - this.#data[a]).forEach((key, i) => {
            const percent = (this.#data[key] / this.#total) * 100;
            callback(key, i, current, percent);
            current += percent;
        });
    }
}
