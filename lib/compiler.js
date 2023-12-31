/**
 * based on li-template by Patrick Pissurno
 * converted to ES Module (that generates ES modules) by Gerben Schmidt
 * and is licensed under the MIT license.
 */

import * as fs from "fs";
import * as path from "path";
import { parse } from 'node-html-parser';

function rand() {
  // return (await randomBytes(48)).toString('hex');
  return new Date();
}

function extractTags(src, data) {
  //var file = fs.readFileSync(filepath, "utf8");
  // var filename = path.basename(filepath, '.html');

  const root = parse(src);
  if (root.querySelector("imports")) {
    data.imports = root.querySelector("imports").text;
  }
  if (root.querySelector("template")) {
    data.template = root.querySelector("template").innerHTML;
  }
  if (root.querySelector("script")) {
    data.script += root.querySelector("script").text;
  }
  if (root.querySelector("style")) {
    data.style += root.querySelector("style").text;
  }

  data.imports.replaceAll('undefined', '');
  
  data.script.replaceAll('undefined', '');
  data.style.replaceAll('undefined', '');

  return data;
  //console.log(data);
}

// Used to find the matching } of a given {
function getClosing(code, sI) {
  let limit = 10000;
  let index = sI;
  let nest = 0;
  while (index < code.length) {
    let open = code.indexOf("{", index);
    let close = code.indexOf("}", index);

    if (close == -1) return index;
    else if (open == -1) open = close + 1;

    index = open < close ? open : close;
    nest += open < close ? 1 : -1;

    index++;

    if (nest <= 0) return index;

    limit -= 1;
    if (limit < 0) return -9;
  }
  return index;
}

