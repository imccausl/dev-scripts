# dev-scripts

Scripts for maintaining Typescript projects: linting, typescript config, build, etc.

## To Install

npm: `npm i @imccausl/dev --save-dev`
yarn: `yarn add -D @imccausl/dev`

## To use

`yarn dev`

## Workspaces

Use workspace flags to target specific packages:

- `yarn dev lint --workspace web`
- `yarn dev format --workspaces web,api --check`
- `yarn dev build --all-workspaces`
