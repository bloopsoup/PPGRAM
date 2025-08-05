import { Calendar, Counter, Stacked } from './common/index.js';
import { PieChart, Stats, Text, TextList } from './display/index.js';

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
        new Text('status').display('victim');
        new Text('date').display(new Date().toLocaleString());
        new Text('picked').display(chosenName);
        new TextList('recent').display('previous victims', names.slice(1, 6));
        new Stats('stats').display([`stats (${names.length} total)`, `sus meter ${sus.toFixed(2)}% (p=${pValue.toFixed(2)})`], counter);
        new PieChart('pie').display(counter);
    }
}

setInterval(() => Main.update(), 1000);
