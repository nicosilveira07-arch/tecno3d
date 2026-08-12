import api from "./api";



export async function getUsers({
  page = 1,
  limit = 20,
  search = "",
  role,
} = {}) {

  const response = await api.get("/users", {
    params: {
      page,
      limit,
      search,
      role,
    },
  });



  return response.data;
}



export async function createUser(data) {
  const response = await api.post(
    "/users",
    data
  );

  return response.data;
}



export async function updateUserRole(
  id,
  role
) {
  const response = await api.patch(
    `/users/${id}/role`,
    {
      role,
    }
  );

  return response.data;
}
