/**
 * MAIN CONTROLLER: Extension A Engine + Extension B Features
 * Version: 2.1.2
 */

(function() {
    'use strict';

    const DEBUG = false;
    const log = DEBUG ? console.log : () => {};

    class PowerTools {
        constructor() {
            this.isDeleting = false;
            this.deleteStartTime = null;
            this.maxDeleteDuration = 300000;
            this.init();
        }

        init() {
            UI.init();
            
            setTimeout(() => {
                try {
                    if (typeof Onboarding !== 'undefined') Onboarding.init();
                } catch (e) { 
                    log("[PowerTools] Onboarding failed", e); 
                }
            }, 2000);

            try {
                if (typeof Feedback !== 'undefined') Feedback.init();
                if (typeof Monetization !== 'undefined') Monetization.init();
            } catch (e) { 
                log("[PowerTools] Modules failed", e); 
            }
            
            document.addEventListener('click', (e) => {
                const tab = e.target.closest('.gpt-tab');
                if (tab) {
                    const aside = document.querySelector(UI.SELECTORS.aside);
                    if (aside) UI.switchTab(tab.dataset.tab, aside);
                    return;
                }
                this.handleSidebarClicks(e);
            });

            UI.renderPromptList();
            log("[PowerTools] Scanner Online");
        }

        async handleSidebarClicks(e) {
            const target = e.target.closest('.ms-btn, .gpt-lib-btn');
            if (!target) return;

            if (target.id === 'gpt-add-btn') {
                const ta = Utils.findDeep(document, UI.SELECTORS.promptInput) || 
                          document.querySelector('textarea');
                document.getElementById('gpt-text-input').value = ta ? ta.value : "";
                document.getElementById('gpt-save-form').classList.remove('gpt-hidden');
                target.classList.add('gpt-hidden');
            }
            else if (target.id === 'gpt-cancel') {
                document.getElementById('gpt-save-form').classList.add('gpt-hidden');
                document.getElementById('gpt-add-btn').classList.remove('gpt-hidden');
            }
            else if (target.id === 'gpt-save') {
                const name = document.getElementById('gpt-name-input').value.trim();
                const content = document.getElementById('gpt-text-input').value.trim();
                
                if (!name || !content) {
                    UI.log("Error: Name and content required");
                    return;
                }
                if (name.length > 100) {
                    UI.log("Error: Name too long (max 100 chars)");
                    return;
                }
                if (content.length > 50000) {
                    UI.log("Error: Content too long (max 50KB)");
                    return;
                }
                
                await Storage.savePrompt({ name, content });
                document.getElementById('gpt-save-form').classList.add('gpt-hidden');
                document.getElementById('gpt-add-btn').classList.remove('gpt-hidden');
                document.getElementById('gpt-name-input').value = '';
                document.getElementById('gpt-text-input').value = '';
                await UI.renderPromptList();
                UI.log("Prompt saved");
            }
            else if (target.classList.contains('gpt-lib-btn')) {
                await this.handleLibraryAction(target.dataset.action, target.dataset.id);
            }
            else if (target.id === 'gpt-del-text') {
                this.bulkDeleteEngine('text');
            }
            else if (target.id === 'gpt-del-img') {
                this.bulkDeleteEngine('image');
            }
            else if (target.id === 'gpt-del-file') {
                this.bulkDeleteEngine('file');
            }
            else if (target.id === 'gpt-clear-flags') {
                await Storage.clearAllBoundaries();
                document.querySelectorAll('.delete-boundary-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                UI.log("All boundary flags cleared");
            }
        }

        async handleDeleteBelow(startTurn) {
            if (this.isDeleting) {
                UI.log("Deletion already in progress");
                return;
            }

            if (Utils.isModelThinking()) {
                UI.log("⚠️ Model is generating. Aborting.");
                return;
            }

            const turnsToDelete = [];
            let current = startTurn;
            let boundaryFound = false;

            while (current) {
                if (current.tagName === 'MS-CHAT-TURN') {
                    const turnId = Utils.getTurnId(current);
                    const isBoundary = await Storage.isBoundary(turnId);
                    
                    if (isBoundary) {
                        boundaryFound = true;
                        turnsToDelete.push(current);
                        break;
                    }
                    turnsToDelete.push(current);
                }
                current = current.nextElementSibling;
            }

            if (turnsToDelete.length === 0) {
                UI.log("No turns to delete");
                return;
            }

            const msg = boundaryFound 
                ? `Delete ${turnsToDelete.length} turns up to boundary flag?`
                : `Delete ${turnsToDelete.length} turns to end of conversation?`;

            if (!confirm(msg)) return;

            await this.deleteSpecificTurns(turnsToDelete);
        }

        async deleteSpecificTurns(turns) {
            this.isDeleting = true;
            this.deleteStartTime = Date.now();
            let deletedCount = 0;

            try {
                for (const turn of turns) {
                    if (Date.now() - this.deleteStartTime > this.maxDeleteDuration) {
                        UI.log("Emergency stop: Timeout");
                        break;
                    }

                    if (!document.contains(turn)) continue;

                    UI.log(`Deleting ${deletedCount + 1}/${turns.length}...`);
                    const success = await this.triggerNativeDelete(turn);
                    
                    if (success) {
                        deletedCount++;
                        await Utils.sleep(500);
                    } else {
                        await Utils.sleep(1000);
                    }
                }
            } catch (e) {
                log("[PowerTools] Delete error:", e);
            } finally {
                this.isDeleting = false;
                this.trackClicksSaved(deletedCount);
                UI.log(`Complete. Deleted: ${deletedCount}`);
            }
        }

        async bulkDeleteEngine(mode) {
            if (this.isDeleting) return;
            if (Utils.isModelThinking()) {
                UI.log("Model busy. Aborting.");
                return;
            }

            UI.log(`Starting Top-Down Delete: ${mode}`);
            this.isDeleting = true;
            this.deleteStartTime = Date.now();
            let deletedCount = 0;

            const container = document.querySelector(UI.SELECTORS.scrollArea);
            if (!container) {
                this.isDeleting = false;
                return;
            }

            try {
                while (this.isDeleting) {
                    if (Date.now() - this.deleteStartTime > this.maxDeleteDuration) break;

                    if (container.scrollTop > 0) {
                        await Utils.forceScrollToTop(container);
                        const settled = await Utils.waitForScrollerSettle(container);
                        if (!settled) break;
                    }

                    const allTurns = Array.from(document.querySelectorAll(UI.SELECTORS.chatTurn));
                    const targets = [];

                    for (const turn of allTurns) {
                        const isUser = Utils.findDeep(turn, UI.SELECTORS.userRole, 0, new WeakSet()) !== null || 
                                      turn.innerText?.includes('You');
                        if (!isUser) continue;

                        const hasImg = Utils.findDeep(turn, UI.SELECTORS.imgChunk, 0, new WeakSet()) !== null;
                        const hasFile = Utils.findDeep(turn, UI.SELECTORS.fileChunk, 0, new WeakSet()) !== null;

                        if (mode === 'text' && !hasImg && !hasFile) targets.push(turn);
                        else if (mode === 'image' && hasImg) targets.push(turn);
                        else if (mode === 'file' && hasFile) targets.push(turn);
                    }

                    if (targets.length === 0) {
                        if (container.scrollTop === 0) break;
                        continue;
                    }

                    const success = await this.triggerNativeDelete(targets[0]);
                    
                    if (success) {
                        deletedCount++;
                        UI.log(`Deleted: ${deletedCount}`);
                        await Utils.sleep(800);
                    } else {
                        container.scrollBy(0, 100);
                        await Utils.sleep(500);
                    }
                }
            } catch (e) {
                log("[PowerTools] Bulk delete error:", e);
            }

            this.isDeleting = false;
            this.trackClicksSaved(deletedCount);
            UI.log(`Finished. Total: ${deletedCount}`);
        }

        trackClicksSaved(count) {
            if (count <= 0) return;
            
            const saved = count * 2;
            chrome.storage.local.get(['stats_clicks_saved'], (result) => {
                const current = result.stats_clicks_saved || 0;
                const newTotal = current + saved;
                
                chrome.storage.local.set({ stats_clicks_saved: newTotal });
                
                if (newTotal > 100 && typeof Feedback !== 'undefined') {
                    Feedback.promptForReview('milestone_100_clicks');
                }
            });
        }

        async triggerNativeDelete(turnElement) {
            try {
                const optionsComp = turnElement.querySelector(UI.SELECTORS.optionsWrapper);
                const moreOptionsButton = Utils.findDeep(optionsComp, UI.SELECTORS.menuBtn, 0, new WeakSet());
                
                if (!moreOptionsButton) return false;

                moreOptionsButton.click();
                const menuPanel = await Utils.waitForElement('div[role="menu"]', 2000, document.body);
                
                if (!menuPanel) {
                    moreOptionsButton.click();
                    return false;
                }

                const menuItems = menuPanel.querySelectorAll('button.mat-mdc-menu-item, .mat-mdc-menu-item');
                let deleteMenuItem = null;
                
                for (const item of menuItems) {
                    if (item.textContent?.includes("Delete")) {
                        deleteMenuItem = item;
                        break;
                    }
                }

                if (!deleteMenuItem) {
                    moreOptionsButton.click();
                    return false;
                }

                deleteMenuItem.click();
                await Utils.sleep(400);
                
                const confirmBtn = this.findConfirmDeleteButton();
                if (confirmBtn) {
                    confirmBtn.click();
                    await Utils.sleep(300);
                    return true;
                } else {
                    return true;
                }

            } catch (e) {
                log("[PowerTools] Trigger delete error:", e);
                return false;
            }
        }

        findConfirmDeleteButton() {
            const dialogs = document.querySelectorAll('mat-dialog-container, [role="dialog"], .cdk-overlay-pane');
            for (const dialog of dialogs) {
                const btns = Array.from(dialog.querySelectorAll('button'));
                const confirmBtn = btns.find(b => b.textContent?.trim() === "Delete");
                if (confirmBtn) return confirmBtn;
            }
            return null;
        }

        async handleLibraryAction(action, id) {
            const ta = Utils.findDeep(document, UI.SELECTORS.promptInput, 0, new WeakSet()) || 
                      document.querySelector('textarea');
            if (!ta) return;

            if (action === 'del') {
                await Storage.deletePrompt(id);
                await UI.renderPromptList();
                return;
            }

            const prompts = await Storage.getPrompts();
            const p = prompts.find(x => x.id == id);
            if (!p) return;

            if (action === 'load') {
                ta.value = p.content;
                Utils.dispatchInputEvents(ta);
                UI.log(`Loaded: ${p.name}`);
            } else if (action === 'run') {
                ta.value = p.content;
                Utils.dispatchInputEvents(ta);
                setTimeout(() => {
                    const runBtn = Utils.findDeep(document, 'button[aria-label="Run"]', 0, new WeakSet());
                    if (runBtn) runBtn.click();
                }, 100);
                UI.log(`Running: ${p.name}`);
            }
        }
    }

    window.powerTools = new PowerTools();
})();