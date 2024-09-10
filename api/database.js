import { sql } from "@vercel/postgres";

async function createUsersTable() {
    try {
        await sql`
        CREATE TABLE IF NOT EXISTS "users" (
            "id" SERIAL PRIMARY KEY,
            "username" VARCHAR(255) UNIQUE NOT NULL,
            "email" VARCHAR(255) UNIQUE NOT NULL,
            "password" VARCHAR(255) NOT NULL,
            verified BOOLEAN DEFAULT FALSE NOT NULL,
            "verificationToken" VARCHAR(255),
            "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`;

        console.log("Users table created successfully");
    } catch (error) {
        console.error("Error when creating users table: ", error);
    }
}

module.exports = createUsersTable;
