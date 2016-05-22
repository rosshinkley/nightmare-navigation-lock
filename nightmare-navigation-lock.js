var debug = require('debug')('nightmare:navigation-lock');

module.exports = exports = function(Nightmare) {
  Nightmare.action('lockNavigation',
    function(ns, options, parent, win, renderer, done) {
      parent.on('lock-navigation', function(eventArguments) {
        var sliced = require('sliced');

        //set up default arguments for goto
        eventArguments = eventArguments || {};
        eventArguments.loadURL = eventArguments.loadURL || {
          eventName: 'goto'
        }

        //set up a place to back up original methods for unlock
        win.__original = {};

        //set up an override method
        var override = function(name) {
          win.__original[name] = win.webContents[name];
          win.webContents[name] = function() {
            parent.emit('log', 'Cannot execute ' + name + '.  Navigation locked.');
            var args = sliced(eventArguments[name].arguments || []);
            args.unshift(eventArguments[name].eventName);
            parent.emit.apply(null, args);
          };
        };

        //override navigation methods
        override('goForward');
        override('goBack');
        override('goToIndex');
        override('goToOffset');
        override('loadURL');

        //lock will-navigate
        win.__lock = function(event, url) {
          parent.emit('log', 'Cannot navigate.  Navigation locked.');
          event.preventDefault();
        };
        win.webContents.on('will-navigate', win.__lock);

        //call back to the parent process
        parent.emit('lock-navigation');
      });
      done();
      return this;
    },
    function() {
      var eventArguments, done;
      if (arguments.length == 1) {
        done = arguments[0];
      } else {
        eventArguments = arguments[0];
        done = arguments[1];
      }
      debug('locking navigation');
      this.child.once('lock-navigation', done);
      this.child.emit('lock-navigation', eventArguments);
    });

  Nightmare.action('unlockNavigation',
    function(ns, options, parent, win, renderer, done) {
      parent.on('unlock-navigation', function() {
        //does lock exist?
        if (win.__lock) {

          //remove the will-navigate lock
          win.webContents.removeListener('will-navigate', win.__lock);
          delete win.__lock;

          //set up a restore method
          var restore = function(name) {
            win.webContents[name] = win.__original[name];
          };

          restore('goForward');
          restore('goBack');
          restore('goToIndex');
          restore('goToOffset');
          restore('loadURL');
        } else {
          parent.emit('log', 'unlockNavigation called before lockNavigation, skipping');
        }
        parent.emit('unlock-navigation');
      });
      done();
      return this;
    }, function(done) {
      debug('unlocking navigation');
      this.child.once('unlock-navigation', done);
      this.child.emit('unlock-navigation');
    });
}
