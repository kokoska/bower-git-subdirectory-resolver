# Bower Git Subdirectory Resolver

This is a [Bower Pluggable Resolver](http://bower.io/docs/pluggable-resolvers/)
that allows installation of bower modules from a subdirectory of a Git
repository.

For example, let's assume user has the following repo hosted on
Git:

```
repo/
  namespace/
    module/
      bower.json
      src/
    another-module/
      bower.json
      src/
```

A normal bower git installation (`bower install githubUser/repo`) would
install the entire repository, including both modules.  The use case for this
resolver is when you only want to install a single module contained inside a
repo, that acts as a standalone bower module.

To do this, the custom resolver matches patterns of the following form:

```
bower install user@gitHost:project.git#hash folder1/folder2..
```

## Usage

1. Install this repo globally
    * `npm install -g kokoska/bower-git-subdirectory-resolver`
    * Note: This should be able to be installed as a project `devDependency` but it doesn't seem bower plys nicely with that setup as of now (i.e., `npm install --saveDev kokoska/bower-git-subdirectory-resolver`)
2. List the resolver in your `.bowerrc` file
    * `{ "resolvers": [ "bower-git-subdirectory-resolver" ] }`
3. Install your bower subdirectory
    * `bower install --save user@gitHost:project.git#hash folder1/folder2`

Additional details can be found in the
[Bower Pluggable Resolver Docs](http://bower.io/docs/pluggable-resolvers/).
