const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const resourcesFolder = path.resolve(__dirname, "../../core-sdk/src/resources");

const visit = (file) => {
  let program = ts.createProgram([file], { allowJs: true });
  const sourceFile = program.getSourceFile(file);
  const checker = ts.createProgram([sourceFile.fileName], {}).getTypeChecker();
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
          const methodSignature = program
            .getTypeChecker()
            .getSignatureFromDeclaration(member);
          //TODO: how to get Address or Hex not `0x${string}`
          const returnType = checker
            .typeToString(methodSignature.getReturnType())
            .replace("Promise<", "")
            .replace(">", "");
          member.parameters.forEach((parameter) => {
            requests.push({
              name: parameter.name.escapedText,
              type:
                parameter.type.typeName && parameter.type.typeName.escapedText,
            });
          });
          const method = {
            name: member.name.text,
            requests,
            responseType: returnType,
            comments:
              ts
                .getLeadingCommentRanges(sourceFile.text, member.pos)
                ?.map((range) =>
                  sourceFile.text.substring(range.pos, range.end).trim()
                ) || [],
          };
          publicMethods.push(method);
        }
      }
    }
  });
  return publicMethods;
};

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
  return ["`0x${string}`", "Hex"].includes(type);
};

const methodTemplate = `const <%=method.name %> = async (<% method.requests.forEach((item, index)=> { %>
  <%= item.name %>: <%= item.type %><%= index === method.requests.length - 1 ? '' : ',' %>
<% }); %>): Promise<<%- method.responseType %>> => {
  try {
    setLoadings((prev) => ({ ...prev, <%=method.name %>: true }));
    setErrors((prev) => ({ ...prev, <%=method.name %>: null }));
    const response = await client.<%= fileName%>.<%=method.name %>(<% method.requests.forEach((item,index)=>{%>
      <%=item.name %><%=index === method.requests.length - 1 ? '' : ',' %>
   <% })%>);
    setLoadings((prev ) => ({ ...prev, <%=method.name %>: false }));
    return response;
  }catch(e){
    if(e instanceof Error){
      setErrors((prev) => ({ ...prev, <%=method.name %>: e.message }));
      setLoadings((prev) => ({ ...prev, <%=method.name %>: false }));
    }
    throw new Error(\`Unknown error type:\${e}\`);
  }
};
`;
const startTemplate = `import { <% types.forEach((type,index)=>{%>\n<%=type %><%= index===types.length-1?'':','%><%})%> 
} from "@story-protocol/core-sdk";
<% if (viemTypes.length > 0) { %>
import { <% viemTypes.forEach((type, index) => { %>\n<%= type %><%= index === viemTypes.length - 1 ? '' : ',' %><% }) %> 
  } from "viem"; 
<% } %>

import { useState } from "react";
import { useStoryContext } from "../storyProtocolContext";
export const use<%=name %> = () => {
  const client = useStoryContext();
  const [loadings,setLoadings] = useState<Record<string,boolean>>({<% methodNames.forEach((name,index)=>{%><%=name %>: false<%=index === methodNames.length - 1 ? '' : ',' %> <%})%>});
  const [errors,setErrors] = useState<Record<string,string|null>>({ <% methodNames.forEach((name,index)=>{%><%=name %>: null<%=index === methodNames.length - 1 ? '' : ',' %><%})%> });
`;
const endTemplate = `return {
  loadings,
  errors,
  <% methodNames.forEach((name,index)=>{%><%=name %><%=index === methodNames.length - 1 ? '' : ',' %>
  <%})%>
};}`;

fs.readdirSync(resourcesFolder).forEach((file) => {
  let templates = [];
  const fileName =
    file.replace(".ts", "").charAt(0).toUpperCase() +
    file.replace(".ts", "").slice(1);
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

  templates.push(
    ejs.render(startTemplate, {
      types: [
        ...new Set(
          types
            .filter((type) => !isPrimitiveType(type))
            .filter((type) => !isViemType(type))
        ),
      ],
      name: fileName,
      methodNames,
      viemTypes: [
        ...new Set(
          types
            .filter((type) => isViemType(type))
            .map((item) => (item == "`0x${string}`" ? "Hex" : item))
        ),
      ],
    })
  );
  const methodTemplates = methods.map((method) => {
    return ejs.render(methodTemplate, {
      method: method,
      fileName: file.replace(".ts", ""),
    });
  });

  templates = templates.concat(
    methodTemplates,
    ejs.render(endTemplate, { methodNames })
  );
  fs.writeFileSync(`src/resources/use${fileName}.ts`, templates.join("\n"));
});
