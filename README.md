# Gutenberg Yarn Tester

This repo tests if `yarn install` works if you have a project with every single `@wordpress/` dependency.

If you run `yarn install`, you can see several yarn warnings.

There are two scripts:

- `get-all-wordpress-packages.js`. Pass this a relative path to a gutenberg checkout, and it will `yarn add` every single `@wordpress/` package it finds defined in Gutenberg.
- `add-correct-peer-deps.js`. This attempts to add the required peer dependencies to the packages in node_module. _This does not appear to work, as yarn doesn't detect the node_module package was manually edited._

