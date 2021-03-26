import Component from '@glimmer/component';
import FlatfileImporter from '@flatfile/adapter';

export default class extends Component {
  constructor() {
    super(...arguments);
    this.flatfileImporter = new FlatfileImporter(
      this.args.licenseKey,
      this.args.settings,
      this.args.customer
    );
  }
}
