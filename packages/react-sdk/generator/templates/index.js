const indexTemplate = `
export { StoryProvider } from "./StoryProtocolContext";
<% resources.forEach((resource) => {%>
export { default as use<%=resource %> }  from "./resources/use<%=resource %>";
<%})%>
`;
module.exports = indexTemplate;
