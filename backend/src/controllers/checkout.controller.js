import {
  getCheckoutService,
  confirmCheckoutService,
} from "../services/checkout.service.js";


export async function getCheckoutController(req, res) {
  try {
    const { addressId } = req.query;

    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "La dirección es obligatoria.",
      });
    }

    const checkout = await getCheckoutService(
      req.user.id,
      addressId
    );

    return res.json({
      success: true,
      data: checkout,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}



export async function confirmCheckoutController(req, res) {
  try {
    const { addressId } = req.body;

    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "La dirección es obligatoria.",
      });
    }


    const order = await confirmCheckoutService(
      req.user.id,
      addressId
    );


    return res.status(201).json({
      success: true,
      message: "Pedido creado correctamente.",
      data: order,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}