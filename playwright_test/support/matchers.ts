import {
  expect as nativeExpect,
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

export const expect = nativeExpect.extend({
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
