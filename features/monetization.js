/**
 * MONETIZATION: Support links and donation options
 * Version: 1.0.3
 */

(function() {
    'use strict';

    const DEBUG = false;
    const log = DEBUG ? console.log : () => {};

    const Monetization = {
        CONFIG: {
            BUY_ME_COFFEE_URL: 'https://buymeacoffee.com/talshulgin',
            GITHUB_SPONSORS_URL: 'https://github.com/sponsors/tal-shulgin',
            SHOW_AFTER_DAYS: 3,
            SHOW_AFTER_ACTIONS: 10
        },

        async init() {
            const shouldShow = await this.shouldShowSupport();
            if (shouldShow) {
                this.injectSupportButton();
            }
        },

        async shouldShowSupport() {
            try {
                const data = await chrome.storage.local.get('gpt_install_date');
                const installDate = data.gpt_install_date || Date.now();
                if (!data.gpt_install_date) {
                    await chrome.storage.local.set({ gpt_install_date: installDate });
                }

                const daysSinceInstall = (Date.now() - installDate) / (1000 * 60 * 60 * 24);
                const stats = await this.getEngagementStats();
                
                return daysSinceInstall >= this.CONFIG.SHOW_AFTER_DAYS || 
                       stats.totalActions >= this.CONFIG.SHOW_AFTER_ACTIONS;
            } catch (e) {
                return false;
            }
        },

        async getEngagementStats() {
            try {
                const data = await chrome.storage.local.get('gpt_engagement');
                return data.gpt_engagement || { totalActions: 0 };
            } catch (e) {
                return { totalActions: 0 };
            }
        },

        injectSupportButton() {
            const checkInterval = setInterval(() => {
                const pane = document.getElementById('gpt-pane');
                if (!pane || document.getElementById('gpt-support-section')) return;

                clearInterval(checkInterval);

                const section = document.createElement('div');
                section.id = 'gpt-support-section';
                section.className = 'gpt-section-label';
                section.style.cssText = 'margin-top:24px; border-top:1px solid var(--color-v3-outline-variant); padding-top:16px;';

                section.innerHTML = `
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                        <span style="font-size:11px; text-transform:uppercase; letter-spacing:0.8px; color:var(--color-v3-outline);">Support Development</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffdd00"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </div>
                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        <button class="ms-btn ms-btn-outline" id="gpt-bmc-btn" style="flex:1; min-width:120px; background:linear-gradient(135deg, #ffdd00 0%, #ffaa00 100%); color:#000; border:none; font-weight:600;">
                            ☕ Buy Me Coffee
                        </button>
                        <button class="ms-btn ms-btn-outline" id="gpt-github-btn" style="flex:1; min-width:120px; background:var(--color-v3-surface-container-highest);">
                            <svg height="16" width="16" viewBox="0 0 16 16" style="margin-right:4px; fill:currentColor;">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                            </svg>
                            GitHub
                        </button>
                    </div>
                `;

                const statusBar = document.getElementById('gpt-status');
                if (statusBar) {
                    statusBar.parentNode.insertBefore(section, statusBar);
                } else {
                    pane.appendChild(section);
                }

                document.getElementById('gpt-bmc-btn').addEventListener('click', () => {
                    window.open(this.CONFIG.BUY_ME_COFFEE_URL, '_blank');
                    this.trackSupportClick('bmc');
                });

                document.getElementById('gpt-github-btn').addEventListener('click', () => {
                    const url = this.CONFIG.GITHUB_SPONSORS_URL || `https://github.com/${Feedback?.CONFIG?.GITHUB_REPO || 'tal-shulgin/g-studio-powertools'}`;
                    window.open(url, '_blank');
                    this.trackSupportClick('github');
                });

            }, 2000);
        },

        async trackSupportClick(type) {
            try {
                const data = await chrome.storage.local.get('gpt_support_clicks');
                const clicks = data.gpt_support_clicks || {};
                clicks[type] = (clicks[type] || 0) + 1;
                clicks.lastClick = Date.now();
                await chrome.storage.local.set({ gpt_support_clicks: clicks });
            } catch (e) {
                console.error('[Monetization] Error tracking click:', e);
            }
        }
    };

    window.Monetization = Monetization;
})();