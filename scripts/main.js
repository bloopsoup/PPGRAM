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
        const [pickedStatus, pickedName, pickedDate] = [document.getElementById('picked-status'), document.getElementById('picked-name'), document.getElementById('picked-date')];
        const [statsRecent, statsSummaryHeader, statsSummary, statsPie] = [document.getElementById('stats-recent'), document.getElementById('stats-summary-header'), document.getElementById('stats-summary'), document.getElementById('stats-pie')];

        if (pickedStatus) pickedStatus.textContent = 'victim';
        if (pickedName) pickedName.textContent = chosenName;
        if (pickedDate) pickedDate.textContent = new Date().toLocaleString();

        if (statsSummaryHeader) statsSummaryHeader.textContent = `stats (TOTAL ${names.length}) (SUS ${sus.toFixed(2)}%)`
        statsRecent?.setAttribute('items', names.slice(1, 6).join(','));
        statsSummary?.setAttribute('items', names.join(','));
        statsPie?.setAttribute('items', names.join(','));
    }
}

setInterval(() => Main.update(), 1000);
