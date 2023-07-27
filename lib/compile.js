import template from "./../modules/index.mjs";
import * as fs from "fs";

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

data.mode = "prerendered";

var result = template(data);

// console.log(result);

fs.writeFileSync("./public/index.html", result, "utf8");
