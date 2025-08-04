/** Just text.
 *  @author bloopsoup */
export default class Text {
    /** @type {HTMLElement | null} */
    #container

    /** Create the text display.
     *  @param {string} id - The ID. */
    constructor(id) { this.#container = document.getElementById(id); }

    /** Displays text.
     *  @param {string} text - The text. */
    display(text) {
        if (this.#container === null) return;
        this.#container.textContent = text;
    }
}
