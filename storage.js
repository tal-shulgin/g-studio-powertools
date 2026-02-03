/**
 * STORAGE: Local persistence
 * Version: 2.1.2
 */

(function() {
    'use strict';

    const DEBUG = false;
    const log = DEBUG ? console.log : () => {};

    const Storage = {
        KEYS: {
            PROMPTS: 'gpt_prompts',
            BOUNDARIES: 'gpt_boundaries'
        },

        async getPrompts() {
            try {
                const data = await chrome.storage.local.get(this.KEYS.PROMPTS);
                return data[this.KEYS.PROMPTS] || [];
            } catch (e) {
                console.error('[Storage] Error getting prompts:', e);
                return [];
            }
        },

        async savePrompt(prompt) {
            try {
                if (!prompt.name || !prompt.content) {
                    throw new Error('Name and content required');
                }
                if (prompt.name.length > 100) {
                    throw new Error('Name too long');
                }
                if (prompt.content.length > 50000) {
                    throw new Error('Content too long');
                }

                const prompts = await this.getPrompts();
                prompt.id = Date.now();
                prompt.createdAt = new Date().toISOString();
                prompts.push(prompt);
                await chrome.storage.local.set({ [this.KEYS.PROMPTS]: prompts });
                log(`[Storage] Saved prompt: ${prompt.name}`);
                return prompts;
            } catch (e) {
                console.error('[Storage] Error saving prompt:', e);
                throw e;
            }
        },

        async deletePrompt(id) {
            try {
                const prompts = await this.getPrompts();
                const filtered = prompts.filter(p => p.id != id);
                await chrome.storage.local.set({ [this.KEYS.PROMPTS]: filtered });
                log(`[Storage] Deleted prompt id: ${id}`);
                return filtered;
            } catch (e) {
                console.error('[Storage] Error deleting prompt:', e);
                throw e;
            }
        },

        async getBoundaries() {
            try {
                const data = await chrome.storage.local.get(this.KEYS.BOUNDARIES);
                const set = new Set(data[this.KEYS.BOUNDARIES] || []);
                log(`[Storage] Loaded boundaries: ${set.size} flags`);
                return set;
            } catch (e) {
                console.error('[Storage] Error getting boundaries:', e);
                return new Set();
            }
        },

        async isBoundary(turnId) {
            if (!turnId) return false;
            const boundaries = await this.getBoundaries();
            return boundaries.has(turnId);
        },

        async toggleBoundary(turnId) {
            if (!turnId) return false;
            
            try {
                const boundaries = await this.getBoundaries();
                const newState = !boundaries.has(turnId);
                
                if (newState) {
                    boundaries.add(turnId);
                    log(`[Storage] Added boundary: ${turnId}`);
                } else {
                    boundaries.delete(turnId);
                    log(`[Storage] Removed boundary: ${turnId}`);
                }
                
                await chrome.storage.local.set({ 
                    [this.KEYS.BOUNDARIES]: Array.from(boundaries) 
                });
                return newState;
            } catch (e) {
                console.error('[Storage] Error toggling boundary:', e);
                return false;
            }
        },

        async clearAllBoundaries() {
            try {
                await chrome.storage.local.remove(this.KEYS.BOUNDARIES);
                log(`[Storage] Cleared all boundaries`);
            } catch (e) {
                console.error('[Storage] Error clearing boundaries:', e);
            }
        }
    };

    window.Storage = Storage;
})();