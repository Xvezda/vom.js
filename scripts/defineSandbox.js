const path = require('path');
const util = require('util');
const https = require('https');
const { readdir, access, writeFile } = require('fs/promises');
const { exec, spawnSync } = require('child_process');

const ejs = require('ejs');


const kApiEndpoint = 'https://codesandbox.io/api/v1/sandboxes/define';
const execPromise = util.promisify(exec);

async function listFiles(files='') {
  const { stdout } = await execPromise(
    `git ls-files -z --stage -- ${files}`
  );
  const lines = stdout.split('\0').filter(x => x);
  return lines.reduce((acc, line) => {
    const [prefix, file] = line.split('\t');
    const [mode, object, stage] = prefix.split(' ');
    return acc.concat({
      file,
      mode,
      object,
      stage,
    });
  }, []);
}

async function catFileObject(object, type='blob') {
  const { stdout } = await execPromise(`git cat-file ${type} ${object}`);
  return stdout;
}

async function buildPayload(list) {
  const packageJsonFile = list
    .find(item => item.file.endsWith('package.json'));
  const packageJson = await catFileObject(packageJsonFile.object);

  const baseDir = path.dirname(packageJsonFile.file);
  const isCurrentDir = dirname => dirname === '.';

  const nonPackageJsonFiles = list
    .filter(({ file }) =>
      file.startsWith(isCurrentDir(baseDir) ? '' : baseDir) &&
      !file.endsWith('package.json'))
    .map(item => ({
      ...item,
      file: item.file
        .replace((isCurrentDir(baseDir) ? '' : baseDir) + path.sep, '')
    }));

  const contentPromises = nonPackageJsonFiles
    .map(({ object }) => catFileObject(object));
  const contents = await Promise.all(contentPromises);

  return {
    files: {
      ...nonPackageJsonFiles.reduce((acc, item, i) => (
        {
          ...acc,
          [item.file]: {
            content: contents[i],
            isBinary: false,
          }
        }
      ), {
        'package.json': {
          content: JSON.parse(packageJson),
        }
      }),
    }
  };
}

function request(url, options={}) {
  return new Promise((resolve, reject) => {
    const data = options.body;
    delete options.body;

    const defaultOptions = {
      hostname: url.hostname,
      port: url.port || '443',
      path: url.pathname + url.search,
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
    };

    if (data) {
      if (!mergedOptions.headers) {
        mergedOptions.headers = {};
      }
      mergedOptions.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = https.request(mergedOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function defineSandbox(payload) {
  const url = new URL(kApiEndpoint);
  url.searchParams.set('json', 1);

  const result = await request(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: payload,
  });

  const parsedResult = JSON.parse(result);
  return parsedResult['sandbox_id'];
}

async function listExamples(baseDir) {
  const dirents = await readdir(baseDir, { withFileTypes: true });
  const directories = dirents
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const packages = await Promise.allSettled(
    directories
      .map(directory => (
        new Promise((resolve, reject) => (
          access(path.join(baseDir, directory, 'package.json'))
            .then(() => resolve(directory))
            .catch(reject)
        ))
      ))
  );
  return packages
    .filter(package => package.status === 'fulfilled')
    .map(package => package.value);
}

async function defineExamples(files='examples') {
  const examples = await listExamples(files);
  return await Promise.all(examples.map(async (example) => {
    const pathname = path.join(files, example);
    const stagedFiles = await listFiles(pathname);

    const payloadJson = await buildPayload(stagedFiles);
    const payload = JSON.stringify(payloadJson);

    const sandboxId = await defineSandbox(payload);

    return {
      name: example,
      id: sandboxId,
      path: pathname,
    };
  }));
}

async function getProjectRoot() {
  const { stdout } = await execPromise('git rev-parse --show-toplevel');
  return stdout.trim();
}

async function getLatestHash() {
  const { stdout } = await execPromise(`git log -1 --pretty='format:%h'`);
  return stdout.trim();
}

const renderFile = util.promisify(ejs.renderFile);
const spawn = (command, args, options={}) => {
  return spawnSync(command, args, { stdio: 'inherit', ...options });
};

async function main(argv) {
  const root = await getProjectRoot();
  const baseTemplatePath = path.join(root, 'README');
  const readmeTemplate = baseTemplatePath + '.ejs';

  const demos = await defineExamples();
  const rendered = await renderFile(readmeTemplate, { demos }, {})

  const readme = baseTemplatePath + '.md';
  await writeFile(readme, rendered);

  if (argv.length < 3) {
    spawn('git', ['commit', '-a', '--amend', '--no-edit']);
  } else {
    spawn('git', ['add', readme]);

    const hash = await getLatestHash();
    spawn('git', ['commit', '-m', argv[2].replace('%h', hash)]);
  }
}
main(process.argv);

