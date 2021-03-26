import Component from '@glimmer/component';
import { action } from '@ember/object';
import FlatfileImporter from '@flatfile/adapter';
import { tracked } from '@glimmer/tracking';

export default class extends Component {
  @tracked isLoading = this.args.preload !== false;
  @tracked isReady = false;

  constructor() {
    super(...arguments);
    if (this.args.preload !== false) this.initializeFlatfileImporter();
  }

  initializeFlatfileImporter() {
    this.isLoading = true;

    if (this.args.mountUrl) FlatfileImporter.setMountUrl(this.args.mountUrl);

    this.flatfileImporter = new FlatfileImporter(
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
