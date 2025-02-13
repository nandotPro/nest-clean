export class Slug {
    public value: string;

    private constructor(value: string) {
        this.value = value;
    }

    static create(slug: string) {
        return new Slug(slug);
    }
    
    static createFromText(text: string) {
        const slugText = text
            .normalize("NFKD")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^[-]+|[-]+$/g, "")

        if (slugText.length > 255) {
            throw new Error("Slug cannot be longer than 255 characters.");
        }

        return new Slug(slugText);
    }
}