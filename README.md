# Application generator done right

Finally an application generator that doesn't do magic - only the things that are required!

Ladies and gentleman, may I present you - the Github NPM project generator.

## What's all the fuzz all about?

Generating projects with npm is not a very tedious task. Just `npm init -y` and you're almost done. Almost...

The next thing that comes is installation of dependencies, project configuration and other tuning that needs to happen before you can get started with your project.

### That's what the 2nd argument for `npm init` is for!

Exactly right! The 2nd argument is part of a name of a project generator. For example if we ran the following command:

```terminal
$ npm init vite
```

NPM knows that there is a project called `create-vite`, it knows to install it if not already present and execute it instead of just creating a `package.json` with some default values. "Instead" being the operative word, because once the 2nd argument has been given it completely takes over the process of scaffolding the app.

Let's be serious about it: most projects will have one setup that works and that'll be what you would use most of the time. In point of fact there are lots of projects that provide such repositories already!

The cool thing about create-from-github is that those repositories can be used as-is to scaffold projects using this package! Here's an example:

```terminal
$ npm init from-github padcom/tailwindcss-text-stroke
```

And off you go! There's a `tailwindcss-text-stroke1` project scaffolded that has all the necessary places updated so that it's a perfectly customized clone of the `tailwindcss-text-stroke` repository.
