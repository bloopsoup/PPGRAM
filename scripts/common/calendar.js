/** Date management.
 *  @author bloopsoup */
export default class Calendar {
    /** @type {number} */
    static #millisecondsInHour = 60 * 60 * 1000
    /** @type {number} */
    static #millisecondsInDay = 24 * this.#millisecondsInHour
    /** @type {Date} */
    static #start = new Date(2024, 6, 31)

    /** Whether daylight savings is occurring on the given date.
     *  {@link https://stackoverflow.com/a/30280636 StackOverflow}
     *  @param {Date} date - The date.
     *  @returns {boolean} The result. */
    static #hasDaylightSavings(date) {
        let janOffset = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
        let julOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
        return Math.max(janOffset, julOffset) !== date.getTimezoneOffset();    
    }

    /** Converts a date into the number of total days.
     *  @param {Date} date - The date. */
    static #getTotalDays(date) {
        const yearStart = new Date(date.getFullYear(), 0, 0);
        const dayOfYear = Math.floor((date.getTime() - yearStart.getTime()) / this.#millisecondsInDay);
        return dayOfYear + date.getFullYear() * 365;
    }

    /** @returns {Date} Today's date adjusted for daylight savings. */
    static get #today() {
        const now = new Date();
        return this.#hasDaylightSavings(now) ? new Date(now.getTime() + this.#millisecondsInHour) : now;
    }

    /** @returns {number} The total number of days until today. */
    static get totalTodayDays() { return this.#getTotalDays(this.#today); }

    /** @returns {number} The total number of elapsed days. */
    static get totalElapsedDays() { return this.#getTotalDays(this.#today) - this.#getTotalDays(this.#start); }

    /** @returns {number} The total number of days at start. */
    static get totalDaysAtStart() { return this.#getTotalDays(this.#start); }
}
