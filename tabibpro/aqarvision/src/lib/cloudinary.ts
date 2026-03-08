import { v2 as cloudinary } from "cloudinary";

/** Configuration Cloudinary côté serveur */
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/** Options de transformation pour les images immobilières */
export const TRANSFORMATIONS = {
  /** Photo principale de l'annonce (grande) */
  listing_main: {
    width: 1200,
    height: 800,
    crop: "fill" as const,
    quality: "auto" as const,
    format: "webp" as const,
  },
  /** Miniature pour les listes */
  listing_thumb: {
    width: 400,
    height: 300,
    crop: "fill" as const,
    quality: "auto:low" as const,
    format: "webp" as const,
  },
  /** Logo de l'agence */
  agency_logo: {
    width: 200,
    height: 200,
    crop: "fill" as const,
    quality: "auto" as const,
    format: "webp" as const,
  },
  /** Image Open Graph pour le partage */
  og_image: {
    width: 1200,
    height: 630,
    crop: "fill" as const,
    quality: "auto" as const,
    format: "jpg" as const,
  },
} as const;

/** Générer une URL Cloudinary optimisée */
export function cloudinaryUrl(
  publicId: string,
  transformation: keyof typeof TRANSFORMATIONS
): string {
  const t = TRANSFORMATIONS[transformation];
  return cloudinary.url(publicId, {
    transformation: [t],
    secure: true,
  });
}

/** Upload une image vers Cloudinary depuis un buffer */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder: string;
    publicId?: string;
    transformation?: keyof typeof TRANSFORMATIONS;
  }
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `aqarvision/${options.folder}`,
          public_id: options.publicId,
          resource_type: "image",
          overwrite: true,
          transformation: options.transformation
            ? TRANSFORMATIONS[options.transformation]
            : undefined,
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Upload échoué"));
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
          });
        }
      )
      .end(buffer);
  });
}

/** Supprimer une image de Cloudinary */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
