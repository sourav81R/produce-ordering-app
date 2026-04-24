const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT || 8080);
const apkPath = path.resolve(
  __dirname,
  '..',
  'android',
  'app',
  'build',
  'outputs',
  'apk',
  'release',
  'app-release.apk'
);
const publicFileName = 'GoVigi-Produce-v1.0.0.apk';

if (!fs.existsSync(apkPath)) {
  console.error(`APK not found at ${apkPath}`);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(
      `<html><body style="font-family: sans-serif; padding: 24px;">
        <h2>GoVigi APK Share</h2>
        <p><a href="/${publicFileName}">${publicFileName}</a></p>
      </body></html>`
    );
    return;
  }

  if (req.url === '/app-release.apk' || req.url === `/${publicFileName}`) {
    const stats = fs.statSync(apkPath);
    res.writeHead(200, {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Length': stats.size,
      'Content-Disposition': `attachment; filename="${publicFileName}"`,
    });
    fs.createReadStream(apkPath).pipe(res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`APK server running on port ${port}`);
  console.log(`Serving file: ${apkPath}`);
});
