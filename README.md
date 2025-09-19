# charites-ai

<a href="https://stackblitz.com/~/github/yuiseki/charites-ai">
  <img
    alt="Open in StackBlitz"
    src="https://developer.stackblitz.com/img/open_in_stackblitz.svg"
  />
</a>

<a href="https://codesandbox.io/p/github/yuiseki/charites-ai/main">
  <img
    alt="Edit in CodeSandbox"
    src="https://codesandbox.io/static/img/play-codesandbox.svg"
  />
</a>

## What Is This?

- `charites-ai` is an AI that can generate JSON files that follow the Maplibre style specification based on natural language instructions.
- This AI builds on [@unvt/charites](https://github.com/unvt/charites).

## Demo

[![Image from Gyazo](https://i.gyazo.com/b26f7803974e840f5706cf5ae6c7d1e6.gif)](https://gyazo.com/b26f7803974e840f5706cf5ae6c7d1e6)

## Environment Setup

- Node.js must be installed.
- npm must also be installed.
- Run the following commands:

```bash
export OPENAI_API_KEY=*****
git clone ...
cd charites-ai
npm ci
npm run dev
```

- Open a browser and go to `http://localhost:5173/`.
- Confirm that the map appears.

## How to Use charites-ai

- Keep `npm run dev` running and execute commands like the following:

```bash
npm run instruct -- "Render country names in yellow"
```

- Visit `http://localhost:5173/` in your browser.
- Confirm that the map shows country names in yellow.
- Next, run a command such as:

```bash
npm run instruct -- "Render country names in blue"
```

- Refresh `http://localhost:5173/` in the browser.
- Confirm that the country names have changed to blue on the map.

## How charites-ai Works

- JSON files that comply with the Maplibre style specification are extremely large, which makes them difficult for LLMs to handle as of December 2023.
- charites can combine multiple YAML fragments to generate a JSON file that follows the Maplibre style specification.
- charites-ai leverages charites to edit each YAML file based on natural language instructions.
- To enable this, detailed comments were added to every YAML file.
- A process was implemented to analyze those comments.
- When natural language instructions are provided, charites-ai selects the most suitable YAML file and edits it.
- charites then merges the edited YAML files and generates a JSON file that follows the Maplibre style specification.
