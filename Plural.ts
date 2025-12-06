// biome-ignore lint/suspicious/noExplicitAny: Any type is valid.
type Countable = number | Array<any>;
type NamedCountable<T extends string> = { [t in T]: Countable };
// biome-ignore lint/suspicious/noExplicitAny: This is used for implementation signatures.
type CountableOrNamedCountable = Countable | NamedCountable<any>;

interface Component {
  get(
    count: number,
    commonPrefix: string,
    options?: Options,
    overridePrevious?: Multiplicity,
  ): string | null;
  overridePrevious?: () => Multiplicity | undefined;
}

class StaticComponent implements Component {
  constructor(
    private singular: string | null,
    private plural: string | null,
  ) {}

  get(
    count: number,
    _commonPrefix?: string,
    _options?: Options,
  ): string | null {
    if (count === 1) {
      return this.singular;
    } else {
      return this.plural;
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
const countComponent = new CountComponent();

enum Multiplicity {
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
const singularComponent = new OverridePreviousMultiplicity(
  Multiplicity.Singular,
);
const pluralComponent = new OverridePreviousMultiplicity(Multiplicity.Plural);

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
const izedComponent = new IzedComponent();

const DEFAULT_COMPONENTS = [izedComponent];

// TODO
interface Options {
  singularSuffix?: string;
  pluralSuffix?: string;
  components?: Component[];
}

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
      throw new Error("Reference plural does not end with plural suffix.");
    }

    return plural.slice(0, -pluralSuffix.length);
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
  define("ies", [izedComponent], { singularSuffix: "y", pluralSuffix: "ies" });
  define("ses", [izedComponent], { pluralSuffix: "ses" });
  define("a", [new StaticComponent("a", null)]);
  define("an", [new StaticComponent("an", null)]);
  define("aSome", [new StaticComponent("a", "some")]);
  define("isAre", [new StaticComponent("is", "are")]);
  define("isAAre", [new StaticComponent("is a", "are")]);

  fn.literal = (s: string) => appendComponents([new StaticComponent(s, s)]);

  return fn;
}

type Pluralizer = Monad & {
  options?: Options;
  num: Pluralizer;
  singular: Pluralizer;
  plural: Pluralizer;
  s: Pluralizer;
  es: Pluralizer;
  ies: Pluralizer;
  ses: Pluralizer;
  a: Pluralizer;
  an: Pluralizer;
  aSome: Pluralizer;
  isAre: Pluralizer;
  isAAre: Pluralizer;
  literal: (s: string) => Pluralizer;
};

export const Plural = createPluralizer();

if (import.meta.main) {
  // console.log(createPlural({ components: [StaticComponent.isAre] }).options);
  // console.log(Plural.isAre.options);

  for (const nephews of [["Tick", "Trick", "Track"], ["Joe"]]) {
    console.log(`There ${Plural.isAAre.s({ nephews })}.`);
    // console.log(
    //   `There ${createPlural({ components: [StaticComponent.isAAre] }).s({ nephews })}.`,
    // );
    console.log(
      `Where ${Plural.isAre({ nephews })} the ${Plural.s({ nephews })}?`,
    );
  }

  // console.log(`Anne owns ${Plural.a(4)`car`}.`);

  for (const potatoes of [
    ["boiled", "mash", "stuck in a stew"],
    ["Sir Spud"],
  ]) {
    console.log(`I have ${Plural.es({ potatoes })} at home!`);
  }

  for (const n of new Array(5).fill(0).map((_, i) => i)) {
    console.log(`You have been dealt a hand of ${Plural.num.s(n)`cards`}.`);
    console.log(`There ${Plural.isAre.num.s(n)`lights`}.`);
  }

  console.log(`I have ${Plural.a.ies(1)`cherries`} at home!`);

  for (const fruits of [["apple"], ["pear", "peach"]]) {
    console.log(
      `I have ${Plural.aSome.s(fruits)`pieces`} of ${Plural.s.singular({ fruits })} at home!`,
    );
  }
  for (const fruits of [["apple"], ["pear", "peach"]]) {
    console.log(
      `I have ${Plural.aSome.literal("delicious").s({ fruits })} at home!`,
    );
  }
}
