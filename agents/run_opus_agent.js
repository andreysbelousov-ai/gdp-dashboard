#!/usr/bin/env node

/**
 * Opus 4.5 Agent Runner
 * 
 * Этот скрипт демонстрирует запуск агента на модели Opus 4.5 в режиме "agent".
 * Он читает конфигурацию из .github/agents/opus-4.5-agent.json,
 * отправляет запрос к API и логирует ответ.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Путь к файлу конфигурации
const CONFIG_PATH = path.join(__dirname, '..', '.github', 'agents', 'opus-4.5-agent.json');

// API endpoint (замените на актуальный URL вашего провайдера)
const API_ENDPOINT = process.env.OPUS_API_ENDPOINT || 'https://api.anthropic.com/v1/messages';

// API ключ из переменной окружения
const API_KEY = process.env.OPUS_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;

/**
 * Читает конфигурацию агента из JSON файла
 */
function readAgentConfig() {
  try {
    const configContent = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(configContent);
  } catch (error) {
    console.error(`❌ Ошибка при чтении конфигурации: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Отправляет запрос к API для запуска агента
 */
function runAgent(config) {
  if (!API_KEY) {
    console.error('❌ Ошибка: не установлен API ключ!');
    console.error('Пожалуйста, установите переменную окружения OPUS_API_KEY, ANTHROPIC_API_KEY или OPENAI_API_KEY');
    process.exit(1);
  }

  console.log('🚀 Запуск агента Opus 4.5...');
  console.log(`📋 Имя агента: ${config.name}`);
  console.log(`🤖 Модель: ${config.model}`);
  console.log(`⚙️  Режим: ${config.mode}`);
  console.log(`💬 Начальное сообщение: ${config.initial_message}`);
  console.log('');

  // Подготовка данных запроса
  const requestData = JSON.stringify({
    model: config.model,
    messages: [
      {
        role: 'user',
        content: config.initial_message
      }
    ],
    max_tokens: 1024,
    tools: config.tools || []
  });

  // Парсинг URL
  const url = new URL(API_ENDPOINT);
  
  // Настройки запроса
  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestData),
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01'
    }
  };

  // Отправка запроса
  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('📥 Ответ получен:');
      console.log('─'.repeat(80));
      
      try {
        const response = JSON.parse(data);
        console.log(JSON.stringify(response, null, 2));
        
        if (response.error) {
          console.error('');
          console.error('❌ Ошибка API:', response.error);
          process.exit(1);
        }
        
        console.log('');
        console.log('✅ Агент успешно выполнен!');
      } catch (error) {
        console.log(data);
        console.error('');
        console.error('❌ Ошибка при парсинге ответа:', error.message);
        process.exit(1);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Ошибка при выполнении запроса:', error.message);
    process.exit(1);
  });

  req.write(requestData);
  req.end();
}

/**
 * Главная функция
 */
function main() {
  console.log('═'.repeat(80));
  console.log('  Opus 4.5 Agent Runner');
  console.log('═'.repeat(80));
  console.log('');

  // Проверка наличия конфигурационного файла
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`❌ Файл конфигурации не найден: ${CONFIG_PATH}`);
    process.exit(1);
  }

  // Чтение конфигурации
  const config = readAgentConfig();

  // Запуск агента
  runAgent(config);
}

// Запуск скрипта
if (require.main === module) {
  main();
}

module.exports = { readAgentConfig, runAgent };
