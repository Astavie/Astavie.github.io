window.MathJax = {
    startup: {
        typeset: false
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const e = document.getElementById("rule");
    
    const rule = new Rule();
    e.appendChild(rule.html);
});

function addStringDiv(e, s) {
    const div = document.createElement("div");
    div.innerHTML = s;
    e.appendChild(div);
}

class Input {

    constructor(parent, content = "") {
        this.parent = parent;
        this.html = createEmpty(this);
        this.html.innerHTML = content;
    }

    next() {
        return this.parent.next();
    }

    update() {
        this.parent.update();
    }

    size() {
        return 1;
    }

}

class Rule {

    constructor(parent = undefined, content = "") {
        this.elements = [];
        this.parent = parent;

        this.html = document.createElement("div");
        this.html.classList.add("rule");
        if (!parent) {
            this.html.classList.add("root");
        }

        this.appendChild(new Input(this, content));
    }

    update() {
        this.parent?.update();
    }

    next() {
        return this.parent?.next();
    }

    addBracket(key, middle, end, insert = null) {
        const next = new Input(this, end);
        const bracketed = new Bracketed(this, next, key, middle);

        this.appendChild(bracketed, insert);
        this.appendChild(next, bracketed);

        return bracketed;
    }

    appendChild(e, insert = null) {
        let index = this.elements.length - 1;
        if (insert) {
            index = this.elements.indexOf(insert);
            if (index === -1) throw "Unknown Element";
        }
        
        this.elements.splice(index + 1, 0, e);

        if (index === this.elements.length - 1) {
            this.html.appendChild(e.html);
        } else {
            this.html.insertBefore(e.html, this.html.childNodes[index + 1]);
        }
        
        this.update();
    }

    removeChild(e) {
        // Remove bracketed
        const idx = this.elements.indexOf(e);
        this.html.removeChild(e.html);
        this.elements.splice(idx, 1);

        // Remove Input after Bracketed
        if (idx > 0 && e instanceof Bracketed) {
            this.elements[idx - 1].html.innerHTML += this.elements[idx].html.innerHTML;
            this.html.removeChild(this.elements[idx].html);
            this.elements.splice(idx, 1);
        }

        // Update
        this.update();
    }

    size() {
        let size = 0;
        for (const e of this.elements) size = Math.max(size, e.size());
        return size;
    }

}

const bracketStart = {
    "{": "⎧",
    "(": "⎛",
    "[": "⎡",
}

const bracketMiddle = {
    "{": "⎨",
}

const bracketEnd = {
    "{": "⎩",
    "(": "⎝",
    "[": "⎣",
}

const bracketJoin = {
    "{": "<div>⎪</div",
    "(": "<div>⎜</div",
    "[": "<div>⎢</div",
}

const bracketClosing = {
    "{": "}",
    "(": ")",
    "[": "]",
    "<": ">"
}

class Bracketed {

    constructor(parent, next, opening, text = "") {
        this.elements = [];
        this.parent = parent;
        this.next = next;
        this.closing = bracketClosing[opening];
        this.enter = opening !== "(" && opening !== "<";

        this.single = opening;
        this.start = bracketStart[opening];
        this.middle = bracketMiddle[opening];
        this.end = bracketEnd[opening];
        this.join = bracketJoin[opening];

        this.html = document.createElement("div");
        this.html.classList.add(this.middle ? "curly" : "bracket");

        this.left = document.createElement("div");
        this.left.classList.add("left");
        this.content = document.createElement("div");
        this.content.classList.add("column");
        this.right = document.createElement("div");
        this.right.classList.add("right");

        this.html.appendChild(this.left);
        this.html.appendChild(this.content);
        this.html.appendChild(this.right);

        this.appendChild(new Rule(this, text));
    }

    canPressEnter() {
        return this.enter;
    }

    next() {
        return this.next;
    }

    size() {
        let size = 0;
        for (const e of this.elements) size += e.size();
        return size;
    }

