/** A text list.
 *  @author bloopsoup */
export default class TextList {
    /** @type {HTMLElement | null} */
    #container

    /** Create the text list.
     *  @param {string} id - The ID. */
    constructor(id) { this.#container = document.getElementById(id); }
    
    /** Displays the text list.
     *  @param {string} header - The header.
     *  @param {string[]} items - The items. */
    display(header, items) {
        if (this.#container === null) return;
        this.#container.replaceChildren();

        // Header
        const headerElement = document.createElement('h2');
        headerElement.textContent = header;
        this.#container.appendChild(headerElement);

        // Items
        for (const entries of items.entries()) {
            const [i, item] = entries;
            const element = document.createElement('p');
            element.textContent = `-${i + 1} ${item}`;
            this.#container.appendChild(element);
        }
    }
}
