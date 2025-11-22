import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import VKProvider from 'next-auth/providers/vk';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    VKProvider({
      clientId: process.env.VK_CLIENT_ID || '',
      clientSecret: process.env.VK_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Если вход через OAuth (Google или VK)
      if (account?.provider === 'google' || account?.provider === 'vk') {
        try {
          // Создаем функцию для получения bcrypt (чтобы избежать проблем с импортом)
          const bcrypt = require('bcryptjs');
          
          // Ищем существующего пользователя
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { id: true, role: true, isActive: true },
          });

          if (existingUser) {
            // Проверяем, активен ли пользователь
            if (!existingUser.isActive) {
              return false; // Access denied
            }
            // Пользователь существует - привязываем роль к токену
            user.role = existingUser.role;
            user.id = existingUser.id;
          } else {
            // Создаем нового пользователя с случайным паролем
            const randomPassword = Math.random().toString(36).slice(-12);
            const hashedPassword = await bcrypt.hash(randomPassword, 12);
            
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || '',
                password: hashedPassword,
                role: 'user',
              },
            });
            user.role = newUser.role;
            user.id = newUser.id;
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

