const shell = require('shelljs');
const fs = require('fs-extra');
const path = require('path');
const site = require('./site');
const links = require('./links');
const linter = require('./linter');
const version = require('./version');
const argv = require('yargs').argv;
const utils = require('./utils');

const presidium = module.exports;

presidium.clean = function(conf) {
	const dist = conf.distPath;
	console.log(`Cleaning all files and folders in: ${dist}`);
	fs.removeSync(dist);
	fs.mkdirsSync(dist);
};

presidium.requirements = function(conf) {
	shell.exec(`./${path.join(conf.corePath, 'bin', 'presidium-requirements.sh')}`);
};

presidium.install = function(conf) {
	presidium.requirements(conf);

	console.log(`Creating ${conf.distPath}...`);
	const dist = conf.distPath;
	fs.mkdirsSync(dist);

	console.log('Copying Gemfile...');
	fs.mkdirsSync(conf.jekyllPath);
	fs.copySync(path.join(conf.corePath, '.jekyll'), conf.jekyllPath);

	const pwd = shell.pwd();

	console.log('Installing Jekyll Gems...');
	shell.cd(conf.jekyllPath);
	shell.exec('bundle install --path=.bundle --deployment');

	console.log('Removing unused gems...');
	shell.exec('bundle clean');

	shell.cd(pwd);
};

presidium.generate = function(conf) {
	console.log('Copy base templates...');
	fs.copySync(path.join(conf.corePath, '_includes'), conf.distIncludesPath);
	fs.copySync(path.join(conf.corePath, '_layouts'), conf.distLayoutsPath);
	fs.copySync(path.join(conf.corePath, 'media'), conf.distMediaPath);

	console.log('Write resolved config to the build directory...');
	fs.writeFileSync(path.join(conf.distSrcPath, '_config.yml'), conf.raw, 'utf8');

	console.log('Copy media assets...');
	fs.copySync(conf.mediaPath, conf.distMediaPath);

	console.log('Copy content...');
	fs.copySync(conf.contentPath, conf.distSrcPath);

	console.log('Generate site structure...');
	site.generate(conf);
};

presidium.build = function(conf) {
	// Manage extra config files
	const configFiles = `${argv.config}`;
	let extraConf = '';
	if (argv.config) {
		extraConf = configFiles.split(',').map((x) => {
			x = path.isAbsolute(x) ? x : `../${x}`;
			return x;
		});
	}
	extraConf = extraConf ? `,${extraConf}` : '';

	console.log('Building site...');
	const pwd = shell.pwd();
	shell.cd(conf.jekyllPath);
	let resolvedDistSrcPath = path.isAbsolute(conf.distSrcPath) ? conf.distSrcPath : `../${conf.distSrcPath}`;
	let resolvedDistSitePath = path.isAbsolute(conf.distSitePath) ? conf.distSitePath : `../${conf.distSitePath}`;
	const cmd = `bundle exec jekyll build --config ${path.join(
		resolvedDistSrcPath,
		'_config.yml'
	)}${extraConf} --trace -s ${resolvedDistSrcPath} -d ${resolvedDistSitePath}`;

	console.log(`Executing: ${cmd}`);
	shell.exec(cmd);
	shell.cd(pwd);
};

presidium.validate = function(conf) {
	const results = links.validate(conf, argv);
	if (results.broken > 0 && argv.fail_on_errors === 'true')
		throw new Error('There are broken links in the site. Can not proceed.');
	if (argv.check && utils.contains(argv.check, 'author')) linter.validate(conf, argv);
};

presidium.watch = function(conf) {
	console.log('Watching Content and Media...');
	shell.exec(`cpx --watch "${conf.contentPath}/**" "${conf.distContentPath}/"`, { async: true });
	shell.exec(`cpx --watch "${conf.mediaPath}/**" "${conf.distMediaPath}/"`, { async: true });
};

presidium.develop = function(conf) {
	console.log('Watching Presidium...');
	shell.exec(
		`cpx --watch --verbose "node_modules/presidium-core/_includes/**" "${conf.distIncludesPath}/"`,
		{ async: true }
	);
	shell.exec(
		`cpx --watch --verbose "node_modules/presidium-core/_layouts/**" "${conf.distLayoutsPath}/"`,
		{ async: true }
	);
	shell.exec(
		`cpx --watch --verbose "node_modules/presidium-core/media/**" "${conf.distMediaPath}/"`,
		{ async: true }
	);
};

presidium.serve = function(conf) {
	console.log('Serving...');
	shell.cd('.jekyll');

	const resolvedDistSrcPath = path.isAbsolute(conf.distSrcPath) ? conf.distSrcPath : `../${conf.distSrcPath}`;
	const resolvedDistSitePath = path.isAbsolute(conf.distSitePath) ? conf.distSitePath : `../${conf.distSitePath}`;
	const portArg = conf.port ? `--port ${conf.port}` : '';
	shell.exec(`bundle exec jekyll serve -s ${resolvedDistSrcPath} -d ${resolvedDistSitePath} ${portArg}`, {
		async: true
	});
	shell.cd('..');
};

presidium.ghPages = function(conf) {
	console.log('Publishing to Github Pages...');
	const syncPath = path.join(version.path, conf.version);
	if (!shell.test('-d', syncPath)) {
		fs.mkdirsSync(syncPath);
	}
	shell.exec(`rsync -r ./dist/site/ ${syncPath}`);

	if (conf.cname) {
		console.log(`Using CNAME record: ${conf.cname}`);
		const file = path.join(version.path, 'CNAME');
		fs.writeFileSync(file, conf.cname);
	}

	version.updateVersionsJson(conf);

	shell.cd(version.path);
	shell.exec(`git add -A &&
        git commit -m "Publish Update: ${conf.version || 'latest'}" &&
        git push origin gh-pages`);
	shell.cd('..');
};
