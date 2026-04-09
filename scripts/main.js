import { Calendar, Counter, Stacked } from './common/index.js';
import * as display from "./display/index.js";
import { SongManager } from "./managers/index.js";

/** Picks victims in a totally fair and unbiased way.
 *  @author git-doge (initial version)
 *  @author bloopsoup */
export default class Main {
    /** Handle a keyboard enter press.
     *  @param {KeyboardEvent} e - The keyboard event. */
    static handleEnter(e) { if (e.key === 'Enter') Main.run(); }

    /** Runs the page. */
    static run() {
        // @ts-ignore
        document.getElementById('intro-dialog')?.dismiss();

        // Display layout elements
        document.querySelectorAll('header').forEach(element => element.removeAttribute('style'));
        document.querySelectorAll('main').forEach(element => element.removeAttribute('style'));
        document.querySelectorAll('footer').forEach(element => element.removeAttribute('style'));

        // Wire the songs together
        const manager = new SongManager([
            'fallen',
            'lullaby',
            'cee',
            'mint',
            'rot',
            'suim',
            'away2',
            'yune3',
            'north',
            'crawl',
            'walk',
            'incense',
            'banjo',
            'waken',
            'relax',
            'pin',
            'clap',
            'sol',
            'lime',
            'frame',
            'waken1',
            'relax1',
            'cheese',
            'wound'
        ]);
        const elementIDs = [
            'intro-song',
            'peace-album',
            'up-album',
            'classic-album',
            'discount-album'
        ];

        for (const elementID of elementIDs) {
            // @ts-ignore
            document.getElementById(elementID)?.link(manager);
        }
        manager.setRandomSong();

        // Run update once and then set an interval
        Main.#update();
        setInterval(() => Main.#update(), 1000);
    }

    /** Updates the page. */
    static #update() {
        const nameChoices = ['cHRIS - mR oSU kING', 'walter', 'mrs. until', 'poopsicle'];
        const chosenName = Stacked.getChoice(nameChoices, Calendar.totalTodayDays);
        const names = Array.from({length: Calendar.totalElapsedDays}, (_, i) => Stacked.getChoice(nameChoices, Calendar.totalTodayDays - i));
        const counter = new Counter(names);
        
        // Calculate SUS exchange values
        const susCounter = new Counter([]);
        const susValues = [];
        const weights = Array.from({ length: nameChoices.length }, () => 1.0 / nameChoices.length);
        // Days included need to match day numbers used in 'names' above
        for (let day = Calendar.totalDaysAtStart + 1; day <= Calendar.totalTodayDays; day++) {
            const choice = Stacked.getChoice(nameChoices, day);
            susCounter.add(choice);
            const significance = Stacked.getSignificance(susCounter.counts, weights);
            susValues.push(((1 - significance) / .95) * 100)
        }

        // Today's SUS value
        const pValue = Stacked.getSignificance(counter.counts, weights);
        const sus = ((1 - pValue) / .95) * 100;

        // Display the elements
        const [pickedName, pickedDate] = [document.getElementById('picked-name'), document.getElementById('picked-date')];
        if (pickedName) pickedName.textContent = chosenName;
        if (pickedDate) pickedDate.textContent = new Date().toLocaleString();

        document.getElementById('recent-list')?.setAttribute('items', names.slice(1, 6).join(','));

        const [summaryHeader, summaryList, summaryPie] = [document.getElementById('summary-header'), document.getElementById('summary-list'), document.getElementById('summary-pie')];
        if (summaryHeader) summaryHeader.textContent = `stats (TOTAL ${names.length}) (SUS ${sus.toFixed(2)}%)`
        summaryList?.setAttribute('items', names.join(','));
        summaryPie?.setAttribute('items', names.join(','));
        
        document.getElementById('exchange-line')?.setAttribute('values', susValues.join(','));
    }
}
