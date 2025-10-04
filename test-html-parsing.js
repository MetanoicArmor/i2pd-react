// Тестовый скрипт для проверки парсинга статистики i2pd

// Пример HTML из веб-консоли i2pd
const mockHTML = `
<!DOCTYPE html>
<html lang="en">
<head><title>Purple I2P Webconsole</title></head>
<body>
<div id="main">
  <div class="header">
    <h1>i2pd webconsole</h1>
  </div>
  <div class="content">
    <p><b>Version:</b> 2.58.0</p>
    <p><b>Uptime:</b> 2:15:43</p>
    <p><b>Network status:</b> OK</p>
    <p><b>Tunnels:</b> 12</p>
    <p><b>Transit:</b> 3</p>
    <p><b>Routers:</b> 156</p>
    <p><b>Client tunnels:</b> 8</p>
    <p><b>Transit tunnels:</b> 4</p>
    <p><b>Received:</b> 1.2 MB</p>
    <p><b>Sent:</b> 856 KB</p>
    <p><b>Transit received:</b> 345 KB</p>
    <p><b>Transit sent:</b> 234 KB</p>
    <p><b>Data path:</b> /Users/vade/.i2pd</p>
  </div>
</div>
</body>
</html>
`;

// Функция парсинга (из NetworkStatsService.js)
function parseHTMLStats(html) {
  try {
    const stats = {};
    
    // Парсим Uptime
    const uptimeMatch = html.match(/Uptime:\s*<\/b>\s*(\d+:\d+:\d+)/i);
    if (uptimeMatch) {
      stats.uptime = uptimeMatch[1];
      console.log('✅ Uptime:', stats.uptime);
    } else {
      console.log('❌ Uptime не найден');
    }
    
    // Парсим Network status
    const statusMatch = html.match(/Network status:\s*<\/b>\s*(\w+)/i);
    if (statusMatch) {
      stats.networkStatus = statusMatch[1];
      console.log('✅ Network status:', stats.networkStatus);
    } else {
      console.log('❌ Network status не найден');
    }
    
    // Парсим Tunnels
    const tunnelsMatch = html.match(/Tunnels:\s*<\/b>\s*(\d+)/i);
    if (tunnelsMatch) {
      stats.activeTunnels = parseInt(tunnelsMatch[1]);
      console.log('✅ Tunnels:', stats.activeTunnels);
    } else {
      console.log('❌ Tunnels не найден');
    }
    
    // Парсим Transit tunnels
    const transitMatch = html.match(/Transit:\s*<\/b>\s*(\d+)/i);
    if (transitMatch) {
      stats.transitTunnels = parseInt(transitMatch[1]);
      console.log('✅ Transit:', stats.transitTunnels);
    } else {
      console.log('❌ Transit не найден');
    }
    
    // Парсим Routers
    const routersMatch = html.match(/Routers:\s*<\/b>\s*(\d+)/i);
    if (routersMatch) {
      stats.peerCount = parseInt(routersMatch[1]);
      console.log('✅ Routers:', stats.peerCount);
    } else {
      console.log('❌ Routers не найден');
    }
    
    // Парсим Client tunnels
    const clientTunnelsMatch = html.match(/Client tunnels:\s*<\/b>\s*(\d+)/i);
    if (clientTunnelsMatch) {
      stats.clientTunnels = parseInt(clientTunnelsMatch[1]);
      console.log('✅ Client tunnels:', stats.clientTunnels);
    } else {
      console.log('❌ Client tunnels не найден');
    }
    
    // Парсим Transit tunnels count
    const transitCountMatch = html.match(/Transit tunnels:\s*<\/b>\s*(\d+)/i);
    if (transitCountMatch) {
      stats.transitTunnelsCount = parseInt(transitCountMatch[1]);
      console.log('✅ Transit tunnels:', stats.transitTunnelsCount);
    } else {
      console.log('❌ Transit tunnels не найден');
    }
    
    // Парсим Received/Sent
    const receivedMatch = html.match(/Received:\s*<\/b>\s*([\d.]+)\s*(\w+)/i);
    if (receivedMatch) {
      stats.bytesReceived = `${receivedMatch[1]} ${receivedMatch[2]}`;
      console.log('✅ Received:', stats.bytesReceived);
    } else {
      console.log('❌ Received не найден');
    }
    
    const sentMatch = html.match(/Sent:\s*<\/b>\s*([\d.]+)\s*(\w+)/i);
    if (sentMatch) {
      stats.bytesSent = `${sentMatch[1]} ${sentMatch[2]}`;
      console.log('✅ Sent:', stats.bytesSent);
    } else {
      console.log('❌ Sent не найден');
    }
    
    // Парсим Transit data
    const transitReceivedMatch = html.match(/Transit received:\s*<\/b>\s*([\d.]+)\s*(\w+)/i);
    if (transitReceivedMatch) {
      stats.transitReceived = `${transitReceivedMatch[1]} ${transitReceivedMatch[2]}`;
      console.log('✅ Transit received:', stats.transitReceived);
    } else {
      console.log('❌ Transit received не найден');
    }
    
    const transitSentMatch = html.match(/Transit sent:\s*<\/b>\s*([\d.]+)\s*(\w+)/i);
    if (transitSentMatch) {
      stats.transitSent = `${transitSentMatch[1]} ${transitSentMatch[2]}`;
      console.log('✅ Transit sent:', stats.transitSent);
    } else {
      console.log('❌ Transit sent не найден');
    }
    
    // Парсим Data path
    const dataPathMatch = html.match(/Data path:\s*<\/b>\s*([^\n<]+)/i);
    if (dataPathMatch) {
      stats.dataPath = dataPathMatch[1].trim();
      console.log('✅ Data path:', stats.dataPath);
    } else {
      console.log('❌ Data path не найден');
    }
    
    console.log('\n📊 Итоговая статистика:');
    console.log(JSON.stringify(stats, null, 2));
    
    return stats;
  } catch (error) {
    console.error('❌ Ошибка парсинга HTML:', error);
    return {};
  }
}

// Запускаем тест
console.log('🧪 Тестирование парсинга HTML веб-консоли i2pd\n');
console.log('=' .repeat(60));
parseHTMLStats(mockHTML);
console.log('=' .repeat(60));
