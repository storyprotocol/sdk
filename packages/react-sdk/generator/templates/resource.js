const methodTemplate = `<%=comments%><% if(method.isAsync){ %> 
  const <%=method.name %> = withLoadingErrorHandling<<%=method.requests[0].type%>,<%- method.responseType %>>('<%=method.name %>', client.<%= fileName%>.<%=method.name %>.bind(client.<%= fileName%>), setLoadings, setErrors); 
<% } else { %>
  const <%=method.name %> =(<% method.requests.forEach((item, index)=> { %>
    <%= item.name||"request" %>: <%= item.type %><%= index === method.requests.length - 1 ? '' : ',' %>
  <% }); %>): <%- method.responseType %>=> {
  return client.<%= fileName%>.<%=method.name %>(<% method.requests.forEach((item,index)=>{%>
    <%=item.name||"request" %><%=index === method.requests.length - 1 ? '' : ',' %>
    <% })%>);
  };
<% } %>
  `;

const startTemplate = `import { <% types.forEach((type,index)=>{%>\n<%=type %><%= index===types.length-1?'':','%><%})%> 
  } from "@story-protocol/core-sdk";
  <% if (viemTypes.length > 0) { %>
  import { <% viemTypes.forEach((type, index) => { %>\n<%= type %><%= index === viemTypes.length - 1 ? '' : ',' %><% }) %> 
    } from "viem"; 
  <% } %>
  
  import { useState } from "react";
  import { useStoryContext } from "../StoryProtocolContext";
  import { withLoadingErrorHandling } from "../withLoadingErrorHandling";
  const use<%=name %> = () => {
    const client = useStoryContext();
    const [loadings,setLoadings] = useState<Record<string,boolean>>({<% methodNames.forEach((name,index)=>{%><%=name %>: false<%=index === methodNames.length - 1 ? '' : ',' %> <%})%>});
    const [errors,setErrors] = useState<Record<string,string|null>>({ <% methodNames.forEach((name,index)=>{%><%=name %>: null<%=index === methodNames.length - 1 ? '' : ',' %><%})%> });
  `;

const endTemplate = `return {
    loadings,
    errors,
    <% methodNames.forEach((name,index)=>{%><%=name %><%=index === methodNames.length - 1 ? '' : ',' %>
    <%})%>
  };}\nexport default use<%=name %>;`;

module.exports = { startTemplate, endTemplate, methodTemplate };
