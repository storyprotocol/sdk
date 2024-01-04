import { AxiosInstance } from "axios";

import { handleError } from "./errors";

export class PlatformClient {
  protected readonly httpClient: AxiosInstance;

  constructor(httpClient: AxiosInstance) {
    this.httpClient = httpClient;
  }

  /**
   * Upload a file to Arweave.
   *
   * @param file - the file binary data to upload
   * @param mimeType - the mime type of the file
   * @returns the response object that contains the uri of the uploaded file
   */
  public async uploadFile(file: File | Buffer, mimeType: string): Promise<{ uri: string }> {
    try {
      // requst the s3 pre-signed url
      const preSignUrlResp = await this.httpClient.post("/platform/file-upload/request");
      const data = preSignUrlResp.data as { url: string; key: string };

      // upload the file to s3
      const uploadResp = await this.httpClient.put(data.url, file, {
        timeout: 0,
        headers: {
          "Content-Type": mimeType,
        },
      });
      if (uploadResp.status !== 200) {
        throw new Error(`Failed to upload file to s3. Status: ${uploadResp.status}`);
      }

      const confirmResp = await this.httpClient.post("/platform/file-upload/confirm", {
        key: data.key,
      });
      return confirmResp.data as { uri: string };
    } catch (error: unknown) {
      return handleError(error, "Failed to upload file");
    }
  }
}
