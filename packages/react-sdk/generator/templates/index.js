/* eslint-disable no-undef */
const indexTemplate = `
export { StoryProvider } from "./StoryProtocolContext";
export { getPermissionSignature, AccessPermission, PIL_TYPE, } from "@story-protocol/core-sdk";
export type { PermissionSignatureRequest, StoryConfig, SupportedChainIds,
    <%types.forEach((type,index)=>{%>
    <%=type%><%=index === types.length - 1 ? '' : ','%>
        <%})%>
 } from "@story-protocol/core-sdk";
<% resources.forEach((resource) => {%>
export { default as use<%=resource %> }  from "./resources/use<%=resource %>";
<%})%>
`;
module.exports = indexTemplate;
