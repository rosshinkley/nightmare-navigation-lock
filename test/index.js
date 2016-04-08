/**
 * Module dependencies.
 */

require('mocha-generators')
  .install();

var Nightmare = require('nightmare');
var should = require('chai')
  .should();
var url = require('url');
var server = require('./server');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var rimraf = require('rimraf');

/**
 * Temporary directory
 */

var tmp_dir = path.join(__dirname, 'tmp')

/**
 * Get rid of a warning.
 */

process.setMaxListeners(0);

/**
 * Locals.
 */

var base = 'http://localhost:7500/';

describe('Nightmare Navigation Lock', function() {
  before(function(done) {
    require('../nightmare-navigation-lock');
    server.listen(7500, done);
  });

  it('should be constructable', function * () {
    var nightmare = Nightmare();
    nightmare.should.be.ok;
    yield nightmare.end();
  });

  describe('navigation locking', function() {
    var nightmare;

    beforeEach(function() {
      nightmare = Nightmare();
    });

    afterEach(function * () {
      yield nightmare.end();
    });

    it('should be able to lock navigation', function * () {
      var url = yield nightmare
        .goto(fixture('one'))
        .lockNavigation()
        .goto(fixture('two'))
        .url()

        url.should.contain(fixture('one'));
    });

    it('should be able to unlock navigation', function * () {
      var url = yield nightmare
        .goto(fixture('one'))
        .lockNavigation()
        .goto(fixture('two'))
        .url();

      var url2 = yield nightmare
        .unlockNavigation()
        .goto(fixture('two'))
        .url();

        url.should.contain(fixture('one'));
        url2.should.contain(fixture('two'));
    });

    it('should prevent navigation from clicking on a link', function*(){
      var url = yield nightmare
        .goto(fixture('one'))
        .lockNavigation()
        .click('#gototwo')
        .url();

      var url2 = yield nightmare
        .unlockNavigation()
        .click('#gototwo')
        .url();

        url.should.contain(fixture('one'));
        url2.should.contain(fixture('two'));
    });

  });
});

/**
 * Generate a URL to a specific fixture.
 * @param {String} path
 * @returns {String}
 */

function fixture(path) {
  return url.resolve(base, path);
}
