// eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
const { execSync } = require('child_process');

// eslint-disable-next-line no-undef
module.exports = async function (context) {
  if (context.electronPlatformName !== 'darwin') return;

  const appPath = context.appOutDir + '/' + context.packager.appInfo.productFilename + '.app';

  console.log('Removing quarantine from:', appPath);

  execSync(`xattr -cr "${appPath}"`);
};
