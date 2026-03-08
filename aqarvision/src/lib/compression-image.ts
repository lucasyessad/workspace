/** Compression d'images côté client avant upload
 * Optimisé pour les connexions 3G/4G algériennes
 */

/** Options de compression */
interface OptionsCompression {
  /** Largeur maximale en pixels (défaut: 1200) */
  maxLargeur?: number;
  /** Hauteur maximale en pixels (défaut: 1200) */
  maxHauteur?: number;
  /** Qualité JPEG 0-1 (défaut: 0.8) */
  qualite?: number;
  /** Taille maximale en octets (défaut: 500 Ko) */
  tailleMaxOctets?: number;
}

const OPTIONS_DEFAUT: Required<OptionsCompression> = {
  maxLargeur: 1200,
  maxHauteur: 1200,
  qualite: 0.8,
  tailleMaxOctets: 500 * 1024, // 500 Ko
};

/** Compresser une image File et retourner un nouveau File compressé */
export async function compresserImage(
  fichier: File,
  options: OptionsCompression = {}
): Promise<File> {
  const opts = { ...OPTIONS_DEFAUT, ...options };

  // Si le fichier est déjà petit, pas besoin de compresser
  if (fichier.size <= opts.tailleMaxOctets) {
    return fichier;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(fichier);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculer les nouvelles dimensions en gardant le ratio
      let { width, height } = img;
      if (width > opts.maxLargeur) {
        height = Math.round((height * opts.maxLargeur) / width);
        width = opts.maxLargeur;
      }
      if (height > opts.maxHauteur) {
        width = Math.round((width * opts.maxHauteur) / height);
        height = opts.maxHauteur;
      }

      // Dessiner sur un canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Impossible de créer le contexte canvas"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convertir en Blob compressé
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Échec de la compression"));
            return;
          }

          // Créer un nouveau File avec le même nom
          const fichierCompresse = new File(
            [blob],
            fichier.name.replace(/\.\w+$/, ".jpg"),
            { type: "image/jpeg", lastModified: Date.now() }
          );

          resolve(fichierCompresse);
        },
        "image/jpeg",
        opts.qualite
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Impossible de charger l'image"));
    };

    img.src = url;
  });
}

/** Compresser plusieurs images en parallèle */
export async function compresserImages(
  fichiers: File[],
  options: OptionsCompression = {}
): Promise<File[]> {
  return Promise.all(
    fichiers.map((fichier) => compresserImage(fichier, options))
  );
}

/** Générer une miniature (pour l'aperçu rapide) */
export async function genererMiniature(
  fichier: File,
  taille: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(fichier);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement("canvas");
      let { width, height } = img;

      // Crop carré au centre
      const min = Math.min(width, height);
      const sx = (width - min) / 2;
      const sy = (height - min) / 2;

      canvas.width = taille;
      canvas.height = taille;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Impossible de créer le contexte canvas"));
        return;
      }

      ctx.drawImage(img, sx, sy, min, min, 0, 0, taille, taille);
      resolve(canvas.toDataURL("image/jpeg", 0.6));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Impossible de charger l'image"));
    };

    img.src = url;
  });
}

/** Formater la taille du fichier pour l'affichage */
export function formaterTailleFichier(octets: number): string {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
}
