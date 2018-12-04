import test from 'ava';
import { setup, decamelize, isThrowable } from './utils/helpers';

(async () => {
  try {
    const instance = await setup('decoder');
  } catch (e) {
    console.log("Error loading WebAssembly module:", e);
    throw e;
  }

  for (const tests in instance) {
    const testsInstance = instance[tests];
    if (isThrowable(tests)) {
      for (const testName in testsInstance) {
        test(decamelize(testName), t => t.throws(() => testsInstance[testName]()));
      }
    } else {
      for (const testName in testsInstance) {
        test(decamelize(testName), t => t.truthy(testsInstance[testName]()));
      }
    }
  }
})();