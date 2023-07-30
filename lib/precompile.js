/* converts the raw template to es module with template literals */

import sub from "./../lib/compiler.js";
import * as fs from "fs";

if (!fs.existsSync("./public")) {
  fs.mkdirSync("./public");
  fs.mkdirSync("./public/static");
  fs.mkdirSync("./modules");
  fs.mkdirSync("./modules/components");
}

// const css = fs.readFileSync("./src/style.css");
// fs.writeFileSync("./public/style.css", css, "utf8");

fs.cpSync("./static", "./public/static", { recursive: true });

const dirents = fs.readdirSync("./src/", { withFileTypes: true });
const pages = dirents
  .filter((dirent) => dirent.isFile())
  .map((dirent) => dirent.name);

var components = fs.readdirSync("./src/components/");

const dirents2 = fs.readdirSync("./static", { withFileTypes: true });
const staticFiles = dirents2
  .filter((dirent2) => dirent2.isFile())
  .map((dirent2) => dirent2.name);

console.log(components);

(async function () {
  for await (const page of pages) {
    precompile("", page);
  }
  for await (const comp of components) {
    precompile("components/", comp);
  }
  for await (const stat of staticFiles) {
    let s = fs.readFileSync("./static/" + stat);
    fs.writeFileSync("./public/static/" + stat, s, "utf8");
  }
})();

async function precompile(path, filename) {
  let precompiled = await sub.precompileFile("./src/" + path + filename);
  let newname = filename.replace(".html", ".mjs");
  fs.writeFileSync("./modules/" + path + newname, precompiled, "utf8");
}
