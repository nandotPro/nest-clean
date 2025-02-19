import { InMemoryAttachmentsRepository } from "test/repositories/in-memory-attachments-repository";
import { UploadAndCreateAttachmentUseCase } from "./upload-and-create-attachment";
import { FakeUploader } from "test/storage/fake-uploader";
import { InvalidAttachmentTypeError } from "./errors/invalid-attachment-type-error";

describe('Upload and Create Attachment', () => {
    let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository;
    let fakeUploader: FakeUploader;
    let sut: UploadAndCreateAttachmentUseCase;

    beforeEach(() => {
        inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository();
        fakeUploader = new FakeUploader();
        sut = new UploadAndCreateAttachmentUseCase(
            inMemoryAttachmentsRepository,
            fakeUploader,
        );
    });

    it('should be able to upload and create an attachment', async () => {
        const result = await sut.execute({
            fileName: 'sample.png',
            fileType: 'image/png',
            body: Buffer.from(''),
        });

        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual({
            attachment: expect.objectContaining({
                title: 'sample.png',
            }),
        });
        expect(fakeUploader.uploads).toHaveLength(1);
        expect(inMemoryAttachmentsRepository.items).toHaveLength(1);
    });

    it('should not be able to upload an attachment with invalid file type', async () => {
        const result = await sut.execute({
            fileName: 'sample.mp3',
            fileType: 'audio/mpeg',
            body: Buffer.from(''),
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(InvalidAttachmentTypeError);
        expect(fakeUploader.uploads).toHaveLength(0);
        expect(inMemoryAttachmentsRepository.items).toHaveLength(0);
    });
}); 