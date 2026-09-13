import ImageKit from 'imagekit';
import { env } from '../config/env';

/**
 * ImageKit client instance for server-side image uploads.
 *
 * Used for:
 * - Uploading item images (lost/found reports)
 * - Uploading claim proof images
 */
export const imagekit = new ImageKit({
  publicKey: env.IMAGEKIT_PUBLIC_KEY,
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
});
