/**
 * UI CONTROLLER: Extension B placement + Extension A Sidebar
 * Version: 2.1.2
 */

(function() {
    'use strict';

    const DEBUG = false;
    const log = DEBUG ? console.log : () => {};

    const UI = {
        SELECTORS: {
            aside: 'ms-run-settings',
            chatTurn: 'ms-chat-turn',
            chatSession: 'ms-chat-session',
            optionsWrapper: 'ms-chat-turn-options',
            menuBtn: 'button[aria-label="Open options"]',
            userRole: '[data-turn-role="User"]',
            imgChunk: 'ms-image-chunk',
            fileChunk: 'ms-file-chunk, ms-media-preview',
            scrollArea: 'ms-autoscroll-container',
            promptInput: 'ms-prompt-input textarea, textarea[aria-label="Prompt"], textarea'
        },

        processingTurns: new Set(),
        observers: [],

        init() {
            log(`[UI] Controller Init Started`);
            this.initSidebarObserver();
            this.initTurnObserver();
            this.initJumpObserver();
            
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onSuspend) {
                chrome.runtime.onSuspend.addListener(() => this.cleanup());
            }
        },

        cleanup() {
            this.observers.forEach(obs => obs.disconnect());
            this.observers = [];
            log(`[UI] Cleaned up observers`);
        },

        initSidebarObserver() {
            log(`[UI] Starting Sidebar Observer`);
            this.tryInjectSidebar();
            
            const observer = new MutationObserver(() => {
                const aside = document.querySelector(this.SELECTORS.aside);
                if (aside && !aside.querySelector('#gpt-pane')) {
                    log(`[UI] Sidebar detected in DOM, injecting...`);
                    this.injectSidebar();
                }
            });
            
            this.observers.push(observer);
            observer.observe(document.body, { childList: true, subtree: true });
        },

        tryInjectSidebar() {
            const aside = document.querySelector(this.SELECTORS.aside);
            if (aside) {
                this.injectSidebar();
            } else {
                log(`[UI] Sidebar not found yet, waiting...`);
            }
        },

        injectSidebar() {
            const aside = document.querySelector(this.SELECTORS.aside);
            if (!aside || aside.querySelector('#gpt-pane')) return;

            log(`[UI] >>> INJECTING SIDEBAR UI <<<`);

            const nav = document.createElement('div');
            nav.className = 'gpt-tab-nav';
            nav.innerHTML = `
                <div class="gpt-tab active" data-tab="native" title="View native AI Studio settings">Settings</div>
                <div class="gpt-tab" data-tab="tools" title="Access PowerTools features">PowerTools</div>
            `;

            const pane = document.createElement('div');
            pane.id = 'gpt-pane';
            pane.className = 'gpt-pane gpt-hidden';
            
            pane.innerHTML = `
                <div class="gpt-section-label">Prompt Library</div>
                <div class="gpt-card">
                    <button class="ms-btn ms-btn-primary" id="gpt-add-btn" title="Save current prompt input to library">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
                        <span>New from Input</span>
                    </button>
                    <div id="gpt-save-form" class="gpt-hidden">
                        <input type="text" id="gpt-name-input" class="gpt-input" placeholder="Name..." title="Enter a name for this prompt" maxlength="100">
                        <textarea id="gpt-text-input" class="gpt-input" style="height:100px; margin-top:8px; font-size:12px;" placeholder="Content..." title="Prompt content" maxlength="50000"></textarea>
                        <div style="margin-top:10px; display:flex; gap:8px;">
                            <button class="ms-btn ms-btn-outline" style="flex:1" id="gpt-cancel" title="Cancel and discard changes">Cancel</button>
                            <button class="ms-btn ms-btn-primary" style="flex:1" id="gpt-save" title="Save prompt to library">Save</button>
                        </div>
                    </div>
                    <div id="gpt-prompt-list" style="margin-top:10px;"></div>
                </div>
                
                <div class="gpt-section-label">Bulk Actions</div>
                <div class="gpt-card">
                    <button class="ms-btn ms-btn-danger" id="gpt-del-text" style="width:100%; margin-bottom:8px;" title="Delete all text-only messages">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                        <span>Text Messages</span>
                    </button>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <button class="ms-btn ms-btn-outline" id="gpt-del-img" title="Delete all image messages">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                            </svg>                    
                        </button>

                        <button class="ms-btn ms-btn-outline" id="gpt-del-file" title="Delete all file attachment messages">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                            </svg>
                        </button>
                    </div>
                    <button class="ms-btn ms-btn-outline" id="gpt-clear-flags" style="width:100%; margin-top:8px;" title="Remove all boundary stop flags from conversation">
                        Clear All Boundaries
                    </button>
                </div>
                
                <div id="gpt-status" class="gpt-status-bar" title="Current operation status">Ready</div>
            `;

            aside.insertBefore(nav, aside.firstChild);
            aside.appendChild(pane);
            
            log(`[UI] Sidebar UI injected successfully`);

            nav.querySelectorAll('.gpt-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    this.switchTab(e.target.dataset.tab, aside);
                });
            });
            
            this.renderPromptList();
        },

        switchTab(tab, aside) {
            const isTools = tab === 'tools';
            aside.querySelectorAll('.gpt-tab').forEach(el => {
                el.classList.toggle('active', el.dataset.tab === tab);
            });
            
            const nativeHeader = aside.querySelector('.overlay-header');
            const nativeSettings = aside.querySelector('.settings-items-wrapper');
            
            if (nativeHeader) nativeHeader.classList.toggle('gpt-hidden', isTools);
            if (nativeSettings) nativeSettings.classList.toggle('gpt-hidden', isTools);
            
            const pane = aside.querySelector('#gpt-pane');
            if (pane) pane.classList.toggle('gpt-hidden', !isTools);
        },

        initTurnObserver() {
            log(`[UI] Starting Turn Observer`);
            
            const existingTurns = document.querySelectorAll(this.SELECTORS.chatTurn);
            log(`[UI] Found ${existingTurns.length} existing turns`);
            existingTurns.forEach(turn => this.addDeleteAndBoundaryButtons(turn));

            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            if (node.matches(this.SELECTORS.chatTurn)) {
                                this.addDeleteAndBoundaryButtons(node);
                            }
                            if (node.querySelectorAll) {
                                node.querySelectorAll(this.SELECTORS.chatTurn).forEach(turn => {
                                    this.addDeleteAndBoundaryButtons(turn);
                                });
                            }
                        }
                    });
                });
            });

            const session = document.querySelector(this.SELECTORS.chatSession) || document.body;
            this.observers.push(observer);
            observer.observe(session, { childList: true, subtree: true });
            log(`[UI] Turn observer attached to: ${session.tagName}`);
        },

        async addDeleteAndBoundaryButtons(turn) {
            if (turn.dataset.boundaryInjected === 'true' || this.processingTurns.has(turn)) {
                return;
            }
            
            this.processingTurns.add(turn);
            turn.dataset.boundaryInjected = 'true';

            try {
                let actionsContainer = turn.querySelector('.actions-container .actions');
                if (!actionsContainer) {
                    actionsContainer = turn.querySelector('.turn-actions') || 
                                      turn.querySelector('[class*="actions"]') ||
                                      turn.querySelector('.actions');
                }
                
                if (!actionsContainer) {
                    log(`[UI] No actions container found for turn, skipping`);
                    return;
                }

                const turnId = Utils.getTurnId(turn);
                const boundaries = await Storage.getBoundaries();
                
                const boundaryBtn = document.createElement('button');
                boundaryBtn.className = 'delete-boundary-button';
                if (boundaries.has(turnId)) boundaryBtn.classList.add('active');
                boundaryBtn.title = 'Stop deletion here (Mark as end point)';
                boundaryBtn.setAttribute('aria-label', 'Toggle boundary flag');
                boundaryBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>';
                
                boundaryBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const isActive = await Storage.toggleBoundary(turnId);
                    boundaryBtn.classList.toggle('active', isActive);
                });

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-below-button';
                deleteBtn.title = 'Delete from here down (Respects Stop flags)';
                deleteBtn.setAttribute('aria-label', 'Delete below');
                deleteBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
                
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.powerTools.handleDeleteBelow(turn);
                });

                actionsContainer.appendChild(boundaryBtn);
                actionsContainer.appendChild(deleteBtn);

            } catch (error) {
                console.error(`[UI] Error injecting buttons:`, error);
                turn.dataset.boundaryInjected = 'false';
            } finally {
                this.processingTurns.delete(turn);
            }
        },

        initJumpObserver() {
            log(`[UI] Starting Jump Button Observer`);
            this.tryInjectJumpButtons();
            
            const interval = setInterval(() => {
                if (document.querySelector('.jump-buttons-container')) {
                    clearInterval(interval);
                    return;
                }
                this.tryInjectJumpButtons();
            }, 1000);
            
            const observer = new MutationObserver(() => {
                if (!document.querySelector('.jump-buttons-container')) {
                    this.tryInjectJumpButtons();
                }
            });
            
            this.observers.push(observer);
            observer.observe(document.body, { childList: true, subtree: true });
        },

        tryInjectJumpButtons() {
            let ta = Utils.findDeep(document, 'ms-prompt-input textarea', 0, new WeakSet());
            if (!ta) {
                ta = document.querySelector('textarea[aria-label="Prompt"]') || 
                     document.querySelector('textarea');
            }
            if (ta) {
                this.injectJumpButtons(ta);
            }
        },

        injectJumpButtons(textarea) {
            if (document.querySelector('.jump-buttons-container')) return;

            const stableContainer = textarea.parentElement?.parentElement;
            if (!stableContainer) return;

            const computedStyle = window.getComputedStyle(stableContainer);
            if (computedStyle.position === 'static') {
                stableContainer.style.position = 'relative';
            }

            const jumpContainer = document.createElement('div');
            jumpContainer.className = 'jump-buttons-container';
            jumpContainer.innerHTML = `
                <button class="jump-button" id="jump-top" title="Jump to start of text (Ctrl+Home)">
                    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
                        <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
                    </svg>
                </button>
                <button class="jump-button" id="jump-bottom" title="Jump to end of text (Ctrl+End)">
                    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
                        <path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/>
                    </svg>
                </button>
            `;

            stableContainer.appendChild(jumpContainer);
            
            jumpContainer.querySelector('#jump-top').addEventListener('click', (e) => {
                e.preventDefault(); e.stopPropagation();
                textarea.focus(); textarea.setSelectionRange(0, 0); textarea.scrollTop = 0;
            });

            jumpContainer.querySelector('#jump-bottom').addEventListener('click', (e) => {
                e.preventDefault(); e.stopPropagation();
                const len = textarea.value.length;
                textarea.focus(); textarea.setSelectionRange(len, len); textarea.scrollTop = textarea.scrollHeight;
            });
        },

        async renderPromptList() {
            const container = document.getElementById('gpt-prompt-list');
            if (!container) return;

            const prompts = await Storage.getPrompts();
            if (prompts.length === 0) {
                container.innerHTML = '<div style="color:var(--color-v3-outline); font-size:12px; text-align:center; padding:8px;" title="No saved prompts yet">No saved prompts</div>';
                return;
            }

            container.innerHTML = prompts.map(p => `
                <div class="lib-item" title="Prompt: ${Utils.escapeHtml(p.name)}">
                    <span class="lib-name-title">${Utils.escapeHtml(p.name)}</span>
                    <div class="lib-actions">
                        <button class="gpt-lib-btn" data-action="load" data-id="${p.id}" title="Load into input">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                        </button>
                        <button class="gpt-lib-btn" data-action="run" data-id="${p.id}" title="Load and run immediately">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </button>
                        <button class="gpt-lib-btn" data-action="del" data-id="${p.id}" title="Delete from library">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('');
        },

        log(msg) {
            log(`[UI] ${msg}`);
            const status = document.getElementById('gpt-status');
            if (status) status.innerText = msg;
        }
    };

    window.UI = UI;
})();