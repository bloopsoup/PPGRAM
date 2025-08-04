import { Calendar, Counter, Stacked } from './common/index.js';
import { PieChart, Stats, Text, TextList } from './display/index.js';

/** Picks victims in a totally fair and unbiased way.
 *  @author gitdoge (initial version) and bloopsoup */
class Picker {
    /** @type {string[]} */
    static #names = ['cHRIS - mR oSU kING', 'walter', 'mrs. until', 'poopsicle'];
    /** @type {Text} */
    static #status = new Text('status')
    /** @type {Text} */
    static #picked = new Text('picked')
    /** @type {Text} */
    static #date = new Text('date')
    /** @type {TextList} */
    static #recent = new TextList('recent')
    /** @type {Stats} */
    static #stats = new Stats('stats')
    /** @type {PieChart} */
    static #pieChart = new PieChart('pie')

    /** Updates the page. */
    static update() {
        const todayName = Stacked.getChoice(this.#names, Calendar.totalTodayDays);
        const names = Array.from({length: Calendar.totalElapsedDays}, (_, i) => Stacked.getChoice(this.#names, Calendar.totalTodayDays - i));
        const counter = new Counter(names);
        
        const weights = Array.from({ length: this.#names.length }, () => 1.0 / this.#names.length)
        const pValue = Stacked.getSignificance(counter.counts, weights)
        const sus = ((1 - pValue) / .95) * 100;

        this.#status.display('victim');
        this.#date.display(new Date().toLocaleString());
        this.#picked.display(todayName);
        this.#recent.display('previous victims', names.slice(1, 6));
        this.#stats.display([`stats (${names.length} total)`, `sus meter ${sus.toFixed(2)}% (p=${pValue.toFixed(2)})`], counter);
        this.#pieChart.display(counter);
    }
}

setInterval(() => Picker.update(), 1000);
