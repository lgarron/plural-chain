import {
  type Component,
  type Countable,
  type CountableOrNamedCountable,
  countComponent,
  DEFAULT_COMPONENTS,
  izedComponent,
  LiteralComponent,
  type Multiplicity,
  type NamedCountable,
  pluralComponent,
  singularComponent,
} from "./Component";
import type { Options } from "./Options";

function toCount(countable: Countable): number {
  return Array.isArray(countable) ? countable.length : countable;
}

type Fn = ([commonPrefix]: TemplateStringsArray | string[]) => string;

function isCountable(
  countable: CountableOrNamedCountable,
): countable is Countable {
  return typeof countable === "number" || Array.isArray(countable);
}

declare function monad(countable: Countable): Fn;
declare function monad<T extends string>(
  namedCountable: NamedCountable<T>,
): string;
declare function monad(
  countableOrNamedCountable: CountableOrNamedCountable,
): Fn | string;
type Monad = typeof monad;

function createPluralizer(options?: Options): Pluralizer {
  function joinComponents(count: number, commonPrefix: string): string {
    const parts: string[] = [];
    const components: Component[] = options?.components ?? DEFAULT_COMPONENTS;
    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      let overridePrevious: Multiplicity | undefined;
      if (i + 1 < components.length) {
        overridePrevious = components[i + 1].overridePrevious?.();
      }
      const part = component.get(
        count,
        commonPrefix,
        options,
        overridePrevious,
      );
      if (part) {
        parts.push(part);
      }
    }
    return parts.join(" ");
  }

  const pluralSuffix = options?.pluralSuffix ?? "";

  function extractCommonPrefix(plural: string): string {
    if (!plural.endsWith(pluralSuffix)) {
      throw new Error(
        `Reference plural ("${plural}") does not end with plural suffix ("${pluralSuffix}").`,
      );
    }

    return pluralSuffix.length > 0
      ? plural.slice(0, -pluralSuffix.length)
      : plural;
  }

  function extractFromNamed<T extends string>(
    namedCountable: NamedCountable<T>,
  ): {
    count: number;
    commonPrefix: string;
  } {
    const [key, ...extra] = Object.keys(namedCountable);
    if (extra.length > 0) {
      throw new Error("Invalid extra keys.");
    }

    const count = toCount((namedCountable as Record<string, Countable>)[key]);
    const commonPrefix = extractCommonPrefix(key);
    return { count, commonPrefix };
  }

  const fn: Pluralizer = ((
    countableOrNamedCountable: CountableOrNamedCountable,
  ): Fn | string => {
    if (isCountable(countableOrNamedCountable)) {
      const count = toCount(countableOrNamedCountable);
      return ([plural]) => joinComponents(count, extractCommonPrefix(plural));
    } else {
      const { count, commonPrefix } = extractFromNamed(
        countableOrNamedCountable,
      );
      return joinComponents(count, commonPrefix);
    }
  }) as Pluralizer;
  fn.options = options;

  function appendComponents(
    components: Component[],
    optionsOverrides?: Options,
  ) {
    const newOptions = { ...options };
    // biome-ignore lint/suspicious/noAssignInExpressions: https://github.com/biomejs/biome/discussions/7592
    (newOptions.components ??= []).push(...components);
    return createPluralizer({ ...newOptions, ...optionsOverrides });
  }

  function define(
    field: string,
    components: Component[],
    optionsOverrides?: Options,
  ) {
    Object.defineProperty(fn, field, {
      get() {
        return appendComponents(components, optionsOverrides);
      },
    });
  }

  define("num", [countComponent]);
  define("singular", [singularComponent]);
  define("plural", [pluralComponent]);

  define("s", [izedComponent], { pluralSuffix: "s" });
  define("es", [izedComponent], { pluralSuffix: "es" });
  define("y_ies", [izedComponent], {
    singularSuffix: "y",
    pluralSuffix: "ies",
  });
  define("is_es", [izedComponent], {
    singularSuffix: "is",
    pluralSuffix: "es",
  });
  define("same", [izedComponent], {});

  define("a", [new LiteralComponent(["a", null])]);
  define("an", [new LiteralComponent(["an", null])]);
  define("is_are", [new LiteralComponent(["is", "are"])]);
  define("is_a__are", [new LiteralComponent(["is a", "are"])]);
  define("has_have", [new LiteralComponent(["has", "have"])]);

  fn.literal = (
    literalInfo: string | [singular: string | null, plural: string | null],
  ) => appendComponents([new LiteralComponent(literalInfo)]);

  return fn;
}

type Pluralizer = Monad & {
  options?: Options;

  num: Pluralizer;
  singular: Pluralizer;
  plural: Pluralizer;

  s: Pluralizer;
  es: Pluralizer;
  y_ies: Pluralizer;
  is_es: Pluralizer;
  same: Pluralizer;

  a: Pluralizer;
  an: Pluralizer;
  is_are: Pluralizer;
  is_a__are: Pluralizer;
  has_have: Pluralizer;

  literal: (
    s: string | [singular: string | null, plural: string | null],
  ) => Pluralizer;
};

export const Plural = createPluralizer();
