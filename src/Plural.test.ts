import { expect, test } from "bun:test";

import { Plural } from "./Plural";

test("Simple plural", async () => {
  expect(`Anne has ${Plural.a.s(1)`pencils`}.`).toEqual("Anne has a pencil.");
  expect(`Anne has ${Plural.a.s(4)`pencils`}.`).toEqual("Anne has pencils.");
});

test("isAAre / isA", async () => {
  {
    const fn = (nephews: string[]) =>
      `There ${Plural.is_a__are.s({ nephews })}.`;
    expect(fn(["Tick", "Trick", "Track"])).toEqual("There are nephews.");
    expect(fn(["Joe"])).toEqual("There is a nephew.");
  }
  {
    const fn = (nephews: string[]) =>
      `Where ${Plural.is_are({ nephews })} the ${Plural.s({ nephews })}?`;
    expect(fn(["Tick", "Trick", "Track"])).toEqual("Where are the nephews?");
    expect(fn(["Joe"])).toEqual("Where is the nephew?");
  }
  {
    const fn = (nephews: string[]) =>
      `Where ${Plural.is_are.literal("my").s({ nephews })}?`;
    expect(fn(["Tick", "Trick", "Track"])).toEqual("Where are my nephews?");
    expect(fn(["Joe"])).toEqual("Where is my nephew?");
  }
});

test("Literal", async () => {
  expect(
    `I have ${Plural.literal(["a", "multiple"]).s(1)`plants`} at the office.`,
  ).toEqual("I have a plant at the office.");
  expect(
    `I have ${Plural.literal(["a", "multiple"]).s(4)`plants`} at the office.`,
  ).toEqual("I have multiple plants at the office.");
});

test("Chaining", async () => {
  {
    const fn = (potatoes: string[]) => {
      return `We're eating ${Plural.a.es({ potatoes })} tonight. 🥔😋`;
    };
    expect(fn(["boiled", "mash", "stuck in a stew"])).toEqual(
      "We're eating potatoes tonight. 🥔😋",
    );
    expect(fn(["Sir Spud"])).toEqual("We're eating a potato tonight. 🥔😋");
  }
});

test("Multiples", async () => {
  {
    const fn = (n: number) =>
      `You have been dealt a hand of ${Plural.num.s(n)`cards`}.`;

    expect(fn(0)).toEqual("You have been dealt a hand of 0 cards.");
    expect(fn(1)).toEqual("You have been dealt a hand of 1 card.");
    expect(fn(2)).toEqual("You have been dealt a hand of 2 cards.");
    expect(fn(3)).toEqual("You have been dealt a hand of 3 cards.");
  }
  {
    const fn = (n: number) => `There ${Plural.is_are.num.s(n)`lights`}.`;

    expect(fn(0)).toEqual("There are 0 lights.");
    expect(fn(1)).toEqual("There is 1 light.");
    expect(fn(2)).toEqual("There are 2 lights.");
    expect(fn(3)).toEqual("There are 3 lights.");
    expect(fn(4)).toEqual("There are 4 lights.");

    expect(
      `There ${Plural.is_are.literal("definitely not").num.s(5)`lights`}.`,
    ).toEqual("There are definitely not 5 lights.");
  }
});

test("Singular (chained)", async () => {
  {
    const fn = (fruits: string[]) =>
      `I have ${Plural.literal(["a", "some"]).s(fruits)`pieces`} of ${Plural.s.singular({ fruits })} at home!`;
    expect(fn(["apple"])).toEqual("I have a piece of fruit at home!");
    expect(fn(["pear", "peach"])).toEqual(
      "I have some pieces of fruit at home!",
    );
  }
});

test("s", async () => {
  const fn = (n: number) =>
    `${Plural.num.s(n)`bottles`} of ginger beer on the wall.`;
  expect(fn(2)).toEqual("2 bottles of ginger beer on the wall.");
  expect(fn(1)).toEqual("1 bottle of ginger beer on the wall.");
});

test("es", async () => {
  const fn = (n: number) => `Mash ${Plural.num.es(n)`potatoes`} thoroughly.`;
  expect(fn(1)).toEqual("Mash 1 potato thoroughly.");
  expect(fn(2)).toEqual("Mash 2 potatoes thoroughly.");
});

test("y/ies", async () => {
  const fn = (n: number) => `I have ${Plural.a.y_ies(n)`cherries`} at home.`;
  expect(fn(1)).toEqual("I have a cherry at home.");
  expect(fn(2)).toEqual("I have cherries at home.");
});

test("is/es", async () => {
  const fn = (n: number) => `I have written ${Plural.num.is_es(n)`theses`}.`;
  expect(fn(1)).toEqual("I have written 1 thesis.");
  expect(fn(95)).toEqual("I have written 95 theses.");
});

test("same", async () => {
  const fn = (n: number) => `I see ${Plural.num.same(n)`fish`} in the tank.`;
  expect(fn(1)).toEqual("I see 1 fish in the tank.");
  expect(fn(2)).toEqual("I see 2 fish in the tank.");
});

test("a", async () => {
  const fn = (n: number) => `I see ${Plural.a.s(n)`sharks`} in the tank.`;
  expect(fn(1)).toEqual("I see a shark in the tank.");
  expect(fn(2)).toEqual("I see sharks in the tank.");
});

test("an", async () => {
  const fn = (n: number) => `I see ${Plural.an.s(n)`eels`} in the tank.`;
  expect(fn(1)).toEqual("I see an eel in the tank.");
  expect(fn(2)).toEqual("I see eels in the tank.");
});

test("is/are", async () => {
  const fn = (n: number) =>
    `There ${Plural.is_are.num.literal("spare").s(n)`aquarium pumps`}.`;
  expect(fn(1)).toEqual("There is 1 spare aquarium pump.");
  expect(fn(4)).toEqual("There are 4 spare aquarium pumps.");
});

test("is a/are", async () => {
  const fn = (n: number) =>
    `There ${Plural.is_a__are.s(n)`corals`} in the tank.`;
  expect(fn(1)).toEqual("There is a coral in the tank.");
  expect(fn(2)).toEqual("There are corals in the tank.");
});

test("has/have", async () => {
  class Thing {}
  const fn = (queue: Thing[]) =>
    `${Plural.num.s.has_have({ things: queue })} been created.`;
  expect(fn([new Thing()])).toEqual("1 thing has been created.");
  expect(fn([new Thing(), new Thing()])).toEqual("2 things have been created.");
});

test("was/were", async () => {
  const fn = (numFiles: number) =>
    `${Plural.num.s.was_were(numFiles)`files`} up to date.`;
  expect(fn(1)).toEqual("1 file was up to date.");
  expect(fn(7)).toEqual("7 files were up to date.");
});

test("Non-natural numbers", async () => {
  const fn = (numCups: number) =>
    `Add ${Plural.num.s(numCups)`cups`} of flour.`;
  // Check natural numbers for good measure.
  expect(fn(0)).toEqual("Add 0 cups of flour.");
  expect(fn(1)).toEqual("Add 1 cup of flour.");
  expect(fn(2)).toEqual("Add 2 cups of flour.");
  // TODO: ¾
  expect(fn(3 / 4)).toEqual("Add 0.75 cups of flour.");
  expect(fn(1.0000001)).toEqual("Add 1.0000001 cups of flour.");
  expect(fn(1.2345)).toEqual("Add 1.2345 cups of flour.");
  expect(fn(Infinity)).toEqual("Add Infinity cups of flour."); // 🤷
});