    update() {
        this.parent.update();
        const size = this.size();
        if (size === 1 || !this.start) {
            this.left.innerHTML = this.single === "<" ? "〈" : this.single;
            this.right.innerHTML = this.single === "<" ? "〈" : this.single;
        } else {
            this.left.innerHTML = "";
            this.right.innerHTML = "";

            // populate left
            addStringDiv(this.left, this.start);
            addStringDiv(this.left, this.join);
            if (this.middle) {
                addStringDiv(this.left, this.middle);
                addStringDiv(this.left, this.join);
            }
            addStringDiv(this.left, this.end);

            // populate right
            addStringDiv(this.right, this.start);
            addStringDiv(this.right, this.join);
            if (this.middle) {
                addStringDiv(this.right, this.middle);
                addStringDiv(this.right, this.join);
            }
            addStringDiv(this.right, this.end);

            // scale
            this.html.style.setProperty("--bracket-scale", size - 2)
        }
    }

    appendChild(e, insert = null) {
        let index = this.elements.length - 1;
        if (insert) {
            index = this.elements.indexOf(insert);
            if (index === -1) throw "Unknown Element";
        }

        this.elements.splice(index + 1, 0, e);

        if (index === this.elements.length - 1) {
            this.content.appendChild(e.html);
        } else {
            this.content.insertBefore(e.html, this.content.childNodes[index + 1]);
        }

        this.update();
    }

    removeChild(e, prev) {
        const idx = this.elements.indexOf(e);
        this.elements.splice(idx, 1);

        if (!this.elements.length) {
            const idx = this.parent.elements.indexOf(this);
            const html = this.parent.elements[idx - 1].html;
            const last = html.innerHTML.length;

            this.parent.removeChild(this);

            setCaretPosition(html, last, last);
        } else {
            this.content.removeChild(e.html);
            this.update();

            if (prev) {
                let html;
                if (idx === 0) {
                    const idx = this.parent.elements.indexOf(this);
                    html = this.parent.elements[idx - 1].html;
                } else {
                    html = this.elements[idx - 1].elements[this.elements[idx - 1].elements.length - 1].html;
                }
                setCaretPosition(html, html.innerHTML.length, html.innerHTML.length);
            } else {
                let html;
                if (idx === this.elements.length) {
                    const idx = this.parent.elements.indexOf(this);
                    html = this.parent.elements[idx + 1].html;
                } else {
                    html = this.elements[idx].elements[0].html;
                }
                setCaretPosition(html, 0, 0);
            }
        }
    }

}

let refresh = false;
document.addEventListener('selectionchange', e => {
    if (refresh == true) {
        refresh = false;

        const selection = window.getSelection();
        if (selection.rangeCount < 1) return;
        const range = selection.getRangeAt(0);

        selection.removeAllRanges();
        selection.addRange(range);
    }
})

const charReplace = {
    ">": "→",

    // Greek alphabet
    "A": "α",
    "B": "β",
    "G": "γ",
    "D": "δ",
    "E": "ε",
    "Z": "ζ",

    // Numerals
    "0": "₀",
    "1": "₁",
    "2": "₂",
    "3": "₃",
    "4": "₄",
    "5": "₅",
    "6": "₆",
    "7": "₇",
    "8": "₈",
    "9": "₉"
}

const illegals = [
    "(", ")", "{", "}", "[", "]", "<", ">", "\n", "\t", "\r"
]

