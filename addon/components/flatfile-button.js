import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class extends Component {
  @service flatfile;

  @tracked isLoading = this.args.preload !== false;
  @tracked isReady = false;

  constructor() {
    super(...arguments);
    if (this.args.preload !== false) this.initializeFlatfileImporter();
  }

  initializeFlatfileImporter() {
    this.isLoading = true;

    if (this.args.mountUrl)
      this.flatfile.importer.setMountUrl(this.args.mountUrl);

    this.flatfileImporter = new this.flatfile.importer(
      this.args.licenseKey,
      this.args.settings,
      this.args.customer
    );
    this.flatfileImporter.$ready.then(() => {
      this.isReady = true;
      this.isLoading = false;
    });

    // TODO register callbacks
  }

  @action
  loadImporter() {
    if (!this.flatfileImporter) this.initializeFlatfileImporter();
    this.flatfileImporter.open();
  }
}
