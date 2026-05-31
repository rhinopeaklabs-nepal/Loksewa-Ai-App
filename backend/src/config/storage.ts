export interface StorageConfig {
  provider: "s3" | "local";
  s3?: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
  };
  local?: {
    storagePath: string;
    baseUrl: string;
  };
  publicBaseUrl: string;
}

export function getStorageConfig(): StorageConfig {
  const provider = (process.env.STORAGE_PROVIDER ?? "local") as "s3" | "local";

  if (provider === "s3") {
    return {
      provider: "s3",
      s3: {
        bucket: process.env.S3_BUCKET ?? "loksewa-ai",
        region: process.env.S3_REGION ?? "us-east-1",
        accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
        endpoint: process.env.S3_ENDPOINT
      },
      publicBaseUrl: process.env.STORAGE_PUBLIC_URL ?? ""
    };
  }

  return {
    provider: "local",
    local: {
      storagePath: process.env.LOCAL_STORAGE_PATH ?? "./storage",
      baseUrl: process.env.LOCAL_STORAGE_BASE_URL ?? "http://localhost:8000/files"
    },
    publicBaseUrl: process.env.LOCAL_STORAGE_BASE_URL ?? "http://localhost:8000/files"
  };
}

export const storageConfig = getStorageConfig();