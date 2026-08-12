import {
  findAllByUser,
  findById,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../repositories/address.repository.js";


export async function getUserAddressesService(userId) {
  return await findAllByUser(userId);
}


export async function getAddressByIdService(id) {
  const address = await findById(id);

  if (!address) {
    throw new Error("Dirección no encontrada.");
  }

  return address;
}


export async function createAddressService(userId, data) {
  if (data.isDefault) {
    await updateDefaultAddresses(userId);
  }

  return await createAddress({
    ...data,
    userId,
  });
}


export async function updateAddressService(id, userId, data) {
  const address = await getAddressByIdService(id);

  if (address.userId !== userId) {
    throw new Error("No tienes permiso para modificar esta dirección.");
  }

  if (data.isDefault) {
    await updateDefaultAddresses(userId);
  }

  return await updateAddress(id, data);
}


export async function deleteAddressService(id, userId) {
  const address = await getAddressByIdService(id);

  if (address.userId !== userId) {
    throw new Error("No tienes permiso para eliminar esta dirección.");
  }

  return await deleteAddress(id);
}


async function updateDefaultAddresses(userId) {
  const addresses = await findAllByUser(userId);

  for (const address of addresses) {
    if (address.isDefault) {
      await updateAddress(address.id, {
        isDefault: false,
      });
    }
  }
}