function createEmpty(input) {
    const div = document.createElement("div");
    div.classList.add("input");
    div.setAttribute("autocapitalize", "off");
    div.setAttribute("autocomplete", "off");
    div.setAttribute("autocorrect", "off");
    div.setAttribute("spellcheck", "false");
    div.setAttribute("data-gramm", "false");
    div.contentEditable = true;

    // Remove firefox final <br> element
    div.addEventListener('input', () => {
        if (div.lastChild instanceof HTMLBRElement) {
            div.removeChild(div.lastChild);
        }
    })

    // Prevent html pasting
    div.addEventListener('paste', e => {
        e.preventDefault();
        let clipboarddata =  e.clipboardData.getData('text/plain');

        // Filter out special characters
        clipboarddata = clipboarddata.split('').filter(c => illegals.indexOf(c) === -1).join('');

        const [start, end] = getRange(div);
        div.innerHTML = div.innerHTML.substr(0, start) + clipboarddata + div.innerHTML.substr(end);
        setCaretPosition(div, start + clipboarddata.length, start + clipboarddata.length);
    })

    // Special keyboard inputs
    div.addEventListener('keydown', e => {
        // Brackets
        if (e.key === "{" || e.key === "[" || e.key === "(" || e.key === "<") {
            if (e.altKey || e.ctrlKey || e.metaKey) return;
            e.preventDefault();

            const [rstart, rend] = getRange(div);

            const start = div.innerHTML.substr(0, rstart);
            const middle = div.innerHTML.substr(rstart, rend - rstart);
            const end = div.innerHTML.substr(rend);

            div.innerHTML = start;
            const bracketed = input.parent.addBracket(e.key, middle, end, input);

            setCaretPosition(bracketed.elements[0].elements[0].html, 0);
            return;
        }
        const bracket = input.parent.parent?.closing;
        if (e.key === bracket) {
            if (e.altKey || e.ctrlKey || e.metaKey) return;
            e.preventDefault();
            setCaretPosition(input.parent.parent.next.html, 0, 0);
            return;
        }

        function left(start, end) {
            if (start > 0 || start !== end) return;

            // We're going inside a bracket
            const idx = input.parent.elements.indexOf(input);
            if (idx > 0) {
                e.preventDefault();
                {
                    const bracket = input.parent.elements[idx - 1];
                    const e = bracket.elements[bracket.elements.length - 1];
                    const h = e.elements[e.elements.length - 1].html;
                    setCaretPosition(h, h.innerHTML.length, h.innerHTML.length);
                }
            }

            // We're already inside a bracket
            else if (bracket) {
                e.preventDefault();
                const idx = input.parent.parent.elements.indexOf(input.parent);
                if (idx > 0) {
                    // Go up
                    const e = input.parent.parent.elements[idx - 1];
                    const h = e.elements[e.elements.length - 1].html;
                    setCaretPosition(h, h.innerHTML.length, h.innerHTML.length);
                } else {
                    // Go outside
                    const idx = input.parent.parent.parent.elements.indexOf(input.parent.parent);
                    const e = input.parent.parent.parent.elements[idx - 1];
                    const h = e.html;
                    setCaretPosition(h, h.innerHTML.length, h.innerHTML.length);
                }
            }
        }

        function right(start, end) {
            if (end < div.innerHTML.length || start !== end) return;

            // We're going inside a bracket
            const idx = input.parent.elements.indexOf(input);
            if (idx < input.parent.elements.length - 1) {
                e.preventDefault();
                {
                    const bracket = input.parent.elements[idx + 1];
                    const e = bracket.elements[0];
                    const h = e.elements[0].html;
                    setCaretPosition(h, 0, 0);
                }
            }

            // We're already inside a bracket
            else if (bracket) {
                e.preventDefault();
                const idx = input.parent.parent.elements.indexOf(input.parent);
                if (idx < input.parent.parent.elements.length - 1) {
                    // Go down
                    const e = input.parent.parent.elements[idx + 1];
                    const h = e.elements[0].html;
                    setCaretPosition(h, 0, 0);
                } else {
                    // Go outside
                    const idx = input.parent.parent.parent.elements.indexOf(input.parent.parent);
                    const e = input.parent.parent.parent.elements[idx + 1];
                    const h = e.html;
                    setCaretPosition(h, 0, 0);
                }
            }
        }

        // Arrow keys
        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (e.shiftKey) return;
            if (bracket) {
                const idx = input.parent.parent.elements.indexOf(input.parent);
                if (idx < input.parent.parent.elements.length - 1) {
                    const e = input.parent.parent.elements[idx + 1];
                    const h = e.elements[0].html;
                    setCaretPosition(h, 0, 0);
                }
            }
            return;
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (e.shiftKey) return;
            if (bracket) {
                const idx = input.parent.parent.elements.indexOf(input.parent);
                if (idx > 0) {
                    const e = input.parent.parent.elements[idx - 1];
                    const h = e.elements[e.elements.length - 1].html;
                    setCaretPosition(h, h.innerHTML.length, h.innerHTML.length);
                }
            }
            return;
        }
        if (e.key === "ArrowLeft") {
            if (e.shiftKey) return;

            const [start, end] = getRange(div);
            left(start, end);

            return;
        }
        if (e.key === "ArrowRight") {
            if (e.shiftKey) return;

            const [start, end] = getRange(div);

            // Fix firefox issue where you can't go to the end of a contenteditable
            refresh = true;

            right(start, end);
            return;
        }

        // Custom characters
        if (charReplace[e.key]) {
            if (e.altKey || e.ctrlKey || e.metaKey) return;
            e.preventDefault();

            const [start, end] = getRange(div);

            div.innerHTML = div.innerHTML.substr(0, start) + charReplace[e.key] + div.innerHTML.substr(end);
            setCaretPosition(div, start + 1, start + 1);
            return;
        }

        // Newline
        if (e.key === "Enter") {
            e.preventDefault();
            if (bracket) {
                if (input.parent.parent.canPressEnter()) {
                    const rule = new Rule(input.parent.parent);
                    input.parent.parent.appendChild(rule, input.parent);
                    setCaretPosition(rule.elements[0].html, 0);
                }
            }
            return;
        }

        // Deletion
        let insideEmptyRule = bracket && (!div.innerHTML.length || div.innerHTML === "<br>") && input.parent.elements.length === 1;
        if (e.key === "Delete") {
            if (insideEmptyRule) {
                e.preventDefault();
                input.parent.parent.removeChild(input.parent, false);
                return;
            }

            // Remove bracket
            const [start, end] = getRange(div);
            if (bracket && start === end && end === div.innerHTML.length && input.parent.elements.indexOf(input) === input.parent.elements.length - 1 && input.parent.parent.elements.length === 1) {
                e.preventDefault();
                const rule = input.parent;
                const child = input.parent.parent;
                const parent = input.parent.parent.parent;

                const idx = parent.elements.indexOf(child);
                const prev = parent.elements[idx - 1];

                let offset;

                prev.html.innerHTML += rule.elements[0].html.innerHTML;
                if (rule.elements.length > 1) {
                    offset = rule.elements[rule.elements.length - 1].html.innerHTML.length;
                    for (let i = rule.elements.length - 1; i > 0; i--) {
                        rule.elements[i].parent = parent;
                        parent.appendChild(rule.elements[i], prev);
                    }
                } else {
                    offset = prev.html.innerHTML.length;
                }

                parent.removeChild(child);
                setCaretPosition(parent.elements[idx + rule.elements.length - 2].html, offset, offset);
                return;
            }

            right(start, end);
            return;
        }
        if (e.key === "Backspace") {
            if (insideEmptyRule) {
                e.preventDefault();
                input.parent.parent.removeChild(input.parent, true);
                return;
            }

            // Remove bracket
            const [start, end] = getRange(div);
            if (bracket && start === end && start === 0 && input.parent.elements.indexOf(input) === 0 && input.parent.parent.elements.length === 1) {
                e.preventDefault();
                const rule = input.parent;
                const child = input.parent.parent;
                const parent = input.parent.parent.parent;

                const idx = parent.elements.indexOf(child);
                const prev = parent.elements[idx - 1];

                let offset = prev.html.innerHTML.length;

                prev.html.innerHTML += rule.elements[0].html.innerHTML;
                if (rule.elements.length > 1) {
                    for (let i = rule.elements.length - 1; i > 0; i--) {
                        rule.elements[i].parent = parent;
                        parent.appendChild(rule.elements[i], prev);
                    }
                }

                parent.removeChild(child);
                setCaretPosition(prev.html, offset, offset);
                return;
            }

            left(start, end);
            return;
        }

        // Closing bracket
        if (e.key === "}" || e.key === "]" || e.key === ")") {
            if (e.altKey || e.ctrlKey || e.metaKey) return;
            e.preventDefault();
            return;
        }
    });

    return div;
}

function getRange(e) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    // Ctrl-A does weird stuff, let's fix that
    let end = range.endOffset;
    if (range.endContainer.childNodes.length) {
        end = e.innerHTML.length;
    }

    return [range.startOffset, end];
}

function setCaretPosition(elem, start, end = -1) {
    const selection = window.getSelection();
    const e = elem.childNodes.length ? elem.childNodes[0] : elem;
    selection.setBaseAndExtent(e, start, e, end < 0 ? elem.innerHTML.length : end)
}
