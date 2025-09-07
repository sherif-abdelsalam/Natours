## What is Template Engine?

# Server-Side Rendering (SSR)

Server-side rendering is a technique where web pages are generated on the server and sent as fully rendered HTML to the client. This improves SEO, initial load performance, and allows content to be visible even if JavaScript is disabled in the browser.

## Tools Used for SSR in Node.js

- **Express.js:** The web framework that handles routing and HTTP requests.
- **Template Engines:** Used to generate HTML dynamically on the server. Popular engines include Pug, EJS, and Handlebars.
- **Mongoose:** For interacting with MongoDB and fetching data to render in templates.

## What is Pug?

Pug is a high-performance template engine for Node.js. It allows you to write HTML in a simplified, indentation-based syntax. Pug compiles templates into HTML, making it easier to manage dynamic content and layouts.

### Key Features of Pug

- Clean, minimal syntax (no closing tags or braces)
- Supports variables, loops, and conditionals
- Easy to include partials and layouts
- Integrates seamlessly with Express.js

### Example Pug Syntax

```pug
html
  head
    title= pageTitle
  body
    h1 Welcome, #{user.name}!
    ul
      each tour in tours
        li= tour.name
```

### How SSR Works with Pug

1. Express receives a request.
2. Data is fetched from the database (using Mongoose).
3. The server renders a Pug template, passing the data.
4. The resulting HTML is sent to the client.

This approach ensures fast, SEO-friendly pages and a smooth user experience.
