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
            background-color: white;
            border: 2px solid #333;
            border-radius: 10px;
            padding: 20px;
            max-width: 500px;
            width: 90%;
            max-height: 70%;
            overflow-y: auto;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        #ollama-popup-close {
            position: absolute;
            top: 10px;
            right: 10px;
            cursor: pointer;
            font-size: 20px;
        }
        #ollama-popup-content {
            margin-top: 20px;
            white-space: pre-wrap;
        }
    `);

    // Create popup element
    function createPopup() {
        const popup = document.createElement('div');
        popup.id = 'ollama-popup';
        popup.innerHTML = `
            <span id="ollama-popup-close">×</span>
            <h2>Ollama Translation</h2>
            <div id="ollama-popup-content">Loading translation...</div>
        `;
        document.body.appendChild(popup);

        // Close button functionality
        document.getElementById('ollama-popup-close').addEventListener('click', () => {
            document.body.removeChild(popup);
        });

        return popup;
    }

    // Function to show translation
    function showTranslation(text) {
        const existingPopup = document.getElementById('ollama-popup');
        if (existingPopup) {
            document.body.removeChild(existingPopup);
        }

        const popup = createPopup();
        const contentElement = document.getElementById('ollama-popup-content');
        contentElement.textContent = text;
    }

    // Send text to Ollama
    function sendToOllama(text) {
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