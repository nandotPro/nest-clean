import { Controller, Patch, Param, HttpCode, BadRequestException, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@/infra/auth/jwt-auth.guard";
import { ReadNotificationUseCase } from "@/domain/notification/application/use-cases/read-notification";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { NotAllowedError } from "@/core/errors/errors/not-allowed-error";
import { ResourceNotFoundError } from "@/core/errors/errors/resouce-not-found-error";

@Controller('/notifications/:notificationId/read')
@UseGuards(JwtAuthGuard)
export class ReadNotificationController {
    constructor(
        private readNotification: ReadNotificationUseCase,
    ) {}

    @Patch()
    @HttpCode(204)
    async handle(
        @CurrentUser() user: UserPayload,
        @Param('notificationId') notificationId: string,
    ) {
        const result = await this.readNotification.execute({
            notificationId,
            recipientId: user.sub,
        });

        if (result.isLeft()) {
            const error = result.value;

            switch (error.constructor) {
                case ResourceNotFoundError:
                    throw new BadRequestException(error.message);
                case NotAllowedError:
                    throw new BadRequestException(error.message);
                default:
                    throw new BadRequestException(error.message);
            }
        }
    }
} 