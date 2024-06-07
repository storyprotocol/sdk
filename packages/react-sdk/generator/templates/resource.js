const methodTemplate = `<%=comments%>\nconst <%=method.name %> = async (<% method.requests.forEach((item, index)=> { %>
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
      throw new Error(\`unhandled error type\`);
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
