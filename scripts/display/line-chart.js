/** The line chart element.
 *  @augments HTMLElement
 *  @author qxbytes */
export default class LineChart extends HTMLElement {
    /** @type {{left: number; right: number; top: number; bottom: number}} */
    #padding = { left: 40, right: 10, top: 10, bottom: 24 };
    /** @type {ResizeObserver} */
    #resizeObserver
    /** @type {HTMLCanvasElement} */
    #canvas
    /** @type {CanvasRenderingContext2D} */
    #context

    /** Create the element. */
    constructor() { 
        super();
        this.style.display = 'contents';
        this.#resizeObserver = new ResizeObserver(() => requestAnimationFrame(() => this.#render()));

        this.#canvas = this.#createCanvas();
        const context = this.#canvas.getContext('2d');
        if (context === null) throw new Error('Failed to get 2D canvas context.');
        else this.#context = context;
        this.appendChild(this.#canvas);
    }

    /** @returns {string[]} The attributes. */
    static get observedAttributes() { return ['values', 'min', 'max']; }
    
    /** Callback that is ran on DOM insertion. */
    connectedCallback() {
        this.#resizeObserver.observe(this.#canvas);
        this.#render();
    }

    /** Callback that is ran on DOM removal. */
    disconnectedCallback() { this.#resizeObserver.disconnect(); }

    /** Callback that is ran when an attribute is changed.
     *  @param {string} name - The name. 
     *  @param {string} oldValue - The old value.
     *  @param {string} newValue - The new value. */
    attributeChangedCallback(name, oldValue, newValue) {
        if (!LineChart.observedAttributes.includes(name)) return;
        if (oldValue === newValue) return;

        this.#render();
    }

    /** Creates a canvas element.
     *  @returns {HTMLCanvasElement} The canvas element. */
    #createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.className = 'line-chart';
        canvas.ariaLabel = 'line chart';
        return canvas;
    }

    /** Draws a no data notice. */
    #drawNotice() {
        this.#context.save();

        this.#context.font = '12px sans-serif';
        this.#context.fillStyle = '#888';

        this.#context.fillText('No data', 10, 20);

        this.#context.restore();
    }

    /** Draws a grid.
     *  @param {number} width - The width.
     *  @param {number} height - The height.
     *  @param {number} min - The minimum value.
     *  @param {number} max - The max value. */
    #drawGrid(width, height, min, max) {
        const innerHeight = height - this.#padding.top - this.#padding.bottom;
        const ticks = [Math.round((min + max) / 2), Math.round((min + max) * .9), max];

        this.#context.save();

        this.#context.font = '12px sans-serif';
        this.#context.lineWidth = 1;
        this.#context.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.#context.strokeStyle = 'rgba(255, 255, 255, 0.1)';

        for (const tick of ticks) {
            const y = this.#padding.top + (1 - (tick - min) / (max - min)) * innerHeight;
            this.#context.beginPath();
            this.#context.moveTo(this.#padding.left, y);
            this.#context.lineTo(width - this.#padding.right, y);
            this.#context.stroke();
            this.#context.fillText("jail", 6, y + 4);
        }

        this.#context.restore();
    }

    /** Draws a plotted line.
     *  @param {number} width - The width.
     *  @param {number} height - The height.
     *  @param {number} min - The minimum value.
     *  @param {number} max - The max value.
     *  @param {number[]} values - The values. */
    #drawPlotLine(width, height, min, max, values) {
        const innerWidth = width - this.#padding.left - this.#padding.right;
        const innerHeight = height - this.#padding.top - this.#padding.bottom;

        this.#context.save();

        // Draw the line
        this.#context.lineWidth = 2;
        this.#context.shadowBlur = 10;
        this.#context.strokeStyle = 'rgb(255, 202, 237)';
        this.#context.shadowColor = 'rgb(255, 202, 237)';

        this.#context.beginPath();
        for (let i = 0; i < values.length; i++) {
            const x = this.#padding.left + (i / Math.max(1, values.length - 1)) * innerWidth;
            const v = Math.max(min, Math.min(max, values[i]));
            const y = this.#padding.top + (1 - (v - min) / (max - min)) * innerHeight;

            if (i === 0) this.#context.moveTo(x, y);
            else this.#context.lineTo(x, y);
        }
        this.#context.stroke();
        
        // Draw the dots
        this.#context.shadowBlur = 5;
        this.#context.fillStyle = 'rgb(255, 202, 237)';
        this.#context.shadowColor = 'rgb(255, 202, 237)';

        for (let i = 0; i < values.length; i++) {
            const x = this.#padding.left + (i / Math.max(1, values.length - 1)) * innerWidth;
            const v = Math.max(min, Math.min(max, values[i]));
            const y = this.#padding.top + (1 - (v - min) / (max - min)) * innerHeight;

            this.#context.beginPath();
            this.#context.arc(x, y, 2, 0, Math.PI * 2);
            this.#context.fill();
        }
        
        this.#context.restore();
    }

    /** Renders the element. */
    #render() {
        // Initialize a ton of values
        const valuesAttribute = this.getAttribute('values');
        const minAttribute = this.getAttribute('min');
        const maxAttribute = this.getAttribute('max');
        if (valuesAttribute === null) return;

        const values = valuesAttribute.split(',').map(v => parseFloat(v)).filter(v => !isNaN(v));
        const min = minAttribute !== null ? parseFloat(minAttribute) : Math.min(...values, 0);
        const max = maxAttribute !== null ? parseFloat(maxAttribute) : Math.max(...values, 100);

        const cssWidth = this.#canvas.clientWidth || (this.#canvas.parentElement?.clientWidth ?? 400);
        const cssHeight = this.#canvas.clientHeight || parseInt(getComputedStyle(this.#canvas).height) || 160;
        const ratio = window.devicePixelRatio || 1;

        // Adjust the canvas
        this.#canvas.width = Math.floor(cssWidth * ratio);
        this.#canvas.height = Math.floor(cssHeight * ratio);
        this.#context.setTransform(ratio, 0, 0, ratio, 0, 0);

        // Draw
        this.#context.clearRect(0, 0, cssWidth, cssHeight);
        if (!values.length) { this.#drawNotice(); return; }
        this.#drawGrid(cssWidth, cssHeight, min, max);
        this.#drawPlotLine(cssWidth, cssHeight, min, max, values);
    }
}

customElements.define('p-line-chart', LineChart);
