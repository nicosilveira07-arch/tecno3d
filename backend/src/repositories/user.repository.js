import prisma from "../lib/prisma.js";



export async function findByEmail(email) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}



export async function createUser(data) {
  return prisma.user.create({
    data,
  });
}



export async function findById(id) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}



export async function getAllUsers({
  page = 1,
  limit = 20,
  search = "",
  role,
} = {}) {

  const skip = (page - 1) * limit;

  const where = {};



  if (search) {
    where.OR = [
      {
        firstName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        lastName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }



  if (role) {
    where.role = role;
  }



  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    prisma.user.count({
      where,
    }),
  ]);



  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}



export async function updateUserRole(id, role) {
  return prisma.user.update({
    where: {
      id,
    },
    data: {
      role,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateUserPassword(id, password) {
  return prisma.user.update({
    where: {
      id,
    },
    data: {
      password,
    },
  });
}
