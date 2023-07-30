import template from "./../modules/index.mjs";
import * as fs from "fs";

var data = {
  pretitle: "Yes it's...",
  title: "Vertigo",
  features: [
    "Template files are compiled into native ES Modules and in-memory cached",
    "Supports Edge, SSR, SSG and CSR",
    "Component Imports",
    "Short-hand for <i>exists</i> and <i>empty</i> statements",
    "Short-hand for <i>loops</i>",
    "Ultra small size",
  ],
};

data.mode = "prerendered";

var result = template(data);

// console.log(result);

fs.writeFileSync("./public/index.html", result, "utf8");
