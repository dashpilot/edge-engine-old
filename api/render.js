/* Example Vercel edge function */

import template from "./../modules/index.mjs";

var data = {
  pretitle: "Yes it's...",
  title: "Edge Engine",
  features: [
    "Template files are compiled into NodeJS modules and in-memory cached",
    "Partials and compiled partials",
    "Short-hand for <i>exists</i> statement",
    "Short-hand for <i>non-exists or empty</i> statement",
    "Short-hand for <i>loops</i>",
    "Every thing you can do with Javascript",
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
