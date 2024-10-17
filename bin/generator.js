const path = require('node:path');
const process = require('node:process');
const fs = require('node:fs/promises');
const { v4: uuidv4 } = require('uuid');
const os = require('os');

const inquirer = require('inquirer');

const settingsBuild = require('./template/settings-json-template');
const viewTemplate = require('./template/view-template');
const modelTemplate = require('./template/model-template');
const styleTemplate = require('./template/style-template');

const writeContent = async (fileName, content) => {
  await fs.writeFile(fileName, content.replace(/\n/g, os.EOL) + os.EOL);
};

const createJson = async ({ guid, name = '', icon = '', description = '', path }) => {
  try {
    const content = settingsBuild({ guid, name, icon, description });
    await writeContent(path, content);
  } catch (error) {
    console.log(error);
  }
};

const createComponent = async ({ name, path }) => {
  try {
    const content = viewTemplate({ name });
    await writeContent(path, content);
  } catch (error) {
    console.log(error);
  }
};

const createStyle = async ({ path }) => {
  try {
    const content = styleTemplate();
    await writeContent(path, content);
  } catch (error) {
    console.log(error);
  }
};

const createWidget = async ({ name, component, path }) => {
  try {
    const content = modelTemplate({ name, component });
    await writeContent(path, content);
  } catch (error) {
    console.log(error);
  }
};

const options = {
  name: {
    message: 'What is widget name?',
    name: 'name',
    demandOption: true,
    describe: 'Widget name',
    type: 'string',
    validate(input) {
      if (input.length == 0)
        throw Error('Name must not be empty!');
      if (/^[A-Za-z0-9]*$/g.test(input)) {
        return true;
      }
      throw Error('Please only use letters and numbers');
    }
  },
  description: {
    message: 'What is widget descrpition?',
    name: 'description',
    demandOption: false,
    describe: 'Widget description',
    type: 'string',
  },
};

const generate = async () => {
  const answers = await inquirer.prompt(Object.values(options));
  Object.entries(answers).forEach(([key, value]) => {
    value && process.argv.push(`--${key}`, value);
  });

  console.log(answers);
  const { name = '', description = '' } = answers;
  console.log(name, description);
  try {
    const guid = uuidv4();
    const srcPath = path.resolve(process.cwd(), 'src');
    const dirPath = path.join(srcPath, `${name.toLowerCase()}`);
    await fs.mkdir(dirPath);

    const jsonFilePath = path.resolve(dirPath, 'info.json');
    await createJson({ guid, name, description, path: jsonFilePath });

    const styleFilePath = path.resolve(dirPath, 'styles.css');
    await createStyle({ path: styleFilePath });

    const componentFilePath = path.resolve(dirPath, 'view.tsx');
    const componentName = name.at(0).toUpperCase() + name.slice(1);
    await createComponent({ name: componentName, path: componentFilePath });

    const widgetFilePath = path.resolve(dirPath, 'model.tsx');
    await createWidget({
      name: `${name}Widget`,
      component: { name: componentName, filename: 'view' },
      path: widgetFilePath
    });

    console.log(`Widget '${name}' created`);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { generate };