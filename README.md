# proposalv3 Setup Guide

This guide is written for non-technical teammates. You do not need to understand the codebase. Just follow the steps in order to get the project running on your computer.

## 1. What You Need Before Starting

This project requires two tools to be installed first:

- Node.js
- pnpm

If either one is missing, the project will not start.

## 2. Install Node.js

### Step 1: Open the official download page

Go to:

[https://nodejs.org/en/download](https://nodejs.org/en/download)

### Step 2: Download the recommended version

We recommend installing `Node.js 24.x`.

The version currently verified with this project is:

- Node.js `v24.14.0`

If the website shows multiple versions, choose a stable `24.x` release.

### Step 3: Finish the installation

After downloading, install it like any normal application by clicking through the setup steps.

When the installation is done, open a terminal:

- On macOS: open `Terminal`
- On Windows: open `PowerShell` or `Command Prompt`

Run this command to confirm Node.js is installed:

```bash
node -v
```

If you see a version number similar to this, the installation worked:

```bash
v24.14.0
```

## 3. Install pnpm

After Node.js is installed, install `pnpm`.

Run this command in your terminal:

```bash
npm install -g pnpm
```

Then confirm it is installed:

```bash
pnpm -v
```

The version currently verified with this project is:

- pnpm `10.20.0`

If a version number appears, `pnpm` is ready to use.

## 4. Open the Project Folder

Make sure the project files are already on your computer, then open the project folder in the terminal.

Example:

```bash
cd /path/to/your/local/proposalv3
```

If you are not sure about the path, you can type `cd ` in the terminal, then drag the project folder into the terminal window and press Enter.

## 5. Install Project Dependencies

The first time you run the project, you need to install its dependencies.

From the project root folder, run:

```bash
pnpm install
```

This step may take anywhere from a few seconds to a few minutes depending on your network and computer speed.

Wait until it finishes without errors before moving on.

## 6. Start the Development Server

From the project root folder, run:

```bash
pnpm dev
```

Once it starts successfully, the terminal will usually show a local address. By default, it is:

```text
http://localhost:3000
```

Open that address in your browser to view the project.

## 7. The Usual Steps for Future Runs

If Node.js and pnpm are already installed, and you have already run `pnpm install` once before, then the next time you want to start the project you usually only need these two commands:

```bash
cd /path/to/your/local/proposalv3
pnpm dev
```

## 8. How to Stop the Server

When you want to stop the project, go back to the terminal window and press:

```text
Ctrl + C
```

That will stop the local development server.

## 9. Common Problems

### `node: command not found`

This usually means Node.js was not installed successfully, or the terminal needs to be reopened after installation.

Try the following:

- Reinstall Node.js
- Close the terminal and open it again
- Run `node -v` one more time

### `pnpm: command not found`

This means `pnpm` was not installed successfully.

Run:

```bash
npm install -g pnpm
```

Then confirm it with:

```bash
pnpm -v
```

### `http://localhost:3000` does not open

Check the following:

- Make sure `pnpm dev` is still running in the terminal
- Look for any error messages in the terminal
- Make sure port `3000` is not already being used by another app

If port `3000` is already in use, the terminal will usually show a different local address. Open the address shown in the terminal.

## 10. Common Project Commands

Start the development environment:

```bash
pnpm dev
```

Build the project:

```bash
pnpm build
```

Start the project from the production build:

```bash
pnpm start
```

## 11. Verified Local Environment

This project has been verified locally with:

- Node.js `v24.14.0`
- pnpm `10.20.0`

Development server command:

```bash
pnpm dev
```
