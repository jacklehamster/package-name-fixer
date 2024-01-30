# package-name-fixer
Goes into package.json and update the name to match the Github repository. Also updates author, description. It's useful when a npm repo is build out of a template.

Written using bun

# Usage

```bash
$ bun start
```

# Usage from another package

Update `package.json`:
```js
{
  //...
  "scripts": {
    //...
    "fix-package-name": "npm explore package-name-fixer -- bun start \"$(pwd)\""
  },
  "devDependencies": {
    //...
    "package-name-fixer": "^1.0.6",
  }
}
```
