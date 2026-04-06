import { AbstractFileProviderService, MedusaError } from "@medusajs/framework/utils"
import { v2 as cloudinary } from "cloudinary"
import { Readable, Writable } from "node:stream"
import { v4 as uuidv4 } from "uuid"

type CloudinaryProviderOptions = {
  apiKey?: string
  apiSecret?: string
  cloudName?: string
  folderName?: string
  secure?: boolean
}

/**
 * Cloudinary file provider for Medusa File Module.
 *
 * Note: Medusa passes `content` as a base64-encoded string. The upstream plugin we had
 * in `node_modules` decoded it as "binary", corrupting uploads. This provider decodes
 * base64 properly.
 */
class CloudinaryFileProviderService extends AbstractFileProviderService {
  static identifier = "cloudinary"

  protected readonly options_: CloudinaryProviderOptions

  constructor(
    // Medusa injects common deps like logger.
    // We don't currently need logger, but keep signature compatible.
    _deps: { logger?: any },
    options: CloudinaryProviderOptions
  ) {
    super()
    this.options_ = options

    cloudinary.config({
      cloud_name: options.cloudName,
      api_key: options.apiKey,
      api_secret: options.apiSecret,
      secure: options.secure ?? true,
    })
  }

  static validateOptions(options: CloudinaryProviderOptions) {
    if (!options.apiKey || !options.apiSecret || !options.cloudName) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET / CLOUDINARY_CLOUD_NAME are required to use the Cloudinary file provider."
      )
    }
  }

  async upload(file: { filename: string; mimeType: string; content: string }) {
    const publicId = this.generatePublicId(file.filename)

    // Medusa gives base64 content without `data:` prefix.
    const buffer = Buffer.from(file.content, "base64")

    return await new Promise<{ url: string; key: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          public_id: publicId,
          folder: this.options_?.folderName || undefined,
        },
        (error, result) => {
          if (error) return reject(error)
          if (!result?.secure_url || !result?.public_id) {
            return reject(new Error("No result returned from Cloudinary upload."))
          }

          resolve({
            url: result.secure_url,
            key: result.public_id,
          })
        }
      )

      Readable.from(buffer).pipe(uploadStream)
    })
  }

  async delete(file: { fileKey: string } | { fileKey: string }[]) {
    const files = Array.isArray(file) ? file : [file]
    for (const f of files) {
      if (!f.fileKey) continue
      await cloudinary.uploader.destroy(f.fileKey, { resource_type: "raw" }).catch(() =>
        cloudinary.uploader.destroy(f.fileKey, { resource_type: "image" })
      )
    }
  }

  async getAsBuffer(file: { fileKey: string }) {
    const url = cloudinary.url(file.fileKey, { secure: true })
    const response = await fetch(url)
    return Buffer.from(await response.arrayBuffer())
  }

  async getDownloadStream(file: { fileKey: string }) {
    const url = cloudinary.url(file.fileKey, { secure: true })
    const response = await fetch(url)
    return Readable.fromWeb(response.body as any)
  }

  async getPresignedDownloadUrl(file: { fileKey: string }) {
    return cloudinary.url(file.fileKey, { secure: true })
  }

  async getUploadStream(fileData: { filename: string; mimeType: string }): Promise<{
    writeStream: Writable
    promise: Promise<{ url: string; key: string }>
    url: string
    fileKey: string
  }> {
    const publicId = this.generatePublicId(fileData.filename)
    const folder = this.options_?.folderName || undefined
    const fileKey = folder ? `${folder}/${publicId}` : publicId

    // CSV exports and other non-image files should use resource_type "raw"
    const resourceType = fileData.mimeType?.startsWith("image/") ? "image" : "raw"

    let resolveUpload!: (result: { url: string; key: string }) => void
    let rejectUpload!: (err: Error) => void

    const promise = new Promise<{ url: string; key: string }>((resolve, reject) => {
      resolveUpload = resolve
      rejectUpload = reject
    })

    const writeStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType as any,
        public_id: publicId,
        folder,
      },
      (error, result) => {
        if (error) return rejectUpload(new Error(error.message))
        if (!result?.secure_url || !result?.public_id) {
          return rejectUpload(new Error("No result returned from Cloudinary upload."))
        }
        resolveUpload({ url: result.secure_url, key: result.public_id })
      }
    )

    // Construct the expected URL ahead of time so callers can reference it immediately
    const url = cloudinary.url(fileKey, {
      resource_type: resourceType as any,
      secure: true,
    })

    return { writeStream, promise, url, fileKey }
  }

  protected cleanFilename(filename: string) {
    return filename
      .replace(/[^a-zA-Z0-9.\-_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toLowerCase()
  }

  protected generatePublicId(filename: string) {
    const cleaned = this.cleanFilename(filename)
    const unique = uuidv4()
    return `${unique}_${cleaned}`
  }
}

export default CloudinaryFileProviderService

