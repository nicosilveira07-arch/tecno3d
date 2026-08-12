import cloudinary from "../lib/cloudinary.js";

const uploadImageController = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No se recibió ninguna imagen.",
      });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "tecno3d/products",
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(result);
          }
        );

        uploadStream.end(file.buffer);
      });

      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Imágenes subidas correctamente.",
      data: uploadedImages,
    });
  } catch (error) {
    next(error);
  }
};

export {
  uploadImageController,
};