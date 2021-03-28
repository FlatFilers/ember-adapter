import Service from '@ember/service';
import FlatfileImporter from '@flatfile/adapter';

// Allows for easier test mocking, could be useful for ember apps too
export default class FlatfileService extends Service {
  importer = FlatfileImporter;
}
