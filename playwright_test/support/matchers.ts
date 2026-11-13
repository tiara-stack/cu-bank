import {
  expect as nativeExpect,
  type Expect,
  type ExpectMatcherState,
  type Locator,
  type MatcherReturnType,
  type Page,
} from '@playwright/test';
import { Effect } from 'effect';
import type { Playwright } from 'effect-playwright';

type LocatorMatchers = ReturnType<typeof nativeExpect<Locator>>;
type PageMatchers = ReturnType<typeof nativeExpect<Page>>;
type Wrapped<T> = {
  use: <R>(callback: (native: T) => Promise<R>) => Effect.Effect<R, unknown>;
};

function isWrapped<T extends object>(received: T | Wrapped<T>): received is Wrapped<T> {
  return 'use' in received;
}

function nativeAssertion<T>(received: T, state: ExpectMatcherState) {
  const assertion = nativeExpect(received);
  return state.isNot ? assertion.not : assertion;
}

async function match<T extends object>(
  received: T | Wrapped<T>,
  state: ExpectMatcherState,
  assertion: (native: T) => Promise<void>,
): Promise<MatcherReturnType> {
  const check = async (native: T): Promise<MatcherReturnType> => {
    try {
      await assertion(native);
      // Playwright applies the outer .not after the delegated assertion handles negation.
      return { pass: !state.isNot, message: () => '' };
    } catch (error) {
      if (!(error instanceof Error) || !('matcherResult' in error)) throw error;
      return { pass: state.isNot, message: () => error.message };
    }
  };
  return isWrapped(received) ? Effect.runPromise(received.use(check)) : check(received);
}

const playwrightExpect = nativeExpect.extend({
  async toBeVisible(
    received: Locator | Playwright.Locator,
    options?: Parameters<LocatorMatchers['toBeVisible']>[0],
  ) {
    return match<Locator>(received, this, (native) =>
      nativeAssertion(native, this).toBeVisible({ ...options, timeout: options?.timeout ?? this.timeout }),
    );
  },
  async toBeFocused(
    received: Locator | Playwright.Locator,
    options?: Parameters<LocatorMatchers['toBeFocused']>[0],
  ) {
    return match<Locator>(received, this, (native) =>
      nativeAssertion(native, this).toBeFocused({ ...options, timeout: options?.timeout ?? this.timeout }),
    );
  },
  async toBeChecked(
    received: Locator | Playwright.Locator,
    options?: Parameters<LocatorMatchers['toBeChecked']>[0],
  ) {
    return match<Locator>(received, this, (native) =>
      nativeAssertion(native, this).toBeChecked({ ...options, timeout: options?.timeout ?? this.timeout }),
    );
  },
  async toHaveCount(
    received: Locator | Playwright.Locator,
    count: number,
    options?: Parameters<LocatorMatchers['toHaveCount']>[1],
  ) {
    return match<Locator>(received, this, (native) =>
      nativeAssertion(native, this).toHaveCount(count, { ...options, timeout: options?.timeout ?? this.timeout }),
    );
  },
  async toHaveText(
    received: Locator | Playwright.Locator,
    text: Parameters<LocatorMatchers['toHaveText']>[0],
    options?: Parameters<LocatorMatchers['toHaveText']>[1],
  ) {
    return match<Locator>(received, this, (native) =>
      nativeAssertion(native, this).toHaveText(text, { ...options, timeout: options?.timeout ?? this.timeout }),
    );
  },
  async toHaveURL(
    received: Page | Playwright.Page,
    url: Parameters<PageMatchers['toHaveURL']>[0],
    options?: Parameters<PageMatchers['toHaveURL']>[1],
  ) {
    return match<Page>(received, this, (native) =>
      nativeAssertion(native, this).toHaveURL(url, { ...options, timeout: options?.timeout ?? this.timeout }),
    );
  },
});

type EffectMatchers<T> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => infer Result
    ? (...args: Args) => Effect.Effect<Awaited<Result>>
    : T[K] extends object
      ? EffectMatchers<T[K]>
      : T[K];
};

type ExpectMessage = Parameters<typeof playwrightExpect>[1];
type ExpectConfiguration = Parameters<typeof playwrightExpect.configure>[0];
type MatcherDefinitions = Parameters<typeof nativeExpect.extend>[0];
type EffectExpect<Matchers> = Omit<Expect<Matchers>, 'soft' | 'configure' | 'extend'> & {
  <T extends Playwright.Page | Playwright.Locator>(
    received: T,
    message?: ExpectMessage,
  ): EffectMatchers<ReturnType<typeof assertionsFor<Matchers, T>>>;
  <T>(received: T, message?: ExpectMessage): ReturnType<typeof assertionsFor<Matchers, T>>;
  readonly soft: EffectExpect<Matchers>;
  configure: (configuration: ExpectConfiguration) => EffectExpect<Matchers>;
  extend: <More extends MatcherDefinitions>(matchers: More) => EffectExpect<Matchers & More>;
};

function assertionsFor<Matchers, T>(base: Expect<Matchers>, received: T, message?: ExpectMessage) {
  return base(received, message);
}

function effectMatchers<T extends object>(assertions: T): EffectMatchers<T> {
  // Adapt matcher methods and modifier objects while deferring each assertion until execution.
  return new Proxy(assertions, {
    get(target, property, receiver) {
      const member: unknown = Reflect.get(target, property, receiver);
      if (typeof member === 'function') {
        return (...args: unknown[]) =>
          Effect.promise(async () => {
            const result: unknown = Reflect.apply(member, target, args);
            return await result;
          });
      }
      if (typeof member === 'object' && member !== null) return effectMatchers(member);
      return member;
    },
  }) as EffectMatchers<T>;
}

function createEffectExpect<Matchers>(base: Expect<Matchers>): EffectExpect<Matchers> {
  function expect<T extends Playwright.Page | Playwright.Locator>(
    received: T,
    message?: ExpectMessage,
  ): EffectMatchers<ReturnType<typeof assertionsFor<Matchers, T>>>;
  function expect<T>(received: T, message?: ExpectMessage): ReturnType<typeof assertionsFor<Matchers, T>>;
  function expect(received: unknown, message?: ExpectMessage): unknown {
    const assertions = assertionsFor(base, received, message);
    if (
      typeof received === 'object' &&
      received !== null &&
      'use' in received &&
      typeof received.use === 'function' &&
      ('keyboard' in received || ('_raw' in received && 'all' in received))
    ) {
      return effectMatchers(assertions);
    }
    return assertions;
  }
  return Object.defineProperties(Object.assign(expect, base), {
    soft: { get: () => createEffectExpect(base.soft) },
    configure: {
      value: (configuration: ExpectConfiguration) => createEffectExpect(base.configure(configuration)),
    },
    extend: {
      value: <More extends MatcherDefinitions>(matchers: More) => createEffectExpect(base.extend(matchers)),
    },
  }) as EffectExpect<Matchers>;
}

export const expect = createEffectExpect(playwrightExpect);
