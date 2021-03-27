import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import Service from '@ember/service';

module('Integration | Component | flatfile-button', function (hooks) {
  setupRenderingTest(hooks);

  let resolveReady,
    resolveRequestData,
    rejectRequestData,
    stubDisplaySuccess,
    stubDisplayLoader,
    stubClose,
    stubSetMountUrl,
    stubRegisterBeforeFetchCallback,
    stubRegisterInteractionEventCallback,
    stubRegisterRecordHook;

  hooks.beforeEach(function (assert) {
    resolveReady = () => {};
    resolveRequestData = () => {};
    rejectRequestData = () => {};
    stubDisplaySuccess = sinon.stub();
    stubDisplayLoader = sinon.stub();
    stubClose = sinon.stub();
    stubSetMountUrl = sinon.stub();
    stubRegisterBeforeFetchCallback = sinon.stub();
    stubRegisterInteractionEventCallback = sinon.stub();
    stubRegisterRecordHook = sinon.stub();

    class stubFlatfileService extends Service {
      importer = stubImporter;
      setMountUrl = stubSetMountUrl;
    }
    class stubImporter {
      $ready = new Promise((resolve) => {
        resolveReady = resolve;
      });

      requestDataFromUser = () => {
        return new Promise((resolve, reject) => {
          assert.step('requestDataFromUser');
          resolveRequestData = resolve;
          rejectRequestData = reject;
        });
      };

      requestCorrectionsFromUser = () => {
        return new Promise(() => {
          assert.step('requestCorrectionsFromUser');
        });
      };

      displaySuccess = stubDisplaySuccess;
      displayLoader = stubDisplayLoader;
      close = stubClose;
      registerBeforeFetchCallback = stubRegisterBeforeFetchCallback;
      registerInteractionEventCallback = stubRegisterInteractionEventCallback;
      registerRecordHook = stubRegisterRecordHook;
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

  test('it can pass the licenseKey, settings and customer to the importer', async function (assert) {
    let importerSpy = sinon.spy(
      this.owner.lookup('service:flatfile'),
      'importer'
    );
    this.licenseKey = 'foo';
    this.settings = { foo: 'bar' };
    this.customer = { name: 'cloud' };

    await render(hbs`
      <FlatfileButton
        @licenseKey='foo'
        @settings={{this.settings}}
        @customer={{this.customer}} />
    `);

    assert.ok(
      importerSpy.calledWith(this.licenseKey, this.settings, this.customer)
    );
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

  test('it fires a cancel action when the user cancels', async function (assert) {
    this.onCancel = () => assert.step('canceled');
    await render(hbs`
      <FlatfileButton
        @onCancel={{this.onCancel}}
        as | status |>
        {{status.isReady}}
      </FlatfileButton>
    `);
    resolveReady();
    await settled();
    await click('button');

    rejectRequestData();
    await settled();
    assert.verifySteps(['requestDataFromUser', 'canceled']);
  });

  test('it sets up optional callbacks, hooks and mountUrl', async function (assert) {
    this.mountUrl = 'custom mount url';
    this.onBeforeFetch = () => {};
    this.onInteractionEvent = () => {};
    this.onRecordChange = () => {};
    await render(hbs`
      <FlatfileButton
        @onBeforeFetch={{this.onBeforeFetch}}
        @onInteractionEvent={{this.onInteractionEvent}}
        @onRecordChange={{this.onRecordChange}}
        @mountUrl={{this.mountUrl}} />
    `);

    assert.ok(stubSetMountUrl.calledWith(this.mountUrl));
    assert.ok(stubRegisterBeforeFetchCallback.calledWith(this.onBeforeFetch));
    assert.ok(
      stubRegisterInteractionEventCallback.calledWith(this.onInteractionEvent)
    );
    assert.ok(stubRegisterRecordHook.called);
  });

  test('it allows onData to resolve with a display message', async function (assert) {
    this.onData = () => {
      return new Promise((resolve) => {
        assert.step('onData');
        resolve('success!');
      });
    };
    await render(hbs`
      <FlatfileButton
        @onData={{this.onData}}
        as | status |>
        {{status.isReady}}
      </FlatfileButton>
    `);
    resolveReady();
    await settled();
    await click('button');
    resolveRequestData();
    await settled();

    assert.ok(stubDisplayLoader.called, 'called loader');
    assert.ok(
      stubDisplaySuccess.calledWith('success!'),
      'called display success'
    );
    assert.verifySteps(['requestDataFromUser', 'onData']);
  });

  test('it allows onData to resolve without display message (set to null)', async function (assert) {
    this.onData = () => {
      return new Promise((resolve) => {
        assert.step('onData');
        resolve(null);
      });
    };
    await render(hbs`
      <FlatfileButton
        @onData={{this.onData}}
        as | status |>
        {{status.isReady}}
      </FlatfileButton>
    `);
    resolveReady();
    await settled();
    await click('button');
    resolveRequestData();
    await settled();

    assert.ok(stubDisplayLoader.called, 'called loader');
    assert.ok(stubClose.called, 'called close');
    assert.verifySteps(['requestDataFromUser', 'onData']);
  });

  test('it allows onData to reject with an error message', async function (assert) {
    this.onData = () => {
      return new Promise((_, reject) => {
        assert.step('onData');
        reject(new Error('uhoh!'));
      });
    };
    await render(hbs`
      <FlatfileButton
        @onData={{this.onData}}
        as | status |>
        {{status.isReady}}
      </FlatfileButton>
    `);
    resolveReady();
    await settled();
    await click('button');
    resolveRequestData();
    await settled();

    assert.ok(stubDisplayLoader.called, 'called loader');
    assert.verifySteps([
      'requestDataFromUser',
      'onData',
      'requestCorrectionsFromUser',
    ]);
  });
});
