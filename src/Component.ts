import type { Options } from "./Options";

// biome-ignore lint/suspicious/noExplicitAny: Any type is valid.
export type Countable = number | Array<any>;
export type NamedCountable<T extends string> = { [t in T]: Countable };
// biome-ignore lint/suspicious/noExplicitAny: This is used for implementation signatures.
export type CountableOrNamedCountable = Countable | NamedCountable<any>;

export interface Component {
  get(
    count: number,
    commonPrefix: string,
    options?: Options,
    overridePrevious?: Multiplicity,
  ): string | null;
  overridePrevious?: () => Multiplicity | undefined;
}

export class LiteralComponent implements Component {
  #singular: string | null;
  #plural: string | null;
  constructor(
    literalInfo: string | [singular: string | null, plural: string | null],
  ) {
    if (Array.isArray(literalInfo)) {
      [this.#singular, this.#plural] = literalInfo;
    } else {
      this.#singular = literalInfo;
      this.#plural = literalInfo;
    }
  }

  get(
    count: number,
    _commonPrefix?: string,
    _options?: Options,
  ): string | null {
    if (count === 1) {
      return this.#singular;
    } else {
      return this.#plural;
    }
  }
}

class CountComponent {
  get(
    count: number,
    _commonPrefix?: string,
    _options?: Options,
  ): string | null {
    return count.toString();
  }
}
// TODO: lazy instance var?
export const countComponent = new CountComponent();

export enum Multiplicity {
  Singular = "singular",
  Plural = "plural",
}
class OverridePreviousMultiplicity implements Component {
  constructor(public readonly multiplicity: Multiplicity) {}

  get(_count?: number, _commonPrefix?: string, _options?: Options): null {
    return null;
  }

  overridePrevious(): Multiplicity {
    return this.multiplicity;
  }
}
// TODO: lazy instance var?
export const singularComponent = new OverridePreviousMultiplicity(
  Multiplicity.Singular,
);
export const pluralComponent = new OverridePreviousMultiplicity(
  Multiplicity.Plural,
);

class IzedComponent implements Component {
  get(
    count: number,
    commonPrefix: string,
    options?: Options,
    overrideMultiplicity?: Multiplicity,
  ): string | null {
    const adjustedCount = (() => {
      switch (overrideMultiplicity) {
        case Multiplicity.Singular: {
          return 1;
        }
        case Multiplicity.Plural: {
          return 2;
        }
        default: {
          return count;
        }
      }
    })();
    if (adjustedCount === 1) {
      return commonPrefix + (options?.singularSuffix ?? "");
    } else {
      return commonPrefix + (options?.pluralSuffix ?? "");
    }
  }
}
export const izedComponent = new IzedComponent();

export const DEFAULT_COMPONENTS = [izedComponent];
