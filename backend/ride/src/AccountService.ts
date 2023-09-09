import crypto from "crypto";
import pgp from "pg-promise";
import CpfValidator from './CpfValidator';
import pg from "pg-promise/typescript/pg-subset";

export default class AccountService {
	CpfValidator: CpfValidator

	constructor () {
		this.CpfValidator = new CpfValidator();
	}

	async signup (input: any) {
		const connection = pgp()("postgres://postgres:pass123@localhost:5432/app");
		try {
			const accountId = crypto.randomUUID();
			const verificationCode = crypto.randomUUID();
			const date = new Date();
			if (await this.hasAccountWithEmail(input.email, connection)) throw new Error("Account already exists");
			if (this.isInvalidName(input.name)) throw new Error("Invalid name");
			if (this.isInvalidMail(input.email)) throw new Error("Invalid email");
			if (!this.CpfValidator.validate(input.cpf)) throw new Error("Invalid cpf");
			if (input.isDriver && this.isInvalidPlate(input.carPlate)) throw new Error("Invalid plate");
			await connection.query("insert into cccat13.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver, date, is_verified, verification_code) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)", [accountId, input.name, input.email, input.cpf, input.carPlate, !!input.isPassenger, !!input.isDriver, date, false, verificationCode]);
			await this.sendEmail(input.email, "Verification", `Please verify your code at first login ${verificationCode}`);
			return {
				accountId
			}
		} finally {
			await connection.$pool.end();
		}
	}

	async getAccount (accountId: string, externalConnection?: pgp.IDatabase<{}, pg.IClient>) {
		const connection = externalConnection ?? pgp()("postgres://postgres:pass123@localhost:5432/app");
		const [account] = await connection.query("select * from cccat13.account where account_id = $1", [accountId]);
		!externalConnection && await connection.$pool.end();
		return account;
	}

	isInvalidName (name: string) {
		return !name.match(/[a-zA-Z] [a-zA-Z]+/);
	}

	isInvalidMail (email: string) {
		return !email.match(/^(.+)@(.+)$/);
	}

	async hasAccountWithEmail (email: string, connection: pgp.IDatabase<{}, pg.IClient>) {
		const [account] = await connection.query("select * from cccat13.account where email = $1", [email]);
		return !!account;
	}

	isInvalidPlate (carPlate: string) {
		return !carPlate.match(/[A-Z]{3}[0-9]{4}/)
	}

	async sendEmail (email: string, subject: string, message: string) {
		console.log(email, subject, message);
	}
}
