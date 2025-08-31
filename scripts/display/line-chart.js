/** The line chart element.
 *  @augments HTMLElement */
export default class LineChart extends HTMLElement {
    constructor() { 
        super(); 
        this.resizeObserver = null;
    }
    
    connectedCallback() { 
        this.render(); 
        // Set up resize observer for responsive behavior
        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver(() => {
                requestAnimationFrame(() => this.render());
            });
            this.resizeObserver.observe(this);
        }
    }

    disconnectedCallback() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    /** @returns {string[]} The attributes. */
    static get observedAttributes() { return ['values', 'min', 'max']; }

    /** Callback that is ran when an attribute is changed.
     *  @param {string} name - The name. 
     *  @param {string} oldValue - The old value.
     *  @param {string} newValue - The new value. */
    attributeChangedCallback(name, oldValue, newValue) {
        if (!LineChart.observedAttributes.includes(name)) return;
        if (oldValue === newValue) return;
        this.render();
    }

    /** Renders the element. */
    render() {
        const valuesAttr = this.getAttribute('values');
        const minAttr = this.getAttribute('min');
        const maxAttr = this.getAttribute('max');
        
        if (valuesAttr === null) {
            this.innerHTML = '';
            return;
        }

        const values = valuesAttr.split(',').map(v => parseFloat(v)).filter(v => !isNaN(v));
        const minVal = minAttr !== null ? parseFloat(minAttr) : Math.min(...values, 0);
        const maxVal = maxAttr !== null ? parseFloat(maxAttr) : Math.max(...values, 100);

        // Create canvas if it doesn't exist
        let canvas = this.querySelector('canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.style.width = '100%';
            canvas.style.height = 'clamp(160px, 25vw, 400px)';
            canvas.style.display = 'block';
            // Make the custom element not take up space - canvas handles all layout
            this.style.display = 'contents';
            this.appendChild(canvas);
        }

        const ctx = canvas.getContext('2d');
        const cssWidth = canvas.clientWidth || (canvas.parentElement?.clientWidth ?? 400);
        const cssHeight = canvas.clientHeight || parseInt(getComputedStyle(canvas).height) || 160;
        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.floor(cssWidth * ratio);
        canvas.height = Math.floor(cssHeight * ratio);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.clearRect(0, 0, cssWidth, cssHeight);

        if (!values.length) {
            ctx.fillStyle = '#888';
            ctx.font = '12px sans-serif';
            ctx.fillText('No data', 10, 20);
            return;
        }

        const padding = { left: 40, right: 10, top: 10, bottom: 24 };
        const w = cssWidth;
        const h = cssHeight;
        const innerW = w - padding.left - padding.right;
        const innerH = h - padding.top - padding.bottom;

        // grid + labels
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '12px sans-serif';
        const ticks = [Math.round((minVal + maxVal) / 2), Math.round((minVal + maxVal) * .9)];
        ticks.forEach(t => {
            const y = padding.top + (1 - (t - minVal) / (maxVal - minVal)) * innerH;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(w - padding.right, y);
            ctx.stroke();
            ctx.fillText(String(t), 6, y + 4);
        });
        // max value line
        const topY = padding.top + (1 - (maxVal - minVal) / (maxVal - minVal)) * innerH;
        ctx.beginPath();
        ctx.moveTo(padding.left, topY);
        ctx.lineTo(w - padding.right, topY);
        ctx.stroke();
        ctx.fillText("jail", 6, topY + 4);

        // line
        ctx.beginPath();
        for (let i = 0; i < values.length; i++) {
            const x = padding.left + (i / Math.max(1, values.length - 1)) * innerW;
            const v = Math.max(minVal, Math.min(maxVal, values[i]));
            const y = padding.top + (1 - (v - minVal) / (maxVal - minVal)) * innerH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        
        // Add glow effect
        ctx.shadowColor = 'rgb(255, 202, 237)';
        ctx.shadowBlur = 10;
        ctx.strokeStyle = 'rgb(255, 202, 237)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Reset shadow for points
        ctx.shadowBlur = 0;

        // points
        ctx.fillStyle = 'rgb(255, 202, 237)';
        ctx.shadowColor = 'rgb(255, 202, 237)';
        ctx.shadowBlur = 5;
        for (let i = 0; i < values.length; i++) {
            const x = padding.left + (i / Math.max(1, values.length - 1)) * innerW;
            const v = Math.max(minVal, Math.min(maxVal, values[i]));
            const y = padding.top + (1 - (v - minVal) / (maxVal - minVal)) * innerH;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Reset shadow
        ctx.shadowBlur = 0;
    }
}

customElements.define('p-line-chart', LineChart);
