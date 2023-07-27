# Edge Engine

Component-based template engine that compiles to ES Modules for fast rendering on the edge, server-side, static or client-side.

Based on Patrick Pissurno's wonderful https://github.com/patrickpissurno/li-template.

# About

I was looking for a simple and fast template engine that would work with Vercel's Edge functions
(which does not support filesystem operations or string-based template engines) and the most
obvious choice was to use ES Module template literals. Creating a whole site as strings in ES Modules
quickly becomes a drag, and that's when I stumbled across Patrick Pissurno's li-template which allows
you to write html files with simplified template literal syntax and compiles to CommonJS. I adapted it
to compile to ES Modules so that you can easily use it with Edge Functions (SSR), in the browser (CSR)
or prerendered (SSG). I also created a component-system, so you can easily import other components.

# Syntax

The syntax is exactly the same as li-template (although I might add to it in the future):

### Exists (not null)

**Short-hand**

`$(data.something?){<b>${data.something}</b>}`

**Transpiles into**

`` ${data.something ? `<b>${data.something}</b>` : ''} ``

### Does not exist or empty

**Short-hand**

`$(!data.something?){<b>Empty</b>}`

**Transpiles into**

`` ${data.something == null || data.something.length === 0 ? `<b>Empty</b>` : ''} ``

### Loops

**Short-hand**

`$(data.names:name){<b>I'm ${name}</b>}`

**Transpiles into**

`` ${data.names.map(x => `<b>I'm ${x.name}</b>`).join('')} ``

## Basic syntax

Inside `${}` you can use whatever from Javascript you would like to. Functions, methods, properties, process.env... Whatever. Just keep in mind that whatever you do write in there, would have to work with plain `${}` template literals in Node.js module context.

### String template (replace)

This one is just like plain ES6 template literals.

`${data.something}`

It will be replaced at render time with _data.something_'s value.
