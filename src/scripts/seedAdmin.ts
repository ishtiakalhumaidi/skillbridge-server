import { prisma } from "../lib/prisma";
import { UserRole } from "../middleware/auth";

async function seedAdmin() {
  try {
    console.log("*********** Admin seeding started.... ********");

    const adminData = {
      name: "Mr. Admin",
      email: "admin@skillbridge.com",
      password: "admin1234",
    };

    console.log("*********** Checking if admin exists ********");
    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminData.email,
      },
    });

    if (existingUser) {
      console.log(" Admin already exists! Skipping.");
      return;
    }

    console.log("*********** Calling signup API ********");
    const signUpAdmin = await fetch(
      `http://localhost:5000/api/auth/sign-up/email`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Origin: `${process.env.APP_URL}`,
        },
        body: JSON.stringify(adminData),
      },
    );

    if (signUpAdmin.ok) {
      console.log("*********** Admin created via API ********");

      await prisma.user.update({
        where: {
          email: adminData.email,
        },
        data: {
          emailVerified: true,
          role: UserRole.ADMIN,
        },
      });
      console.log("*********** Email verified & Admin Role assigned ********");
    } else {
      const errorResponse = await signUpAdmin.json();
      console.error(" Failed to create admin via API:", errorResponse);
      return;
    }

    console.log("*********** Success ********");
  } catch (error) {
    console.error(" Seeding Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
