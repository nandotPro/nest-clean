import { Encrypter } from "@/domain/forum/application/cryptography/encrypter";
import { JwtService } from "@nestjs/jwt";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JwtEncrypter implements Encrypter {
    constructor(private jwtService: JwtService) {}

    encrypt(payload: Record<string, unknown>): Promise<string> {
        return this.jwtService.signAsync(payload);
    }
}