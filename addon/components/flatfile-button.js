import Component from '@glimmer/component';
import { action } from '@ember/object';
import FlatfileImporter from '@flatfile/adapter';

export default class extends Component {
  constructor() {
    super(...arguments);
    if (this.args.preload !== false) this.initializeFlatfileImporter();
  }

  initializeFlatfileImporter() {
    if (this.args.mountUrl) FlatfileImporter.setMountUrl(this.args.mountUrl);

    this.flatfileImporter = new FlatfileImporter(
      this.args.licenseKey,
      this.args.settings,
      this.args.customer
    );

    // TODO register callbacks
  }

  @action
  loadImporter() {
    if (!this.flatfileImporter) this.initializeFlatfileImporter();
    this.flatfileImporter.open();
  }
}
