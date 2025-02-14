import { FakeHasher } from "test/cryptography/fake-hasher";
import { FakeEncrypter } from "test/cryptography/fake-encrypter";
import { AuthenticateStudentUseCase } from "./authenticate-student";
import { makeStudent } from "test/factories/make-student";
import { WrongCredentialsError } from "./errors/wrong-credentials-error";
import { InMemoryStudentsRepository } from "test/repositories/in-memory-students-repository";

let inMemoryStudentsRepository: InMemoryStudentsRepository;
let fakeHasher: FakeHasher;
let fakeEncrypter: FakeEncrypter;
let sut: AuthenticateStudentUseCase;

describe("AuthenticateStudentUseCase", () => {
    beforeEach(() => {
        inMemoryStudentsRepository = new InMemoryStudentsRepository();
        fakeHasher = new FakeHasher();
        fakeEncrypter = new FakeEncrypter();
        sut = new AuthenticateStudentUseCase(
            inMemoryStudentsRepository,
            fakeHasher,
            fakeEncrypter,
        );
    });

    it("should be able to authenticate a student", async () => {
        const student = makeStudent({
            email: "johndoe@example.com",
            password: await fakeHasher.hash("123456"),
        });

        await inMemoryStudentsRepository.create(student);

        const result = await sut.execute({
            email: "johndoe@example.com",
            password: "123456",
        });

        expect(result.isRight()).toBe(true);
        expect(result.value).toEqual({
            accessToken: expect.any(String),
        });
    });

    it("should not be able to authenticate with wrong email", async () => {
        const result = await sut.execute({
            email: "johndoe@example.com",
            password: "123456",
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(WrongCredentialsError);
    });

    it("should not be able to authenticate with wrong password", async () => {
        const student = makeStudent({
            email: "johndoe@example.com",
            password: await fakeHasher.hash("123456"),
        });

        await inMemoryStudentsRepository.create(student);

        const result = await sut.execute({
            email: "johndoe@example.com",
            password: "123123",
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(WrongCredentialsError);
    });
}); 