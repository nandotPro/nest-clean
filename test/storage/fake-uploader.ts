import { UploadParams, Uploader } from "@/domain/forum/application/storage/uploader";

interface Upload {
    fileName: string
    link: string
}

export class FakeUploader implements Uploader {
    public uploads: Upload[] = [];

    async upload({ fileName }: UploadParams) {
        const link = `https://example.com/${fileName}`;

        this.uploads.push({
            fileName,
            link,
        });

        return { link };
    }
} 