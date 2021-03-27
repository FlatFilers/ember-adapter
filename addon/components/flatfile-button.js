import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

const noOp = () => {};

export default class extends Component {
  @service flatfile;

  @tracked isLoading = this.args.preload !== false;
  @tracked isReady = false;

  onCancel = this.args.onCancel ?? noOp;

  constructor() {
    super(...arguments);
    if (this.args.preload !== false) this.initializeFlatfileImporter();
  }

  initializeFlatfileImporter() {
    this.isLoading = true;

    if (this.args.mountUrl) this.flatfile.setMountUrl(this.args.mountUrl);

    this.flatfileImporter = new this.flatfile.importer(
      this.args.licenseKey,
      this.args.settings,
      this.args.customer
    );

    if (this.args.onBeforeFetch)
      this.flatfileImporter.registerBeforeFetchCallback(
        this.args.onBeforeFetch
      );
    if (this.args.onInteractionEvent)
      this.flatfileImporter.registerInteractionEventCallback(
        this.args.onInteractionEvent
      );
    if (this.args.onRecordChange || this.args.onRecordInit)
      this.flatfileImporter.registerRecordHook((record, index, eventType) => {
        if (eventType === 'change' && this.args.onRecordChange) {
          return this.args.onRecordChange(record, index);
        }
        if (eventType === 'init' && this.args.onRecordInit) {
          return this.args.onRecordInit(record, index);
        }
      });

    this.initializeFlatfileImporterEvents();
  }

  initializeFlatfileImporterEvents() {
    this.flatfileImporter.$ready.then(() => {
      this.isReady = true;
      this.isLoading = false;
    });
  }

  @action
  _handleData(results) {
    this.flatfileImporter.displayLoader();
    this.args?.onData(results).then(
      (optionalMessage) =>
        optionalMessage !== null
          ? this.flatfileImporter.displaySuccess(optionalMessage || undefined)
          : this.flatfileImporter.close(),
      (error) => {
        this.flatfileImporter
          .requestCorrectionsFromUser(
            error instanceof Error ? error.message : error
          )
          .then(this._handleData, this.onCancel);
      }
    );
  }

  @action
  loadImporter() {
    if (!this.flatfileImporter) this.initializeFlatfileImporter();

    this.flatfileImporter
      .requestDataFromUser()
      .then(this._handleData, this.onCancel);
  }
}
