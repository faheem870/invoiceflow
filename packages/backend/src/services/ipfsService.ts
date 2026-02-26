import { createHash } from 'crypto';
import { env } from '../config/env';

// ---- Types ----

export interface UploadResult {
  hash: string;
  url: string;
  filename: string;
  size: number;
}

// ---- Service class ----

export class IpfsService {
  private gatewayUrl: string;

  constructor() {
    // Use the configured Pinata gateway or fall back to the public IPFS gateway
    this.gatewayUrl = env.PINATA_GATEWAY_URL ?? 'https://gateway.pinata.cloud/ipfs';
  }

  /**
   * Upload a file buffer to IPFS.
   *
   * Current implementation: generates a mock IPFS CIDv1-style hash from
   * the SHA-256 digest of the file content. This is deterministic and
   * suitable for development/testing.
   *
   * In production, this method would use the Pinata SDK:
   *   const pinata = new PinataSDK({ pinataJwt: env.PINATA_JWT });
   *   const result = await pinata.pinFileToIPFS(readableStream, { pinataMetadata: { name: filename } });
   *   return { hash: result.IpfsHash, url: this.getIPFSUrl(result.IpfsHash), ... };
   */
  async uploadToIPFS(fileBuffer: Buffer, filename: string): Promise<UploadResult> {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('File buffer is empty');
    }

    // If the Pinata JWT is configured, attempt a real upload via the Pinata API
    if (env.PINATA_JWT) {
      return this.uploadViaPinata(fileBuffer, filename);
    }

    // Mock implementation: derive a deterministic hash from content
    const sha256 = createHash('sha256').update(fileBuffer).digest('hex');

    // Create a CIDv1-style mock hash (bafkreiXXX...) by encoding hex as base32-ish
    // This is NOT a real CID but looks realistic enough for dev/testing.
    const mockHash = `bafkrei${sha256.slice(0, 52)}`;

    return {
      hash: mockHash,
      url: this.getIPFSUrl(mockHash),
      filename,
      size: fileBuffer.length,
    };
  }

  /**
   * Get the gateway URL for a given IPFS hash.
   */
  getIPFSUrl(hash: string): string {
    if (!hash) {
      throw new Error('IPFS hash is required');
    }

    // Normalise: strip any ipfs:// prefix or leading slash
    const cleanHash = hash.replace(/^ipfs:\/\//, '').replace(/^\//, '');

    return `${this.gatewayUrl}/${cleanHash}`;
  }

  /**
   * Upload to Pinata via their HTTPS API (no SDK dependency required).
   * Uses the /pinning/pinFileToIPFS endpoint.
   */
  private async uploadViaPinata(fileBuffer: Buffer, filename: string): Promise<UploadResult> {
    try {
      // Build a multipart/form-data body manually using the native FormData-
      // compatible Blob/File that Node 18+ provides.
      const blob = new Blob([new Uint8Array(fileBuffer)], { type: 'application/octet-stream' });

      const formData = new FormData();
      formData.append('file', blob, filename);

      const metadata = JSON.stringify({ name: filename });
      formData.append('pinataMetadata', metadata);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.PINATA_JWT}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata upload failed (${response.status}): ${errorText}`);
      }

      const result = (await response.json()) as { IpfsHash: string; PinSize: number };

      return {
        hash: result.IpfsHash,
        url: this.getIPFSUrl(result.IpfsHash),
        filename,
        size: result.PinSize,
      };
    } catch (error) {
      console.error('[IpfsService] Pinata upload error:', error);
      throw error;
    }
  }
}
