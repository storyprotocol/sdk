/* eslint-disable no-undef */
const methodTemplate = `<%=comments%>\nconst <%=method.name %> = <% if (method.isAsync) { %>
  async<% } %> (<% method.requests.forEach((item, index)=> { %>
    <%= item.name||"request" %>: <%= item.type %><%= index === method.requests.length - 1 ? '' : ',' %>
  <% }); %>): <% if (method.isAsync) { %> Promise<<%- method.responseType %>><% } else { %> <%- method.responseType %> <% } %>=> {
    try {
      <% if (method.isAsync) { %>
      setLoadings((prev) => ({ ...prev, <%=method.name %>: true }));
      setErrors((prev) => ({ ...prev, <%=method.name %>: null }));
      <% } %> <% if (method.isAsync) { %> const response = await <% } else { %> return <% } %>client.<%= fileName%>.<%=method.name %>(<% method.requests.forEach((item,index)=>{%>
        <%=item.name||"request" %><%=index === method.requests.length - 1 ? '' : ',' %>
     <% })%>); <% if (method.isAsync) { %>
      setLoadings((prev ) => ({ ...prev, <%=method.name %>: false }));
      <% } %><% if (method.isAsync) { %> return response;
      <% } %>
    }catch(e){
      const errorMessage = handleError(e);<% if (method.isAsync) { %>
      setErrors((prev) => ({ ...prev, <%=method.name %>: errorMessage }));
      setLoadings((prev) => ({ ...prev, <%=method.name %>: false }));
      <% } %> throw new Error(errorMessage);
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
  import { useStoryContext } from "../StoryProtocolContext";
  import { handleError } from "../util";
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