// Transpiles the short-hand syntax-sugar into plain ES6 template literals
function transpile(str) {
  let patt = RegExp(/\$\(/);
  let index = 0;
  let lastMatchIndex = 0;
  let match;
  let result = "";
  while ((match = patt.exec(str.substring(index, str.length)))) {
    let start = index + match.index + 2;
    let end = str.indexOf(")", start);

    if (str.substring(end - 1, end) === "?") {
      //if and else syntax
      result += str.substring(lastMatchIndex + 1, start - 2);

      let variable = str.substring(start, end - 1);

      let blockStart = str.indexOf("{", end) + 1;
      let blockEnd = getClosing(str, blockStart - 1);
      let block = str.substring(blockStart, blockEnd - 1);

      lastMatchIndex = blockEnd - 1;

      index = blockEnd + 1;

      let inner = transpile(" " + block + " ");
      result += `\${${
        variable +
        (variable.indexOf("!") !== -1
          ? " || " + variable.replace("!", "") + ".length == 0"
          : "")
      } ? \`${inner == "" ? block : inner}\` : ''}`;
    } else if (str.substring(start, end).indexOf(":") !== -1) {
      //loops syntax
      result += str.substring(lastMatchIndex + 1, start - 2);

      let arr = str
        .substring(start, end)
        .split(":")
        .map((x) => x.trim());

      let blockStart = str.indexOf("{", end) + 1;
      let blockEnd = getClosing(str, blockStart - 1);
      let block = str.substring(blockStart, blockEnd - 1);

      lastMatchIndex = blockEnd - 1;

      index = blockEnd + 1;

      let inner = transpile(" " + block + " ");
      result += `\${${arr[0]} ? \`\${${arr[0]}.map(${arr[1]} => \`${
        inner == "" ? block : inner
      }\`).join('')}\` : ''}`;
    } //no pattern found, skip
    else {
      index += 1;
      continue;
    }
  }

  result += str.substring(
    index - 1,
    str.length + (lastMatchIndex == 0 ? -1 : 0)
  );
  return result.trim();
}

class Compiler {
  /**
   * Pre-compiles a template in order to use the view engine by passing its raw content
   * @param {string} src Template source
   * @returns The pre-compiled render module that is used to render the template as a string
   * @memberof Compiler
   */
  precompile(src) {

    var data = {
      "imports": "",
      "template": "",
      "script": "",
      "style": ""
    };
    const tags = extractTags(src, data);

  if(tags.style!==''){
    fs.appendFileSync('./public/style.css', "\n"+tags.style);
  }

  if(tags.script!==''){
    fs.appendFileSync('./public/app.js', "\n"+tags.script);
  }

    var imports = tags.imports.replaceAll('.html', '.mjs')

    return `${imports}
 
    const MyComponent = function (data){ return \`${transpile(
      `  ${tags.template.replace(/\\\$\(/g, "\\$@(")}  `
    ).replace(/\\\$@\(/g, "\\$(")}
    \`; }; 
    export default MyComponent;`;
   
  }


  /**
   * Compile a template in order to use the view engine by passing its raw content as string
   * @param {string} raw Template raw content as string
   * @param {Object[]} partials Array of already compiled partial files
   * @param {string} [filename] A string name that will be used as Node compiled module name. If omitted, random string is used
   * @returns The compiled render function that is used to render the template
   * @memberof Compiler
   */
  async compile(raw, partials, opt = { filename: null, precompiled: null }) {
    const m = new module.constructor();
    m.paths = module.paths;
    let template = `
            const htmlEscapes = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '/': '&#x2F;'
            };
            const htmlEscaper = /[&<>"'\/]/g;
            function safe(str) {
                return ('' + str).replace(htmlEscaper, function(match) {
                    return htmlEscapes[match];
                });
            };
            ${
              opt.precompiled == null ? this.precompile(raw) : opt.precompiled
            }`;
    try {
      m._compile(template, opt.filename == null ? rand() : opt.filename);
    } catch (ex) {
      console.error(ex);
    }

    return (data) => {
      if (partials != null) {
        let temp = {};
        partials.forEach((x) => (temp[x.name] = x.render(data)));
        data.partials = temp;
      }
      return m.exports.bind(data)();
    };
  }

  /**
   * Compile a template in order to use the view engine by passing its file name
   * @param {string} filename Template file name
   * @param {string[]} partials An array containing the file names of all partials needed for this template
   * @returns The compiled render function that is used to render the template
   * @memberof Compiler
   */
  async compileFile(filename, partials) {
    if (partials != null)
      partials = await this.compilePartials(partials, filename);

    return await this.compile(
      fs.readFileSync(filename).toString(),
      partials,
      filename
    );
  }

  /**
   * Compile partials from a string array of file names
   * @param {string[]} partials An array containing the file names of all partials needed for this template
   * @param {string} [filename] Base template file name
   * @returns An array containing the partials as objects
   * @memberof Compiler
   */
  async compilePartials(partials, filename, precompiled = false) {
    if (partials == null) return null;

    return await Promise.all(
      partials.map(async (x) => {
        if (precompiled) {
          return {
            render: await this.compile(
              "",
              await this.compilePartials(x.partials, x.file, precompiled),
              {
                precompiled: x.precompiled,
                filename:
                  path.parse(x.file).name +
                  "_" +
                  (filename == null ? rand() : filename),
              }
            ),
            name: path.parse(x.file).name,
          };
        }

        return typeof x == "string"
          ? {
              render: await this.compile(
                (await readFile(x)).toString(),
                null,
                path.parse(x).name +
                  "_" +
                  (filename == null ? rand() : filename)
              ),
              name: path.parse(x).name,
            }
          : {
              render: await this.compile(
                (await readFile(x.file)).toString(),
                await this.compilePartials(x.partials, x.file),
                path.parse(x.file).name +
                  "_" +
                  (filename == null ? rand() : filename)
              ),
              name: path.parse(x.file).name,
            };
      })
    );
  }

  /**
   * Pre-compiles a template in order to use the view engine by passing its file name
   * @param {string} filename Template file name
   * @returns The pre-compiled render function that is used to render the template as a string
   * @memberof Compiler
   */
  async precompileFile(filename) {
    return this.precompile(fs.readFileSync(filename).toString());
  }
}

export default new Compiler();
