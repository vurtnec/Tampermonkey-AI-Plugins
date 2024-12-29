# Tampermonkey AI Plugins

## Overview
This repository contains Tampermonkey userscripts that leverage AI services for various text-related tasks.

## Plugins

### 1. Translate OpenRouter
- **File**: `translate-openrouter.js`
- **Functionality**: Translates selected text using OpenRouter AI
- **Configuration**: 
  - Replace `YOUR_OPENROUTER_API_KEY` with your actual OpenRouter API key
  - Customize target language as needed

### 2. Summarize OpenRouter
- **File**: `summarize-openrouter.js`
- **Functionality**: Generates summaries of selected text using OpenRouter AI
- **Configuration**: 
  - Replace `YOUR_OPENROUTER_API_KEY` with your actual OpenRouter API key

### 3. Translate Ollama
- **File**: `translate-ollama.js`
- **Functionality**: Translates selected text using local Ollama AI service
- **Configuration**: 
  - Ensure Ollama is running locally
  - Adjust API endpoint if necessary

## Setup Instructions

1. Install Tampermonkey browser extension
2. Create a new script in Tampermonkey
3. Copy and paste the desired script
4. Replace API keys with your own credentials
5. Save and enable the script

## API Key Configuration

For OpenRouter scripts:
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Generate an API key
3. Replace `YOUR_OPENROUTER_API_KEY` in the script with your key

## Requirements
- Tampermonkey browser extension
- Internet connection
- API key for OpenRouter (for cloud-based scripts)
- Local Ollama setup (for Ollama script)

## Disclaimer
Ensure compliance with the terms of service of the AI providers you're using.
