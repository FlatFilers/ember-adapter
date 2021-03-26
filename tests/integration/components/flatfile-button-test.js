import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
// import sinon from 'sinon';
import Service from '@ember/service';

class flatfileServiceStub extends Service {
  importer = importerStub;
}
class importerStub {
  constructor() {
    this.$ready = new Promise((resolve) => resolve());
  }
}

module('Integration | Component | flatfile-button', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:flatfile', flatfileServiceStub);
  });

  test('it renders a button element with yielded text', async function (assert) {
    await render(hbs`
      <FlatfileButton>
        yielded text
      </FlatfileButton>
    `);

    assert.dom('button').includesText('yielded text');
  });

  test('it can pass attributes to the button element', async function (assert) {
    await render(hbs`<FlatfileButton class="foo" data-test />`);

    assert.dom('button').hasClass('foo');
    assert.dom('button').hasAttribute('data-test');
  });
});
