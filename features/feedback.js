/**
 * FEEDBACK: GitHub issues integration + Rating prompts
 * Version: 1.0.3
 */

(function() {
    'use strict';

    const DEBUG = false;
    const log = DEBUG ? console.log : () => {};

    const Feedback = {
        CONFIG: {
            GITHUB_REPO: 'tal-shulgin/g-studio-powertools',
            RATING_THRESHOLD: 5,
            COOLDOWN_DAYS: 30
        },

        async init() {
            this.injectFeedbackButton();
        },

        injectFeedbackButton() {
            const checkInterval = setInterval(() => {
                const statusBar = document.getElementById('gpt-status');
                if (!statusBar || document.getElementById('gpt-feedback-btn')) return;

                clearInterval(checkInterval);
                
                const btn = document.createElement('button');
                btn.id = 'gpt-feedback-btn';
                btn.className = 'ms-btn ms-btn-outline';
                btn.style.cssText = 'width:100%; margin-top:8px; font-size:12px;';
                btn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/></svg>
                    <span>Report Bug or Suggest Feature</span>
                `;
                btn.title = 'Create GitHub issue (opens in new tab)';
                
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openGitHubIssue();
                });

                statusBar.parentNode.insertBefore(btn, statusBar);
            }, 1000);
        },

        openGitHubIssue() {
            try {
                const manifest = chrome.runtime.getManifest();
                const version = manifest.version;
                const url = window.location.href;
                
                const title = encodeURIComponent('[Bug/Suggestion] ');
                const body = encodeURIComponent(`
**Extension Version:** ${version}
**URL:** ${url}
**Browser:** ${navigator.userAgent}

**Describe the issue or suggestion:**



**Steps to reproduce (if bug):**
1. 
2. 
3. 

**Expected behavior:**



**Screenshots:** (if applicable)

---

*This issue was created via the PowerTools feedback button*
                `.trim());

                const githubUrl = `https://github.com/${this.CONFIG.GITHUB_REPO}/issues/new?title=${title}&body=${body}`;
                window.open(githubUrl, '_blank');
                
                log('[Feedback] Opened GitHub issue creator');
            } catch (e) {
                console.error('[Feedback] Error opening GitHub issue:', e);
            }
        },

        async promptForReview(context = 'default') {
            try {
                const stats = await this.getStats();
                
                stats.actionCount = (stats.actionCount || 0) + 1;
                await this.saveStats(stats);

                if (stats.hasReviewed || stats.actionCount < this.CONFIG.RATING_THRESHOLD) return;
                
                if (stats.lastAsked) {
                    const daysSince = (Date.now() - stats.lastAsked) / (1000 * 60 * 60 * 24);
                    if (daysSince < this.CONFIG.COOLDOWN_DAYS) return;
                }

                const messages = {
                    bulkDelete: "Cleaned up your conversation? 🧹",
                    boundary: "Finding the boundary flags useful? 🚩",
                    promptLibrary: "Loving the prompt library? 💾",
                    milestone_100_clicks: "You've saved over 100 clicks! ⚡",
                    default: "Enjoying PowerTools? 💙"
                };

                const message = messages[context] || messages.default;
                
                if (confirm(`${message}\n\nHelp others discover this extension with a quick review?`)) {
                    this.openReviewPage();
                    await this.markReviewed();
                } else {
                    stats.lastAsked = Date.now();
                    await this.saveStats(stats);
                }
            } catch (e) {
                console.error('[Feedback] Error prompting for review:', e);
            }
        },

        openReviewPage() {
            try {
                const extensionId = chrome.runtime.id;
                const url = `https://chromewebstore.google.com/detail/${extensionId}/reviews`;
                window.open(url, '_blank');
            } catch (e) {
                console.error('[Feedback] Error opening review page:', e);
            }
        },

        async getStats() {
            try {
                const data = await chrome.storage.local.get('gpt_feedback_stats');
                return data.gpt_feedback_stats || {};
            } catch (e) {
                return {};
            }
        },

        async saveStats(stats) {
            try {
                await chrome.storage.local.set({ gpt_feedback_stats: stats });
            } catch (e) {
                console.error('[Feedback] Error saving stats:', e);
            }
        },

        async markReviewed() {
            try {
                const stats = await this.getStats();
                stats.hasReviewed = true;
                await this.saveStats(stats);
            } catch (e) {
                console.error('[Feedback] Error marking reviewed:', e);
            }
        },

        async resetStats() {
            try {
                await chrome.storage.local.remove('gpt_feedback_stats');
                log('[Feedback] Feedback stats reset');
            } catch (e) {
                console.error('[Feedback] Error resetting stats:', e);
            }
        }
    };

    window.Feedback = Feedback;
})();