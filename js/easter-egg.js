/**
 * 全站彩蛋 - 用户停留3分钟反馈弹窗
 * 当用户停留在网页超过3分钟时，弹出反馈询问
 */

(function() {
    'use strict';
    
    // 配置
    const CONFIG = {
        // 3分钟 = 180秒 = 180000毫秒
        STAY_TIME: 3 * 60 * 1000,
        // localStorage键名
        STORAGE_KEY: 'site_feedback_shown',
        // 调试模式（设为true可立即测试）
        DEBUG: false
    };
    
    // 检查是否已经显示过弹窗（避免重复打扰用户）
    function hasShownFeedback() {
        try {
            return localStorage.getItem(CONFIG.STORAGE_KEY) === 'true';
        } catch (e) {
            return false;
        }
    }
    
    // 标记已显示弹窗
    function markFeedbackShown() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, 'true');
        } catch (e) {
            // 忽略localStorage错误
        }
    }
    
    // 创建弹窗HTML
    function createModal() {
        // 检查是否已存在
        if (document.getElementById('easter-egg-modal')) {
            return;
        }
        
        const modal = document.createElement('div');
        modal.id = 'easter-egg-modal';
        modal.innerHTML = `
            <div class="easter-egg-overlay"></div>
            <div class="easter-egg-content">
                <div class="easter-egg-emoji">🎁</div>
                <h3 class="easter-egg-title">嗨！打扰一下~</h3>
                <p class="easter-egg-text">你已经在这个网站逛了3分钟了<br>觉得这些内容对你有帮助吗？</p>
                <div class="easter-egg-buttons">
                    <button class="easter-egg-btn easter-egg-yes" onclick="window.easterEggFeedback(true)">
                        ✅ 有帮助
                    </button>
                    <button class="easter-egg-btn easter-egg-no" onclick="window.easterEggFeedback(false)">
                        ❌ 没有帮助
                    </button>
                </div>
            </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            #easter-egg-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 99999;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
                animation: easterEggFadeIn 0.3s ease;
            }
            
            @keyframes easterEggFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .easter-egg-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(4px);
            }
            
            .easter-egg-content {
                position: relative;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 20px;
                padding: 35px 30px;
                text-align: center;
                max-width: 320px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: easterEggPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                color: white;
            }
            
            @keyframes easterEggPopIn {
                from { 
                    opacity: 0; 
                    transform: scale(0.8) translateY(20px); 
                }
                to { 
                    opacity: 1; 
                    transform: scale(1) translateY(0); 
                }
            }
            
            .easter-egg-emoji {
                font-size: 3rem;
                margin-bottom: 15px;
                animation: easterEggBounce 1s ease infinite;
            }
            
            @keyframes easterEggBounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            .easter-egg-title {
                font-size: 1.4rem;
                font-weight: 700;
                margin: 0 0 12px 0;
                color: #fff;
            }
            
            .easter-egg-text {
                font-size: 1rem;
                line-height: 1.6;
                margin: 0 0 25px 0;
                color: rgba(255, 255, 255, 0.95);
            }
            
            .easter-egg-buttons {
                display: flex;
                gap: 12px;
                justify-content: center;
            }
            
            .easter-egg-btn {
                padding: 12px 24px;
                border: none;
                border-radius: 25px;
                font-size: 0.95rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                flex: 1;
            }
            
            .easter-egg-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }
            
            .easter-egg-btn:active {
                transform: translateY(0);
            }
            
            .easter-egg-yes {
                background: #2ecc71;
                color: white;
            }
            
            .easter-egg-yes:hover {
                background: #27ae60;
            }
            
            .easter-egg-no {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 2px solid rgba(255, 255, 255, 0.3);
            }
            
            .easter-egg-no:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            /* 反馈提示样式 */
            .easter-egg-toast {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px 30px;
                border-radius: 15px;
                font-size: 1.1rem;
                z-index: 100000;
                animation: easterEggToastIn 0.3s ease;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            }
            
            @keyframes easterEggToastIn {
                from { 
                    opacity: 0; 
                    transform: translate(-50%, -50%) scale(0.8); 
                }
                to { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1); 
                }
            }
            
            @keyframes easterEggToastOut {
                from { 
                    opacity: 1; 
                    transform: translate(-50%, -50%) scale(1); 
                }
                to { 
                    opacity: 0; 
                    transform: translate(-50%, -50%) scale(0.8); 
                }
            }
            
            /* 移动端适配 */
            @media (max-width: 480px) {
                .easter-egg-content {
                    padding: 25px 20px;
                    margin: 20px;
                }
                
                .easter-egg-title {
                    font-size: 1.2rem;
                }
                
                .easter-egg-text {
                    font-size: 0.95rem;
                }
                
                .easter-egg-btn {
                    padding: 10px 18px;
                    font-size: 0.9rem;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // 点击遮罩关闭（可选）
        modal.querySelector('.easter-egg-overlay').addEventListener('click', function() {
            closeModal();
        });
    }
    
    // 关闭弹窗
    function closeModal() {
        const modal = document.getElementById('easter-egg-modal');
        if (modal) {
            modal.style.animation = 'easterEggFadeIn 0.3s ease reverse';
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }
    
    // 显示反馈提示
    function showToast(message) {
        // 先关闭主弹窗
        closeModal();
        
        // 显示反馈提示
        setTimeout(() => {
            const toast = document.createElement('div');
            toast.className = 'easter-egg-toast';
            toast.innerHTML = message;
            document.body.appendChild(toast);
            
            // 2秒后自动消失
            setTimeout(() => {
                toast.style.animation = 'easterEggToastOut 0.3s ease forwards';
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }, 2000);
        }, 350);
    }
    
    // 反馈处理函数（暴露到全局）
    window.easterEggFeedback = function(isHelpful) {
        markFeedbackShown();
        
        if (isHelpful) {
            // 选择"是"，直接关闭弹窗
            closeModal();
        } else {
            // 选择"否"，显示感谢反馈
            showToast('谢谢你的反馈TvT');
        }
    };
    
    // 初始化
    function init() {
        // 如果已经显示过，不再显示
        if (hasShownFeedback() && !CONFIG.DEBUG) {
            return;
        }
        
        // 页面加载后开始计时
        const startTime = Date.now();
        
        // 检查停留时间的函数
        function checkStayTime() {
            const elapsed = Date.now() - startTime;
            
            if (elapsed >= CONFIG.STAY_TIME) {
                // 达到3分钟，显示弹窗
                if (!document.getElementById('easter-egg-modal')) {
                    createModal();
                }
            } else {
                // 继续检查
                requestAnimationFrame(checkStayTime);
            }
        }
        
        // 开始检查（使用 requestAnimationFrame 更节能）
        // 但为了简化，使用 setTimeout 也可以
        setTimeout(() => {
            if (!hasShownFeedback() || CONFIG.DEBUG) {
                createModal();
            }
        }, CONFIG.STAY_TIME);
        
        // 用户交互后重置计时器（可选功能）
        let activityTimer;
        function resetTimer() {
            clearTimeout(activityTimer);
            // 如果有弹窗，不重置
            if (!document.getElementById('easter-egg-modal')) {
                activityTimer = setTimeout(() => {
                    if (!hasShownFeedback() || CONFIG.DEBUG) {
                        createModal();
                    }
                }, CONFIG.STAY_TIME);
            }
        }
        
        // 监听用户活动（可选：用户长时间无操作后重新计时）
        ['click', 'scroll', 'keypress'].forEach(event => {
            document.addEventListener(event, resetTimer, { passive: true });
        });
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
