#!/usr/bin/env node

const os = require('os');
const fs = require('fs');
const path = require('path');

console.log('🔍 Проверка операционной системы перед сборкой...');

const platform = os.platform();
const arch = os.arch();

console.log(`📋 Платформа: ${platform}`);
console.log(`🏗️ Архитектура: ${arch}`);

// Определяем пути для разных ОС
const configPaths = {
  'linux': path.join(os.homedir(), '.i2pd'),
  'darwin': path.join(os.homedir(), 'Library', 'Application Support', 'i2pd'),
  'win32': path.join(os.homedir(), 'AppData', 'Roaming', 'i2pd')
};

const executablePaths = {
  'linux': 'Lin/i2pd',
  'darwin': 'Mac/i2pd',
  'win32': 'Win/i2pd.exe'
};

const configPath = configPaths[platform] || path.join(os.homedir(), '.i2pd');
const executablePath = executablePaths[platform];

console.log(`📁 Путь к конфигу: ${configPath}`);
console.log(`⚙️ Путь к исполняемому файлу: ${executablePath}`);

// Проверяем существование исполняемого файла
const fullExecutablePath = path.join(__dirname, executablePath);
if (!fs.existsSync(fullExecutablePath)) {
  console.error(`❌ Исполняемый файл не найден: ${fullExecutablePath}`);
  process.exit(1);
}

console.log(`✅ Исполняемый файл найден: ${fullExecutablePath}`);

// Проверяем права на выполнение для Linux
if (platform === 'linux') {
  try {
    fs.accessSync(fullExecutablePath, fs.constants.X_OK);
    console.log('✅ Права на выполнение установлены');
  } catch (error) {
    console.log('⚠️ Устанавливаем права на выполнение...');
    fs.chmodSync(fullExecutablePath, '755');
    console.log('✅ Права на выполнение установлены');
  }
}

// Для Linux проверяем системную директорию конфигов
if (platform === 'linux') {
  if (!fs.existsSync(configPath)) {
    console.log(`⚠️ Системная директория ${configPath} не существует`);
    console.log(`📁 Будет использоваться директория проекта: ${__dirname}`);
  } else {
    console.log(`✅ Системная директория найдена: ${configPath}`);
  }
}

// Создаем файл с информацией о платформе для использования в приложении
const platformInfo = {
  platform,
  arch,
  configPath,
  executablePath,
  timestamp: new Date().toISOString()
};

fs.writeFileSync(
  path.join(__dirname, 'platform-info.json'),
  JSON.stringify(platformInfo, null, 2)
);

console.log('📄 Информация о платформе сохранена в platform-info.json');
console.log('✅ Проверка завершена успешно!');
