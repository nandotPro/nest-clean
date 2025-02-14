import { HashComparer } from "@/domain/forum/application/cryptography/hash-comparer";
import { HashGenerator } from "@/domain/forum/application/cryptography/hash-generator";
import { Injectable } from "@nestjs/common";
import { compare, hash } from "bcryptjs";

@Injectable()
export class BcryptHasher implements HashGenerator, HashComparer {
    private saltOrRounds = 8;   

    hash(plain: string): Promise<string> {
        return hash(plain, this.saltOrRounds);
    }    
    compare(plain: string, hash: string): Promise<boolean> {
        return compare(plain, hash);
    }
}