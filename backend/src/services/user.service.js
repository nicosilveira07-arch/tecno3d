import bcrypt from "bcrypt";

import {
  getAllUsers,
  findByEmail,
  createUser,
  findById,
  updateUserRole,
  deleteEmployeeById,
  deleteUserById,
} from "../repositories/user.repository.js";

const ALLOWED_ROLES = [
  "ADMIN",
  "EMPLOYEE",
  "CUSTOMER",
];

const getAllUsersService = async ({
  page = 1,
  limit = 20,
  search = "",
  role,
} = {}) => {
  return await getAllUsers({
    page,
    limit,
    search,
    role,
  });
};

const createUserService = async (data, adminId) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    role = "CUSTOMER",
  } = data;

  if (!ALLOWED_ROLES.includes(role)) {
    throw new Error("Rol de usuario inválido.");
  }

  const existingUser = await findByEmail(email);

  if (existingUser) {
    throw new Error(
      "Ya existe un usuario con ese email."
    );
  }

  const hashedPassword = await bcrypt.hash(
    password,
    10
  );

  return await createUser({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phone,
    role,
    ...(role === "EMPLOYEE" && adminId
      ? {
          createdBy: {
            connect: {
              id: adminId,
            },
          },
        }
      : {}),
  });
};

const updateUserRoleService = async (
  id,
  role
) => {
  if (!ALLOWED_ROLES.includes(role)) {
    throw new Error("Rol de usuario inválido.");
  }

  const user = await findById(id);

  if (!user) {
    throw new Error(
      "Usuario no encontrado."
    );
  }

  return await updateUserRole(
    id,
    role
  );
};

const deleteEmployeeService = async (
  employeeId,
  adminId
) => {
  const deletedEmployee =
    await deleteEmployeeById(
      employeeId,
      adminId
    );

  if (!deletedEmployee) {
    throw new Error(
      "No tienes permiso para eliminar este usuario."
    );
  }

  return deletedEmployee;
};

const deleteUserService = async (userId) => {
  const user = await findById(userId);

  if (!user) {
    throw new Error(
      "Usuario no encontrado."
    );
  }

  return await deleteUserById(userId);
};

export {
  getAllUsersService,
  createUserService,
  updateUserRoleService,
  deleteEmployeeService,
  deleteUserService,
};

