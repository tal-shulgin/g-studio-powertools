/**
 * ONBOARDING: First-time user guidance
 * Version: 1.0.2
 */

(function() {
    'use strict';

    const DEBUG = false;
    const log = DEBUG ? console.log : () => {};

    const Onboarding = {
        STORAGE_KEY: 'gpt_onboarded',
        HIGHLIGHT_DURATION: 10000,

        async init() {
            try {
                const hasSeen = await this.hasOnboarded();
                if (!hasSeen) {
                    log('[Onboarding] First-time user detected, showing onboarding');
                    setTimeout(() => this.showOnboarding(), 1000);
                }
            } catch (e) {
                console.error('[Onboarding] Error initializing:', e);
            }
        },

        async hasOnboarded() {
            try {
                const data = await chrome.storage.local.get(this.STORAGE_KEY);
                return data[this.STORAGE_KEY] === true;
            } catch (e) {
                return false;
            }
        },

        showOnboarding() {
            const tab = document.querySelector('[data-tab="tools"]');
            if (!tab) {
                log('[Onboarding] Tools tab not found, retrying...');
                setTimeout(() => this.showOnboarding(), 500);
                return;
            }

            tab.style.cssText = `
                animation: gpt-pulse 2s infinite;
                color: #8ab4f8 !important;
                font-weight: 600;
            `;

            const tooltip = document.createElement('div');
            tooltip.id = 'gpt-onboarding-tooltip';
            tooltip.innerHTML = `
                <div style="
                    position: absolute;
                    top: -40px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #1a73e8;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 12px;
                    white-space: nowrap;
                    z-index: 10000;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                ">
                    👋 Click here for PowerTools!
                    <div style="
                        position: absolute;
                        bottom: -6px;
                        left: 50%;
                        transform: translateX(-50%);
                        border-left: 6px solid transparent;
                        border-right: 6px solid transparent;
                        border-top: 6px solid #1a73e8;
                    "></div>
                </div>
            `;
            
            tab.style.position = 'relative';
            tab.appendChild(tooltip);

            if (!document.getElementById('gpt-onboarding-styles')) {
                const style = document.createElement('style');
                style.id = 'gpt-onboarding-styles';
                style.textContent = `
                    @keyframes gpt-pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.6; }
                    }
                `;
                document.head.appendChild(style);
            }

            setTimeout(() => {
                this.completeOnboarding();
                this.cleanup();
            }, this.HIGHLIGHT_DURATION);

            tab.addEventListener('click', () => {
                this.completeOnboarding();
                this.cleanup();
            }, { once: true });
        },

        async completeOnboarding() {
            try {
                await chrome.storage.local.set({ [this.STORAGE_KEY]: true });
                log('[Onboarding] Onboarding completed');
            } catch (e) {
                console.error('[Onboarding] Error completing onboarding:', e);
            }
        },

        cleanup() {
            const tab = document.querySelector('[data-tab="tools"]');
            if (tab) {
                tab.style.animation = '';
                tab.style.color = '';
                tab.style.fontWeight = '';
            }
            const tooltip = document.getElementById('gpt-onboarding-tooltip');
            if (tooltip) tooltip.remove();
        },

        async reset() {
            try {
                await chrome.storage.local.remove(this.STORAGE_KEY);
                log('[Onboarding] Onboarding reset');
            } catch (e) {
                console.error('[Onboarding] Error resetting onboarding:', e);
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Onboarding.init());
    } else {
        Onboarding.init();
    }

    window.Onboarding = Onboarding;
})();