const fs = require("fs").promises; // Use promises for better async handling
const path = require("path");
const { exec } = require("child_process");
const ejs = require("ejs");
const ts = require("typescript");
const cliProgress = require("cli-progress");

const resourcesFolder = path.join(__dirname, "../../core-sdk/src/resources");
const resourceTemplate = require("./templates/resource");
const indexTemplate = require("./templates/index");

console.log(`[${new Date().toISOString()}] 🚀 React SDK generator started!\n`);
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const isPrimitiveType = (type) =>
	["string", "number", "boolean", "symbol", "undefined", "null", "bigint", "string|bigint|number"].includes(type);

const isViemType = (type) => ["Hex", "Address"].includes(type);
const isEnclosedInCurlyBraces = (type) => type.startsWith("{") && type.endsWith("}");

const visit = (file) => {
	try {
		const program = ts.createProgram([file], { allowJs: true });
		const sourceFile = program.getSourceFile(file);
		if (!sourceFile) return [];

		ts.createProgram([sourceFile.fileName], {}).getTypeChecker();
		const publicMethods = [];

		ts.forEachChild(sourceFile, (node) => {
			if (ts.isClassDeclaration(node)) {
				for (const member of node.members) {
					if (
						ts.isMethodDeclaration(member) &&
						(member.modifiers?.some((m) => m.kind === ts.SyntaxKind.PublicKeyword) ?? true) &&
						member.name &&
						ts.isIdentifier(member.name)
					) {
						const requests = [];
						const isAsync = member.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword);

						member.parameters.forEach((parameter) => {
							requests.push({
								name: parameter.name.escapedText,
								type: parameter.type ? parameter.type.getText() : "unknown",
							});
						});

						const method = {
							name: member.name.text,
							requests,
							responseType: member.type?.getText()?.replace("Promise<", "").replace(">", "") || "void",
							isAsync,
							comments: ts
								.getLeadingCommentRanges(sourceFile.text, member.pos)
								?.map((range) => sourceFile.text.substring(range.pos, range.end).trim()) || [],
						};
						publicMethods.push(method);
					}
				}
			}
		});

		return publicMethods;
	} catch (error) {
		console.error(`[${new Date().toISOString()}] ❌ Error processing file: ${file}`, error);
		return [];
	}
};

(async () => {
	try {
		const files = await fs.readdir(resourcesFolder);
		bar.start(files.length + 1, 0);

		let fileNames = [];
		let exportTypes = [];

		for (let [index, file] of files.entries()) {
			bar.update(index + 1);
			let sources = [];
			const fileName = file.replace(".ts", "").charAt(0).toUpperCase() + file.replace(".ts", "").slice(1);
			fileNames.push(fileName);

			const methods = visit(path.join(resourcesFolder, file));
			const methodNames = methods.map((method) => method.name);
			const asyncMethods = methods.filter((method) => method.isAsync).map((method) => method.name);

			const types = methods.flatMap((method) =>
				[...method.requests.map((item) => item.type), method.responseType]
			);
			const filteredTypes = [...new Set(types.filter((type) => !isPrimitiveType(type) && !isViemType(type) && !isEnclosedInCurlyBraces(type)))];
			exportTypes.push(...filteredTypes);

			sources.push(
				ejs.render(resourceTemplate.startTemplate, {
					types: [filteredTypes],
					name: fileName,
					methodNames: asyncMethods,
					viemTypes: [...new Set(types.filter((type) => isViemType(type)))],
				})
			);

			const methodTemplates = methods.map((method) =>
				ejs.render(resourceTemplate.methodTemplate, {
					method,
					fileName: file.replace(".ts", ""),
					comments: method.comments,
				})
			);

			sources = sources.concat(
				methodTemplates,
				ejs.render(resourceTemplate.endTemplate, {
					methodNames,
					name: fileName,
				})
			);

			await fs.writeFile(`src/resources/use${fileName}.ts`, sources.join("\n"));
		}

		const indexSource = ejs.render(indexTemplate, { resources: fileNames, types: exportTypes });
		await fs.writeFile("src/index.ts", indexSource);

		exec("npm run fix", (error) => {
			if (error) {
				console.error(
					`[${new Date().toISOString()}] ❌ Error occurred while running 'npm run fix'. Please run it manually.`
				);
				bar.stop();
				return;
			}
			bar.update(files.length + 1);
			bar.stop();
			console.log(`[${new Date().toISOString()}] ✅ React SDK templates generated successfully!`);
		});
	} catch (error) {
		console.error(`[${new Date().toISOString()}] ❌ Error initializing script`, error);
		bar.stop();
	}
})();
