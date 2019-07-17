const vscode = require('vscode');
const fs = require('fs');

const formatImportExport = (name) => (
	`import ${name} from './${name}';
	
	export default ${name}`
)

const updateLocalImports = (path) => {
	const text = fs.readFileSync(path, 'utf-8');
	const updatedText = text.replace(/(from '\.|from "\.).*/g, (match) => {
		const str = match.replace(/('\.|"\.).*('|")/g, (s) => {
			const prefix = s.slice(1,3);
			if (prefix === './') {
				return s.substr(0,1) + '.' + s.substr(1);
			}
			else if (prefix === '..') {
				return s.substr(0,1) + '../' + s.substr(1);
			}
			return s;
		})
		return str;
	})
	fs.writeFileSync(path, updatedText);
}

const activate = (context) => {
	let disposable = vscode.commands.registerCommand(
		'extension.createReactComponentFolder',
		(event) => {
			const path = event.fsPath;
			const pathNoExt = path.split('.').slice(0,-1).join('.');
			const fileName = pathNoExt.split('/').pop();

			fs.mkdirSync(pathNoExt);
			fs.writeFileSync(pathNoExt + '/' + fileName + '.module.css', '');
			fs.writeFileSync(pathNoExt + '/index.js', formatImportExport(fileName));
			fs.renameSync(path, pathNoExt + '/' + fileName + '.js');
			updateLocalImports(pathNoExt + '/' + fileName + '.js');
		}
	);
	context.subscriptions.push(disposable);
}

const deactivate = () => {}

module.exports = {
	activate,
	deactivate
}
