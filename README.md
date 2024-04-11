# RSS Feed Editor

Live: https://editor.rss.sphorb.cloud

Sometimes you want to modify the content or structure of an Atom or RSS feed, say you are using the feed with [RSS Bridge](https://github.com/RSS-Bridge/rss-bridge) or [FreshRSS](https://github.com/FreshRSS/FreshRSS) and don't have many options for modifying it. This tool will allow you to apply if-then rules with various options for mutations and then provide a URL you can use that proxies and modifies the feed as configured, allowing you to filter the feed before it reaches other RSS applications.

## Concepts

At the foundation, transformation rules are constructed of a `Condition` (which can be made up of many conditions) and a set of `Mutation`s to perform. Together a condition + mutations makes a `Rule`. A feed URL and a set of rules is a `Feed Transform`. Elements of a feed to apply a condition or rule to are determined using [XPath queries](https://developer.mozilla.org/en-US/docs/Web/XPath), an XPath starting with a slash (`/`) indicates an absolute XPath, an XPath without a leading slash is assumed to be relative to the rule's XPath. XPaths are optional for conditions and mutations, if they are missing they are applied to the elements matched by the rule's XPath.

Currently the app supports the following conditions:

```
contains:
   Tests whether or not the text of the element contains a substring

   args:
      pattern: Regular expression to match
```

and the following mutations:

```
remove:
   Removes the element from the feed

replace:
   Replace text within the element

   args:
      pattern: Regular expression of text to match
      replacement: String to replace matches with
      trim: true or false, whether or not to remove leading and trailing whitespace

changeTag:
   Change the tag of the element (e.g. change a managingEditor to a webMaster)

   args:
      tag: Tag to use instead
```

## Running the app

The easiest way to run the application is simple:

```sh
make start
```

This uses `docker compose` to spin up the application locally hosted at `localhost:3000`.

## Development

- For frontend only work: `make dev-frontend` or `bun run dev`
- For API work: `make dev-backend`
