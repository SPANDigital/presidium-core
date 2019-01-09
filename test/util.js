var assert = require('assert');

describe('Util Tests', function() {

  describe('Test root paths', function() {
    var url = require('url');
    var isRoot = function(root, reference, baseurl = '/') {
      if (root == baseurl) {
        return root == reference;
      }
      return reference.startsWith(root);
    };
    it('Should validate parent root url', () => {
      assert.equal(true, isRoot('/p/', '/p/'));
      assert.equal(true, isRoot('/p', '/p/'));
      assert.equal(true, isRoot('/p', '/p'));

      assert.equal(true, isRoot('/p/', '/p/a'));
      assert.equal(true, isRoot('/p/', '/p/a/t'));

      assert.equal(false, isRoot('/b/', '/p'));
      assert.equal(false, isRoot('/b/', '/p/a'));
      assert.equal(false, isRoot('b/', '/b/'));

      assert.equal(true, isRoot('/root/p/', '/root/p/a', 'root'));
      assert.equal(false, isRoot('/root/p/', '/root/', 'root'));

      assert.equal(false, isRoot('/base', '/base/p/', '/base'));
      assert.equal(false, isRoot('/', '/p/', '/'));
    });

  });

});