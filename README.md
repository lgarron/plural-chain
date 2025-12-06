# `plural-chain`

It's kind of like a monad for plurals!

Everything is explicitly specified (no heuristics), in order to keep the code size small and avoid surprises.

## Examples

````js readme-example
import { Plural } from "plural-chain";

console.log(`Anne has ${Plural.a.s(1)`pencils`}.`); // Anne has a pencil.
console.log(`Anne has ${Plural.a.s(4)`pencils`}.`); // Anne has pencils.

console.log(`Mash ${Plural.num.es(1)`potatoes`} thoroughly.`); // Mash 1 potato thoroughly.
console.log(`Mash ${Plural.num.es(4)`potatoes`} thoroughly.`); // Mash 2 potatoes thoroughly.

const nephews = ["Tick", "Trick", "Track"];
console.log(`Donald has ${Plural.num.s({ nephews })}.`); // Donald has 3 nephews.

{
  const fruits = ["apple"]; // Or try: ["apple", "pear"];
  // I have a piece of fruit at home!
  // I have some pieces of fruit at home!
  console.log(
    `I have ${Plural.literal(["a", "some"]).s(fruits)`pieces`} of ${Plural.s.singular({ fruits })} at home!`,
  );
}
````
