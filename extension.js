const vscode = require('vscode');
const fs = require('fs');

const importRegex = /(import[^'"]*|require\()('(.*?)'|"(.*?)")/g;
const stringRegex = /('(.*?)'|"(.*?)")/;

const extraOptions = (context) => [
	{	
		'id': 'test',
		'label': 'generate test file',
		'description': `${context.fileName}.test.${context.pathExt}`
	},
	{
		'id': 'css_module',
		'label': 'generate css module',
		'description': `${context.fileName}.module.css`
	}
]

const updatePath = (s) => {
	const prefix = s.slice(1,3);
	switch(prefix) {
		case('./'):
			return s.substr(0,1) + '.' + s.substr(1);
		case('..'):
			return s.substr(0,1) + '../' + s.substr(1);
		default:
			return s;
	}
}

const updateLocalImports = (path) => {
	const text = fs.readFileSync(path, 'utf-8');
	const updatedText = text.replace(importRegex, (match) => {
		const newPath = match.replace(stringRegex, updatePath)
		return newPath;
	})
	fs.writeFileSync(path, updatedText);
}

const createFolder = (context, options) => {
	fs.mkdirSync(context.folderPath);
	fs.writeFileSync(context.indexPath, context.indexText);
	fs.renameSync(context.path, context.newPath);
	if (options) {
		options.forEach((option) => {
			const name = option.description;
			const path = context.folderPath + '/' + name;
			fs.writeFileSync(path, '');
		})
	}
	updateLocalImports(context.newPath);
}

const showOptions = (context) => {
	return vscode.window.showQuickPick(
		extraOptions(context),
		{
			placeHolder: 'generate additional files',
			canPickMany: true,
			ignoreFocusOut: false
		}
	)
}

const formatImportExport = (name) => (
	`import ${name} from './${name}';\n\nexport default ${name};`
)

const init = (event) => {
	const path = event.fsPath;
	const pathExt = path.split('.').pop();
	const folderPath = path.split('.').slice(0,-1).join('.');
	const fileName = folderPath.split('/').pop();
	const newPath = folderPath + '/' + fileName + '.' + pathExt;
	const indexPath = folderPath + '/index.' + pathExt;
	const indexText = formatImportExport(fileName);

	const context = {
		path,
		pathExt,
		folderPath,
		fileName,
		newPath,
		indexPath,
		indexText
	}
	
	showOptions(context)
	.then((selectedOptions) => createFolder(context, selectedOptions))
}

const activate = (context) => {
	let disposable = vscode.commands.registerCommand(
		'extension.folderize',
		init
	);
	context.subscriptions.push(disposable);
}

const deactivate = () => {}

module.exports = {
	activate,
	deactivate
}
