import test from 'ava';
import { setup, decamelize, isThrowable } from './utils/helpers';

(async () => {
  try {
    const instance = await setup('encoder');
  } catch (e) {
    console.log("Error loading WebAssembly module:", e);
    throw e;
  }

  // TODO: Refactor into proper testing framework for AssemblyScript
  for (const tests in instance) {
    const testsInstance = instance[tests];
    if (isThrowable(tests)) {
      for (const testName in testsInstance) {
        test(decamelize(testName), t => t.throws(() => testsInstance[testName]()));
      }
    } else {
      if (testsInstance.setUp) {
        test.beforeEach(() => {
          testsInstance.setUp();
        });
      }
      if (testsInstance.tearDown) {
        test.afterEach(() => {
          testsInstance.tearDown();
        });
      }
      for (const testName of Object.keys(testsInstance).filter(it => !(["setUp", "tearDown"].indexOf(it) != -1))) {
        test(decamelize(testName), t => t.truthy(testsInstance[testName]()));
      }
    }
  }
})();