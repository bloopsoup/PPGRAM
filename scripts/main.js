import { Calendar, Counter, Stacked } from './common/index.js';
import * as display from "./display/index.js";

/** Picks victims in a totally fair and unbiased way.
 *  @author git-doge (initial version) and bloopsoup */
export default class Main {
    /** Initializes the page. */
    static init() { document.getElementById('dialog')?.focus(); }

    /**
     * Handle a keyboard enter press.
     * @param {KeyboardEvent} e - The keyboard event.
     */
    static handleEnter(e) { if (e.key === 'Enter') Main.run(); }

    /** Runs the page. */
    static run() {
        // Hide the dialog
        const dialog = document.getElementById('dialog');
        if (dialog) {
            dialog.style.transition = 'opacity 4s ease';
            dialog.style.opacity = '0';
            dialog.style.pointerEvents = 'none';
            dialog.addEventListener('transitionend', () => dialog.style.display = 'none', { once: true });
        }

        // Display layout elements
        document.querySelectorAll('header').forEach(element => element.removeAttribute('style'));
        document.querySelectorAll('main').forEach(element => element.removeAttribute('style'));
        document.querySelectorAll('footer').forEach(element => element.removeAttribute('style'));

        // Display static elements
        const [pickedStatus, pickedImage] = [document.getElementById('picked-status'), document.getElementById('picked-image')];
        if (pickedStatus) pickedStatus.textContent = 'victim';
        pickedImage?.removeAttribute('hidden');
        
        // Play audio
        // @ts-ignore
        document.getElementById('background-audio')?.play();

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
        for (let day = Calendar.totalDaysAtStart+1; day <= Calendar.totalTodayDays; day++) {
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
        const [statsRecent, statsSummaryHeader, statsSummary, statsPie, statsLineChart] = [document.getElementById('stats-recent'), document.getElementById('stats-summary-header'), document.getElementById('stats-summary'), document.getElementById('stats-pie'), document.getElementById('stats-line-chart')];

        if (pickedName) pickedName.textContent = chosenName;
        if (pickedDate) pickedDate.textContent = new Date().toLocaleString();

        if (statsSummaryHeader) statsSummaryHeader.textContent = `stats (TOTAL ${names.length}) (SUS ${sus.toFixed(2)}%)`
        statsRecent?.setAttribute('items', names.slice(1, 6).join(','));
        statsSummary?.setAttribute('items', names.join(','));
        statsPie?.setAttribute('items', names.join(','));
        statsLineChart?.setAttribute('values', susValues.join(','));
        statsLineChart?.setAttribute('min', '0');
        statsLineChart?.setAttribute('max', '100');
    }
}
