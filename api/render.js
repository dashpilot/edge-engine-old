/* Example Vercel edge function */

import template from "./../modules/index.mjs";

var data = {
  pretitle: "Yes it's...",
  title: "Edge Engine",
  features: [
    "Template files are compiled into native ES Modules and in-memory cached",
    "Supports Edge, SSR, SSG and CSR",
    "Component Imports",
    "Short-hand for <i>exists</i> and <i>empty</i> statements",
    "Short-hand for <i>loops</i>",
    "Ultra small size",
  ],
};

data.mode = "rendered on the edge";

export const config = {
  runtime: "edge",
};

export default (request) => {
  var result = template(data);
  return new Response(result, {
    headers: { "content-type": "text/html" },
  });
};
