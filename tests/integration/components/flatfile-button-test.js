import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import Service from '@ember/service';

module('Integration | Component | flatfile-button', function (hooks) {
  setupRenderingTest(hooks);

  let resolveReady, stubSetMountUrl;

  hooks.beforeEach(function (assert) {
    resolveReady = () => {};
    stubSetMountUrl = sinon.stub();

    class stubFlatfileService extends Service {
      importer = stubImporter;
      setMountUrl = stubSetMountUrl;
    }
    class stubImporter {
      $ready = new Promise((resolve) => {
        resolveReady = resolve;
      });

      requestDataFromUser = () => {
        return new Promise(() => {
          assert.step('requestDataFromUser');
        });
      };

      requestCorrectionsFromUser = () => {
        return new Promise(() => {
          assert.step('requestCorrectionsFromUser');
        });
      };
    }

    this.owner.register('service:flatfile', stubFlatfileService);
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

  test('it can yield an isLoading state (default preload=true)', async function (assert) {
    await render(hbs`
      <FlatfileButton as | status |>
        {{status.isLoading}}
      </FlatfileButton>
    `);

    assert.dom('button').includesText('true');

    await resolveReady();
    await settled();

    assert.dom('button').includesText('false');
  });

  test('it can yield an isLoading state (preload=false)', async function (assert) {
    await render(hbs`
      <FlatfileButton @preload={{false}} as | status |>
        {{status.isLoading}}
      </FlatfileButton>
    `);

    assert.dom('button').includesText('false');

    await click('button');

    assert.dom('button').includesText('true');

    await resolveReady();
    await settled();

    assert.dom('button').includesText('false');
    assert.verifySteps(['requestDataFromUser']);
  });

  test('it can yield an isReady state', async function (assert) {
    await render(hbs`
      <FlatfileButton as | status |>
        {{status.isReady}}
      </FlatfileButton>
    `);

    assert.dom('button').includesText('false');

    await resolveReady();
    await settled();

    assert.dom('button').includesText('true');
  });
});
