# Proompt Cat

[![npm version](https://img.shields.io/npm/v/proompt-cat.svg)](https://www.npmjs.com/package/proompt-cat)[![License](https://img.shields.io/npm/l/proompt-cat.svg)](https://github.com/yourusername/proompt-cat/blob/main/LICENSE)[![npm downloads](https://img.shields.io/npm/dm/proompt-cat.svg)](https://www.npmjs.com/package/proompt-cat)

Turbocharge your software development workflows by leveraging the power of AI.

When seeking coding help from AI models like GPT-4, you want to:

1. Give the model as much _relevant_ context as possible without exceeding the token limit.
2. Name your files and use delimiters to help the AI understand the content.
3. Explicitly instruct the model with clear and unambiguous prompts.

However, copying your project files, naming them, and delimiting them manually, is time consuming.

Also, you won't know you're going to exceed the token limit until you do:

<p align="center">
  <img src="./assets/chatgpt-token-error.png" alt="ChatGPT exceeded token limit error message" title="ChatGPT exceeded token limit error message" width="75%">
</p>

## ⚡ The Solution ⚡

Proompt Cat solves these issues for you.

Run the script from your folder and select the files you want to include. The token count is dynamically updated:

<p align="center">
  <img src="./assets/proompt-cat-select-files.png" alt="Proompt Cat CLI - choose files" title="Proompt Cat CLI - choose files">
</p>

Next, choose to add on a pre-prompt:

<p align="center">
  <img src="./assets/proompt-cat-choose-prompt.png" alt="Proompt Cat CLI - choose a prompt" title="Proompt Cat CLI - choose a prompt">
</p>

The contents of your project files are individually named, delimited, and concatenated together, then copied to your clipboard.

You get the optimum context from your project with only a few key presses. 🚀🚀

Remember to paste in your requirements or error messages into the LLM if you chose 5. or 6:

<p align="center">
<img src="./assets/chatgpt-placeholder.png" alt="ChatGPT window with placeholder text showing" title="ChatGPT window with placeholder text showing">
</p>

<p align="center">
  <img src="./assets/chatgpt-with-error.png" alt="ChatGPT window with error message pasted into prompt" title="ChatGPT window with error message pasted into prompt">
</p>

💡 Pro tip: iterate! It pays to have the AI check its answers. You can also combine prompts - first review your code for bugs, then again for vulnerabilities, and so on.

## Getting started

1. Start by running this command to install the tool globally using npm.

```bash
npm install -g proompt-cat
```

2. Now you should be able to run the script from any project folder.

```bash
proompt-cat
```

## Contributing and Reporting Bugs

We welcome contributions to Proompt Cat and appreciate your help in making this tool even more money 💲💲!

Here's how you can contribute or report bugs:

### Reporting Bugs

If you encounter a bug or unexpected behavior:

1. First, check the [existing issues](https://github.com/yourusername/proompt-cat/issues) to see if the bug has already been reported.
2. If not, [open a new issue](https://github.com/yourusername/proompt-cat/issues/new).
3. Provide a clear and descriptive title.
4. In the description, include:
   - Steps to reproduce the bug
   - Expected behavior
   - Actual behavior
   - Your operating system and Node.js version
   - Any relevant error messages or screenshots

### Contributing Code

If you'd like to contribute code:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes, ensuring you follow the project's coding style.
4. Add or update tests as necessary.
5. Ensure all tests pass by running `npm test`.
6. Commit your changes with a clear and descriptive commit message.
7. Push your branch to your fork.
8. Open a pull request against the main repository's `main` branch.

### Suggesting Enhancements

Have an idea to improve Proompt Cat?

1. [Open a new issue](https://github.com/yourusername/proompt-cat/issues/new).
2. Label it as an enhancement.
3. Clearly describe your suggestion, including:
   - The problem it solves
   - How it should work
   - Any potential drawbacks

We appreciate your contributions!
