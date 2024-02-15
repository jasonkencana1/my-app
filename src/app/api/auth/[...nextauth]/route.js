import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" },
                email: { label: "Email", type: "email" }
            },
            async authorize(credentials) {
                //Checking to see if there is an email and password
                if(!credentials.email || !credentials.password) {
                    return null;
                };

                //Checking to see if the user exists
                const user = await prisma.user.findUnique({ //Using prisma to look for the user within the existing database
                    where: {
                        email: credentials.email
                    }
                });

                //If the user does NOT exist
                if(!user) {
                    return null;
                }

                // Checking to see if the passwords match
                // Comparing the typed-in password to the existing hashedPassword
                const passwordsMatch = await bcrpyt.compare(credentials.password, user.hashedPassword);

                // If the passwords do NOT match
                if(!passwordsMatch) {
                    return null;
                }

                // Return user object IF everything is valid
                return user;
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }