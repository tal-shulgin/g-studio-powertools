/**
 * UTILS: Shadow Piercer & DOM Helpers
 * Version: 2.1.5
 */

(function() {
    'use strict';

    const DEBUG = false;
    const log = DEBUG ? console.log : () => {};

    const Utils = {
        findDeep(root, selector, depth = 0, seen = new WeakSet()) {
            if (!root || depth > 50) return null;
            if (seen.has(root)) return null;
            seen.add(root);
            
            if (root.querySelector) {
                try {
                    const found = root.querySelector(selector);
                    if (found) {
                        log(`[Utils] Found "${selector}"`);
                        return found;
                    }
                } catch(e) { return null; }
            }
            
            if (root.shadowRoot) {
                const found = this.findDeep(root.shadowRoot, selector, depth + 1, seen);
                if (found) return found;
            }
            
            if (root.assignedElements) {
                const slotted = root.assignedElements();
                for (const node of slotted) {
                    const found = this.findDeep(node, selector, depth + 1, seen);
                    if (found) return found;
                }
            }
            
            const children = root.children;
            if (!children) return null;
            
            for (let i = 0; i < children.length; i++) {
                const found = this.findDeep(children[i], selector, depth + 1, seen);
                if (found) return found;
            }
            return null;
        },

        waitForElement(selector, timeout = 2000, root = document) {
            log(`[Utils] Waiting for: ${selector}`);
            return new Promise(resolve => {
                const startTime = Date.now();
                const interval = setInterval(() => {
                    const element = root.querySelector(selector);
                    if (element) {
                        log(`[Utils] Found: ${selector}`);
                        clearInterval(interval);
                        resolve(element);
                    } else if (Date.now() - startTime > timeout) {
                        log(`[Utils] Timeout: ${selector}`);
                        clearInterval(interval);
                        resolve(null);
                    }
                }, 100);
            });
        },
        
        async waitForScrollerSettle(container, timeout = 5000) {
            log(`[Utils] Scroller settling...`);
            const start = Date.now();
            let stableCount = 0;
            
            while (Date.now() - start < timeout) {
                if (!container) return false;
                if (container.scrollTop === 0) {
                    stableCount++;
                    if (stableCount >= 3) return true;
                } else {
                    stableCount = 0;
                    container.scrollTo({ top: 0, behavior: 'instant' });
                }
                await this.sleep(200);
            }
            return false;
        },

        async forceScrollToTop(container) {
            if (!container) return false;
            for (let i = 0; i < 3; i++) {
                container.scrollTo({ top: 0, behavior: 'instant' });
                await this.sleep(300);
                if (container.scrollTop === 0) return true;
            }
            return false;
        },

        isModelThinking() {
            return !!document.querySelector('button[aria-label="Stop generating"], button[aria-label="Cancel"], button[aria-label="Stop"]');
        },

        dispatchInputEvents(element) {
            if (!element) return;
            ['focus', 'input', 'change', 'blur'].forEach(type => {
                element.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
            });
        },

        getTurnId(turn) {
            const dataId = turn.getAttribute('data-turn-id');
            if (dataId) return dataId;
            
            const id = turn.getAttribute('id');
            if (id) return id;
            
            const content = turn.innerText?.slice(0, 50) || 'unknown';
            const position = turn.offsetTop || 0;
            const timestamp = turn.querySelector('[data-turn-timestamp]')?.getAttribute('data-turn-timestamp') || '';
            return `turn_${this.hashCode(content)}_${position}_${timestamp}`;
        },

        hashCode(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash).toString(36);
        },

        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    };

    window.Utils = Utils;
})();