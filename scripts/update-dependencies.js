const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

try {
  const componentsProjectRootPath = process.cwd();
  const componentsInPackagePath = path.join(componentsProjectRootPath, 'packages', 'angular-sdk-components');
  const overridesPackagePath = path.join(componentsProjectRootPath, 'packages', 'angular-sdk-overrides');
  const distInComponentsPath = path.join(componentsProjectRootPath, 'dist');
  const componentsInDistPath = path.join(distInComponentsPath, 'angular-sdk-components');

  /** Create readline interface to ask for angular-sdk project path */
  const readLineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readLineInterface.question('Please enter the absolute path of angular-sdk project: ', sdkProjectPathInput => {
    readLineInterface.close();
    const sdkProjectRootPath = path.resolve(sdkProjectPathInput);

    /** Delete existing dist folder before build */
    if (fs.existsSync(distInComponentsPath)) {
      console.log(`---- Removing existing dist folder: ${distInComponentsPath} ----`);
      fs.rmSync(distInComponentsPath, { recursive: true, force: true });
    }

    /** Build angular-sdk-components in packages folder */
    console.log(`---- Building angular-sdk-components at: ${componentsInPackagePath} ----`);
    execFileSync('ng', ['build', 'angular-sdk-components'], { cwd: componentsInPackagePath, stdio: 'inherit' });

    /** Package angular-sdk-components in dist folder */
    console.log(`---- Packing npm package in: ${componentsInDistPath} ----`);
    execFileSync('npm', ['pack'], { cwd: componentsInDistPath, stdio: 'inherit' });

    /** Find the generated 'angular-sdk-components' .tgz file */
    const componentsTgzFile = fs
      .readdirSync(componentsInDistPath)
      .find(file => file.endsWith('.tgz') && file.indexOf('pega-angular-sdk-components') > -1);
    if (!componentsTgzFile) {
      throw new Error('No .tgz file found in dist folder!');
    }

    const componentsTgzPath = path.join(path.join(distInComponentsPath, 'angular-sdk-components'), componentsTgzFile);
    const componentTargetTgzPath = path.join(sdkProjectRootPath, componentsTgzFile);

    /** Delete components .tgz file if exists in angular-sdk folder */
    const existingTgzInSDK = fs
      .readdirSync(sdkProjectRootPath)
      .find(file => file.endsWith('.tgz') && file.indexOf('pega-angular-sdk-components') > -1);
    if (existingTgzInSDK) {
      console.log(`---- Removing old package: ${existingTgzInSDK} ----`);
      fs.unlinkSync(path.join(sdkProjectRootPath, existingTgzInSDK));
    }

    console.log(`---- Copying ${componentsTgzFile} to angular-sdk folder: ${sdkProjectRootPath} ----`);
    fs.copyFileSync(componentsTgzPath, componentTargetTgzPath);

    /** Build and package 'angular-sdk-overrides' */

    /** Delete existing .tgz file before building */
    const existingOverridesTgzInComponents = fs
      .readdirSync(overridesPackagePath)
      .find(file => file.endsWith('.tgz') && file.indexOf('pega-angular-sdk-overrides') > -1);
    if (existingOverridesTgzInComponents) {
      console.log(`---- Removing existing tgz: ${existingOverridesTgzInComponents} ----`);
      fs.unlinkSync(path.join(overridesPackagePath, existingOverridesTgzInComponents));
    }

    console.log('Building angular-sdk-overrides.......');
    execFileSync('npm', ['run', 'build-sdk'], { cwd: componentsProjectRootPath, stdio: 'inherit' });
    execFileSync('npm', ['run', 'build-overrides'], { cwd: componentsProjectRootPath, stdio: 'inherit' });
    execFileSync('npm', ['pack'], { cwd: overridesPackagePath, stdio: 'inherit' });

    const overridesTgzFile = fs
      .readdirSync(overridesPackagePath)
      .find(file => file.endsWith('.tgz') && file.indexOf('pega-angular-sdk-overrides') > -1);
    if (!overridesTgzFile) {
      throw new Error('No overrides .tgz file found');
    }

    const overridesTgzPath = path.join(overridesPackagePath, overridesTgzFile);
    const overridesTargetTgzPath = path.join(sdkProjectRootPath, overridesTgzFile);

    const existingOverridesTgzInSDK = fs
      .readdirSync(sdkProjectRootPath)
      .find(file => file.endsWith('.tgz') && file.indexOf('pega-angular-sdk-overrides') > -1);
    if (existingOverridesTgzInSDK) {
      console.log(`---- Removing old package: ${existingOverridesTgzInSDK} ----`);
      fs.unlinkSync(path.join(sdkProjectRootPath, existingOverridesTgzInSDK));
    }

    console.log(`---- Copying ${overridesTgzFile} to angular-sdk folder: ${sdkProjectRootPath} ----`);
    fs.copyFileSync(overridesTgzPath, overridesTargetTgzPath);

    /** Install the built packages in angular-sdk project */
    console.log(`---- Installing ${componentsTgzFile} in angular-sdk ----`);
    execFileSync('npm', ['install', `./${componentsTgzFile}`], { cwd: sdkProjectRootPath, stdio: 'inherit' });
    console.log("Done!!! 'angular-sdk' now uses local build of angular-sdk-components.");
    console.log(`---- Installing ${overridesTgzFile} in angular-sdk ----`);
    execFileSync('npm', ['install', `./${overridesTgzFile}`], { cwd: sdkProjectRootPath, stdio: 'inherit' });
    console.log("Done!!! 'angular-sdk' now uses local build of angular-sdk-overrides.");
  });
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
