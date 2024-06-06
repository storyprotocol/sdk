const indexTemplate = `
export { StoryProvider, useStoryContext } from "./storyProtocolContext";
<% resources.forEach((resource) => {%>
export * from "./resources/use<%=resource %>";
<%})%>
`;
module.exports = indexTemplate;
