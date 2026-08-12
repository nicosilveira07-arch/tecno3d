import {
  getAllUsersService,
  createUserService,
  updateUserRoleService,
} from "../services/user.service.js";



const getAllUsersController = async (
  req,
  res,
  next
) => {
  try {

    const {
      page = 1,
      limit = 20,
      search = "",
      role,
    } = req.query;



    const users = await getAllUsersService({
      page: Number(page),
      limit: Number(limit),
      search: search.trim(),
      role,
    });



    res.json({
      success: true,
      data: users,
    });

  } catch (error) {
    next(error);
  }
};



const createUserController = async (
  req,
  res,
  next
) => {
  try {

    const user =
      await createUserService(req.body);



    res.status(201).json({
      success: true,
      message:
        "Usuario creado correctamente.",
      data: user,
    });

  } catch (error) {
    next(error);
  }
};



const updateUserRoleController = async (
  req,
  res,
  next
) => {
  try {

    const { role } = req.body;



    const user =
      await updateUserRoleService(
        req.params.id,
        role
      );



    res.json({
      success: true,
      message:
        "Rol actualizado correctamente.",
      data: user,
    });

  } catch (error) {
    next(error);
  }
};



export {
  getAllUsersController,
  createUserController,
  updateUserRoleController,
};

