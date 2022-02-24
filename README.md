# Gutenberg Yarn Tester

This repo tests if `yarn install` works if you have a project with every single `@wordpress/` dependency.

If you run `yarn install`, you can see several yarn warnings.

There are two scripts:

- `get-all-wordpress-packages.js`. Pass this a relative path to a gutenberg checkout, and it will `yarn add` every single `@wordpress/` package it finds defined in Gutenberg. Only need to run this again if more WordPress packages are created.
- `add-correct-peer-deps.js`. This attempts to add the required peer dependencies to the package in Gutenberg. If yarn reports that `@wordpress/annotations` does not provide react-dom, this script attempts to add react-dom as a peer dependency in that package.

```sh
# If gutenberg is checked out as a sibling to cwd:
./get-all-wordpress-packages.js ../gutenberg

# Tries to solve all the peer dep warnings it can:
./add-correct-peer-deps.js ../gutenberg
```

