const { productPath } = require("./productPath");

test("product links use each product's category and subcategory", () => {
  expect(productPath({ category: "men", subcategory: "printed", slug: "beach-shirt" })).toBe("/men/printed/beach-shirt");
  expect(productPath({ category_slug: "women", subcategory_slug: "tops", slug: "cotton-top" })).toBe("/women/tops/cotton-top");
  expect(productPath({ category: "kids", subcategory: "boys", slug: "shirt" })).toBe("/kids/boys/shirt");
});

test("missing subcategory does not collide with a category listing route", () => {
  expect(productPath({ category: "footwear", slug: "sneaker" })).toBe("/footwear/uncategorized/sneaker");
});

test("older saved cart records can still resolve via the legacy route", () => {
  expect(productPath({ slug: "old-shirt" })).toBe("/product/old-shirt");
});

test("route segments are encoded independently", () => {
  expect(productPath({ category: "men", subcategory: "printed", slug: "a/b" })).toBe("/men/printed/a%2Fb");
});
