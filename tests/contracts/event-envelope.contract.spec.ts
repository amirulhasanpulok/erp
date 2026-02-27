import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const schema = require('./event-envelope.schema.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const samples = require('./sample-events.json');

describe('Canonical ERP event envelope contract', () => {
  it('validates all required event samples against v1.0 schema', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajv);
    const validate = ajv.compile(schema);

    for (const payload of samples) {
      const ok = validate(payload);
      if (!ok) {
        // Fail with payload context for fast debugging of schema drift.
        throw new Error(
          `Invalid event ${payload?.eventType}: ${ajv.errorsText(validate.errors)}`,
        );
      }
    }
  });
});
