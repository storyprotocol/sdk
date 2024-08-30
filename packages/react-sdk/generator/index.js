/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const ejs = require("ejs");
const ts = require("typescript");
const cliProgress = require("cli-progress");

const resourcesFolder = path.resolve(__dirname, "../../core-sdk/src/resources");
const resourceTemplate = require("./templates/resource");
const indexTemplate = require("./templates/index");

console.log("🚀🚀 React SDK generator started!\n");
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const isPrimitiveType = (type) => {
  return [
    "string",
    "number",
    "boolean",
    "symbol",
    "undefined",
    "null",
    "bigint",
    "string|bigint|number",
  ].includes(type);
};
const isViemType = (type) => {
  return ["Hex", "Address"].includes(type);
};

const isEnclosedInCurlyBraces = (type) => {
  return type.slice(0, 1) === "{" && type.slice(-1) === "}";
};
const visit = (file) => {
  let program = ts.createProgram([file], { allowJs: true });
  const sourceFile = program.getSourceFile(file);
  ts.createProgram([sourceFile.fileName], {}).getTypeChecker();
  const publicMethods = [];
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node)) {
      for (const member of node.members) {
        if (
          ts.isMethodDeclaration(member) &&
          (member.modifiers?.some(
            (m) => m.kind === ts.SyntaxKind.PublicKeyword
          ) ??
            true) &&
          member.name &&
          ts.isIdentifier(member.name)
        ) {
          const requests = [];
          const isAsync = member.modifiers?.some(
            (modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword
          );
          program.getTypeChecker().getSignatureFromDeclaration(member);
          member.parameters.forEach((parameter) => {
            requests.push({
              name: parameter.name.escapedText,
              type: parameter.type.getText(),
            });
          });
          const method = {
            name: member.name.text,
            requests,
            responseType: member.type
              ?.getText()
              .replace("Promise<", "")
              .replace(">", ""),
            isAsync,
            comments:
              ts
                .getLeadingCommentRanges(sourceFile.text, member.pos)
                ?.map((range) =>
                  sourceFile.text.substring(range.pos, range.end).trim()
                ) || [],
            defaultValues: undefined, // Get default value,
          };
          publicMethods.push(method);
        }
      }
    }
  });
  return publicMethods;
};

let fileNames = [];
let exportTypes = [];
const files = fs.readdirSync(resourcesFolder);
bar.start(files.length + 1, 0);
files.forEach((file, index) => {
  bar.update(index + 1);
  let sources = [];
  const fileName =
    file.replace(".ts", "").charAt(0).toUpperCase() +
    file.replace(".ts", "").slice(1);
  fileNames.push(fileName);
  const methods = visit(path.resolve(resourcesFolder, file));
  const methodNames = methods.map((method) => method.name);
  const types = methods.reduce(
    (acc, curr) =>
      acc.concat(
        curr.requests.map((item) => item.type),
        curr.responseType
      ),
    []
  );
  const filteredTypes = [
    ...new Set(
      types
        .filter((type) => !isPrimitiveType(type))
        .filter((type) => !isViemType(type))
        .filter((type) => !isEnclosedInCurlyBraces(type))
    ),
  ];
  exportTypes.push(...filteredTypes);
  sources.push(
    ejs.render(resourceTemplate.startTemplate, {
      types: [filteredTypes],
      name: fileName,
      methodNames,
      viemTypes: [...new Set(types.filter((type) => isViemType(type)))],
    })
  );
  const methodTemplates = methods.map((method) => {
    return ejs.render(resourceTemplate.methodTemplate, {
      method: method,
      fileName: file.replace(".ts", ""),
      comments: method.comments,
    });
  });

  sources = sources.concat(
    methodTemplates,
    ejs.render(resourceTemplate.endTemplate, { methodNames, name: fileName })
  );
  fs.writeFileSync(`src/resources/use${fileName}.ts`, sources.join("\n"));
});
const indexSource = ejs.render(indexTemplate, {
  resources: fileNames,
  types: exportTypes,
});
fs.writeFileSync("src/index.ts", indexSource);
exec("npm run fix", (error) => {
  if (error) {
    console.log(
      "\x1b[31m%s\x1b[0m",
      "\nError occurred while running npm run fix command. Please run `npm run fix` manually."
    );
    bar.stop();
    return;
  }
  bar.update(files.length + 1);
  bar.stop();
  console.log(
    "\x1b[32m%s\x1b[0m",
    "React SDK templates generated successfully!"
  );
});
