# nightmare-navigation-lock

## Usage
Require the library: 

```js
require('nightmare-navigation-lock')
```

... and then you're able to use `lockNavigation` and `unlockNavigation`.

### .lockNavigation([eventArguments])
Locks almost all kinds of navigation (see note below).  Optional event arguments can be provided by Electron function name so the Nightmare process can receive the events it is expecting to move on.  Arguments must be of the form:
```js
{
  loadURL: {
    'goto':['arg1', 'arg2' ...]
  }
}
```

By default, the `loadURL` argument is specified so `nightmare.goto()` works properly.


### .unlockNavigation()
Unlocks navigation.

## Important note about hash navigation
Electron does not expose a method to prevent hash navigation up front per the [`will-navigate`](https://github.com/electron/electron/blob/master/docs/api/web-contents.md#event-will-navigate) documentation.  This means that navigation cannot be locked for hash navigation.

## Example

```js
var nightmare = require('nightmare')();
nightmare
 .goto('http://some-url.tld')
 .lockNavigation()
 .goto('http://some-other-url.tld')
 .url()
 .then(function(url){
   //url should equal 'http://some-url.tld'
  });
```
