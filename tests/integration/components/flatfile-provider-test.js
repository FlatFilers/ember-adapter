import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import Service from '@ember/service';

module('Integration | Component | flatfile-provider', function (hooks) {
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
    stubRegisterRecordHook,
    stubRegisterFieldHook;

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
    stubRegisterFieldHook = sinon.stub();

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
      registerFieldHook = stubRegisterFieldHook;
    }

    this.owner.register('service:flatfile', stubFlatfileService);
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
      <FlatfileProvider
        @licenseKey='foo'
        @settings={{this.settings}}
        @customer={{this.customer}} />
     `);

    assert.ok(
      importerSpy.calledWith(this.licenseKey, this.settings, this.customer)
    );
  });

  test('it fires a cancel action when the user cancels', async function (assert) {
    this.onCancel = () => assert.step('canceled');
    await render(hbs`
      <FlatfileProvider @onCancel={{this.onCancel}} as | flatfile |>
        <button {{on "click" flatfile.open}}>Click me</button>
      </FlatfileProvider>
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
    this.fieldHooks = { foo: () => {} };
    await render(hbs`
      <FlatfileProvider
        @onBeforeFetch={{this.onBeforeFetch}}
        @onInteractionEvent={{this.onInteractionEvent}}
        @onRecordChange={{this.onRecordChange}}
        @fieldHooks={{this.fieldHooks}}
        @mountUrl={{this.mountUrl}}
        as | flatfile |>
        <button {{on "click" flatfile.open}}>Click me</button>
      </FlatfileProvider>
    `);

    assert.ok(stubSetMountUrl.calledWith(this.mountUrl));
    assert.ok(stubRegisterBeforeFetchCallback.calledWith(this.onBeforeFetch));
    assert.ok(
      stubRegisterInteractionEventCallback.calledWith(this.onInteractionEvent)
    );
    assert.ok(stubRegisterRecordHook.called);
    assert.ok(stubRegisterFieldHook.calledWith('foo', this.fieldHooks['foo']));
  });

  test('it allows onData to resolve with a display message', async function (assert) {
    this.onData = () => {
      return new Promise((resolve) => {
        assert.step('onData');
        resolve('success!');
      });
    };
    await render(hbs`
      <FlatfileProvider @onData={{this.onData}} as | flatfile |>
        <button {{on "click" flatfile.open}}>Click me</button>
      </FlatfileProvider>
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
      <FlatfileProvider @onData={{this.onData}} as | flatfile |>
        <button {{on "click" flatfile.open}}>Click me</button>
      </FlatfileProvider>
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
      <FlatfileProvider @onData={{this.onData}} as | flatfile |>
        <button {{on "click" flatfile.open}}>Click me</button>
      </FlatfileProvider>
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
