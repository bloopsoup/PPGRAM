import { Calendar, Counter, Stacked } from './common/index.js';
import * as display from "./display/index.js";

/** Picks victims in a totally fair and unbiased way.
 *  @author gitdoge (initial version) and bloopsoup */
class Main {
    /** Updates the page. */
    static update() {
        const nameChoices = ['cHRIS - mR oSU kING', 'walter', 'mrs. until', 'poopsicle'];
        const chosenName = Stacked.getChoice(nameChoices, Calendar.totalTodayDays);
        const names = Array.from({length: Calendar.totalElapsedDays}, (_, i) => Stacked.getChoice(nameChoices, Calendar.totalTodayDays - i));
        const counter = new Counter(names);
        
        const weights = Array.from({ length: nameChoices.length }, () => 1.0 / nameChoices.length);
        const pValue = Stacked.getSignificance(counter.counts, weights);
        const sus = ((1 - pValue) / .95) * 100;

        // Display the elements
        document.querySelector('pp-pick')?.setAttribute('name', chosenName);
        document.querySelector('pp-pick')?.setAttribute('date', new Date().toLocaleString());
        document.querySelector('pp-list')?.setAttribute('name', 'previous victims');
        document.querySelector('pp-list')?.setAttribute('items', names.slice(1, 6).join(','));
        document.querySelector('pp-stats')?.setAttribute('headers', [`stats (${names.length} total)`, `sus meter ${sus.toFixed(2)}% (p=${pValue.toFixed(2)})`].join(','));
        document.querySelector('pp-stats')?.setAttribute('items', names.join(','));
        document.querySelector('pp-pie-chart')?.setAttribute('items', names.join(','));
    }
}

setInterval(() => Main.update(), 1000);
