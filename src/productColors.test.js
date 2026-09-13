import { colorImage } from "./productColors";
import { mapCartItem } from "./api/mappers";

const product = { image: "cover.jpg", images: ["blue.jpg", "white.jpg"], colors: [{ name: "Blue" }, { name: "White" }] };

test("each color resolves to its corresponding gallery image, not the cover", () => {
  expect(colorImage(product, "Blue")).toBe("blue.jpg");
  expect(colorImage(product, "White")).toBe("white.jpg");
});

test("missing color or gallery image safely uses the product image", () => {
  expect(colorImage(product, null)).toBe("cover.jpg");
  expect(colorImage({ ...product, images: [] }, "White")).toBe("cover.jpg");
  expect(colorImage({}, "White")).toBeNull();
});

test("signed-in cart mapping preserves the selected image returned by the API", () => {
  expect(mapCartItem({ id: "cart", color: "White", product: { ...product, image: "white.jpg" } }))
    .toMatchObject({ color: "White", image: "white.jpg" });
});
