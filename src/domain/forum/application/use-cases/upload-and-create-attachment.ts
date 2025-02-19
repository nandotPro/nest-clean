import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/either";
import { InvalidAttachmentTypeError } from "./errors/invalid-attachment-type-error";
import { Attachment } from "../../enterprise/entities/attachment";
import { AttachmentsRepository } from "../repositories/attachments-repository";
import { Uploader } from "../storage/uploader";

interface UploadAndCreateAttachmentUseCaseRequest {
    fileName: string
    fileType: string
    body: Buffer
}

type UploadAndCreateAttachmentUseCaseResponse = Either<
    InvalidAttachmentTypeError,
    {
        attachment: Attachment
    }
>

@Injectable()
export class UploadAndCreateAttachmentUseCase {
    constructor(
        private attachmentsRepository: AttachmentsRepository,
        private uploader: Uploader,
    ) {}

    async execute({
        fileName,
        fileType,
        body,
    }: UploadAndCreateAttachmentUseCaseRequest): Promise<UploadAndCreateAttachmentUseCaseResponse> {
        const allowedMimeTypesRegex = /^(image\/(jpeg|png)|application\/(pdf))$/;

        if (!allowedMimeTypesRegex.test(fileType)) {
            return left(new InvalidAttachmentTypeError(fileType))
        }

        const { link } = await this.uploader.upload({
            fileName,
            fileType,
            body,
        })

        const attachment = Attachment.create({
            title: fileName,
            link,
        })

        await this.attachmentsRepository.create(attachment)

        return right({
            attachment,
        })
    }
} 