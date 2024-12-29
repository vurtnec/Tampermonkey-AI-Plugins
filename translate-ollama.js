// ==UserScript==
// @name         Ollama Translator
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Send selected text to Ollama's local model
// @author       Vurtnec
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      localhost
// ==/UserScript==

(function () {
    'use strict';

    // Add styles for the popup
    GM_addStyle(`
        #ollama-popup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #ffffff;
            border: none;
            border-radius: 16px;
            padding: 24px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 10000;
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            animation: popup-fade-in 0.3s ease-out;
        }

        @keyframes popup-fade-in {
            from {
                opacity: 0;
                transform: translate(-50%, -48%);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%);
            }
        }

        #ollama-popup::-webkit-scrollbar {
            width: 8px;
        }

        #ollama-popup::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }

        #ollama-popup::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
        }

        #ollama-popup::-webkit-scrollbar-thumb:hover {
            background: #555;
        }

        #ollama-popup-close {
            position: absolute;
            top: 16px;
            right: 16px;
            cursor: pointer;
            font-size: 24px;
            color: #666;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
            background: transparent;
        }

        #ollama-popup-close:hover {
            background: #f0f0f0;
            color: #333;
        }

        #ollama-popup h2 {
            margin: 0 0 20px 0;
            font-size: 1.5em;
            font-weight: 600;
            color: #1a1a1a;
        }

        #ollama-popup-content {
            margin-top: 20px;
            white-space: pre-wrap;
            line-height: 1.6;
            color: #333;
            font-size: 1rem;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;
        }

        .loading-spinner {
            display: inline-block;
            width: 50px;
            height: 50px;
            border: 3px solid #f3f3f3;
            border-radius: 50%;
            border-top: 3px solid #3498db;
            animation: spin 1s linear infinite;
            margin-bottom: 10px;
        }

        .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .loading-text {
            color: #666;
            font-size: 1rem;
            margin-top: 10px;
        }

        .loading-dots:after {
            content: '.';
            animation: dots 1.5s steps(5, end) infinite;
            font-size: 20px;
            line-height: 1;
        }

        @keyframes dots {
            0%, 20% { content: '.'; }
            40% { content: '..'; }
            60% { content: '...'; }
            80% { content: '....'; }
            100% { content: '.'; }
        }
    `);

    // Create popup element
    function createPopup() {
        const popup = document.createElement('div');
        popup.id = 'ollama-popup';
        popup.innerHTML = `
            <span id="ollama-popup-close">×</span>
            <h2>Translation</h2>
            <div id="ollama-popup-content">
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;
        document.body.appendChild(popup);

        // Close button functionality with animation
        document.getElementById('ollama-popup-close').addEventListener('click', () => {
            closePopup(popup);
        });

        document.addEventListener('click', function outsideClickListener(event) {
            if (!popup.contains(event.target) && document.body.contains(popup)) {
                closePopup(popup);
                document.removeEventListener('click', outsideClickListener);
            }
        });

        return popup;
    }

    function closePopup(popup) {
        popup.style.opacity = '0';
        popup.style.transform = 'translate(-50%, -48%)';
        setTimeout(() => {
            if (document.body.contains(popup)) {
                document.body.removeChild(popup);
            }
        }, 300);
    }

    // Function to show translation
    function showTranslation(text) {
        const existingPopup = document.getElementById('ollama-popup');
        const contentElement = existingPopup.querySelector('#ollama-popup-content');
        contentElement.innerHTML = `<div class="translation-content">${text}</div>`;
    }

    // Send text to Ollama
    function sendToOllama(text) {
        let popup = document.getElementById('ollama-popup');
        if (!popup) {
            popup = createPopup();
        }

        const apiUrl = "http://localhost:11434/api/chat";
        const modelName = "qwen2.5:7b";
        const requestData = {
            "model": modelName,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a highly skilled translation engine with expertise in the IT technology sector. Your function is to translate texts accurately into Chinese, maintaining the original format, technical terms, and abbreviations. Do not add any explanations or annotations to the translated text."
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            "stream": false
        };

        GM_xmlhttpRequest({
            method: "POST",
            url: apiUrl,
            data: JSON.stringify(requestData),
            headers: {
                "Content-Type": "application/json",
            },
            onload: function (response) {
                if (response.status === 200) {
                    try {
                        const responseData = JSON.parse(response.responseText);
                        const messageContent = responseData.message?.content;
                        if (messageContent) {
                            showTranslation(messageContent);
                        } else {
                            showTranslation("No translation content received.");
                        }
                    } catch (error) {
                        showTranslation("Error parsing Ollama response.");
                    }
                } else {
                    showTranslation(`Ollama Error: ${response.statusText}`);
                }
            },
            onerror: function () {
                showTranslation("Failed to connect to Ollama. Please check if it's running locally.");
            },
        });
    }

    // Register context menu
    GM_registerMenuCommand("Ollama Translator", () => {
        const selectedText = window.getSelection().toString();

        if (selectedText) {
            sendToOllama(selectedText);
        } else {
            showTranslation("No text selected. Please select some text first.");
        }
    });

    // Add keyboard shortcut
    document.addEventListener('keydown', (event) => {
        // Mac: Option + Q (altKey for Mac's Option key)
        if (event.altKey && event.code === 'KeyQ') {
            // Prevent the default Option+Q behavior
            // event.preventDefault();

            const selectedText = window.getSelection().toString();

            if (selectedText) {
                sendToOllama(selectedText);
            } else {
                showTranslation("No text selected. Please select some text first.");
            }
        }
    });
})();