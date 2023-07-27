import nav from "./components/nav.mjs"
    
    const MyComponent = function (data){ return `<!DOCTYPE html>
<html>
  <head>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"
      integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65"
      crossorigin="anonymous"
    />

    <style>
      nav {
        padding: 10px;
      }
      nav a {
        display: inline-block;
        margin-left: 10px;
      }
    </style>
  </head>
  <body>
    <nav>
      <a href="/">Home</a>
      <a href="/api/render">Edge</a>
    </nav>

    ${nav(data)}

    <div class="container mt-5">
      <h1>${data.title}</h1>
      <p>This template was <strong>${data.mode}</strong></p>

      <ul class="list-group mt-5">
        ${data.features ? `${data.features.map(item => `<li class="list-group-item">
          <div>${item}</div>
        </li>`).join('')}` : ''}
      </ul>
    </div>
  </body>
</html>
    `; }; 
    export default MyComponent;