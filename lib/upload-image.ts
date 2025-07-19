import { cloudinary } from './cloudinary';

// Define proper types for Cloudinary response
interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  version: number;
  format: string;
  // Add other properties you might need
}

interface CloudinaryError {
  message: string;
  http_code?: number;
}

export async function uploadImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      (error: CloudinaryError | undefined, result: CloudinaryUploadResult | undefined) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Upload failed: No result returned'));
        }
      }
    );

    file.arrayBuffer().then((buffer) => {
      upload.end(Buffer.from(buffer));
    }).catch((bufferError) => {
      reject(bufferError);
    });
  });
}