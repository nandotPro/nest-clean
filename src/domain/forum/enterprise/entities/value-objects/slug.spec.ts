import { Slug } from "./slug";

test("create a slug from text", () => {
    const slug = Slug.createFromText("This is a test");

    expect(slug.value).toEqual("this-is-a-test");
});

test("create a slug from long text", () => {
    const longText = "a".repeat(256);
    expect(() => Slug.createFromText(longText)).toThrowError("Slug cannot be longer than 255 characters.");
});
