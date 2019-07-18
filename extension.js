const vscode = require('vscode');
const fs = require('fs');

const importRegex = /(import[^'"]*|require\()('(.*?)'|"(.*?)")/g
const stringRegex = /('(.*?)'|"(.*?)")/

const formatImportExport = (name) => (
`import ${name} from './${name}';

export default ${name};`
)

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

const createReactComponentFolder = (event) => {
	const path = event.fsPath;
	const pathExt = path.split('.').pop();
	const pathNoExt = path.split('.').slice(0,-1).join('.');
	const fileName = pathNoExt.split('/').pop();
	const newPath = pathNoExt + '/' + fileName + '.' + pathExt;
	const indexPath = pathNoExt + '/index.' + pathExt;
	const indexText = formatImportExport(fileName);

	fs.mkdirSync(pathNoExt);
	fs.writeFileSync(indexPath, indexText);
	fs.renameSync(path, newPath);
	updateLocalImports(newPath);
}

const activate = (context) => {
	let disposable = vscode.commands.registerCommand(
		'extension.createReactComponentFolder',
		createReactComponentFolder
	);
	context.subscriptions.push(disposable);
}

const deactivate = () => {}

module.exports = {
	activate,
	deactivate
}
