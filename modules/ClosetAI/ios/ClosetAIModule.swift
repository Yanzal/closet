import ExpoModulesCore
import Vision
import CoreImage
import UIKit

#if canImport(FoundationModels)
import FoundationModels
#endif

/// On-device AI for Closet. Two capabilities, both private/offline:
///  - `liftSubject(uri)`  → Apple Vision foreground-instance mask → clean product shot on white.
///  - `generate(prompt)`  → Apple Foundation Models on-device text (stylist). "" when unavailable.
public class ClosetAIModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ClosetAI")

    AsyncFunction("liftSubject") { (uri: String) -> String in
      if #available(iOS 17.0, *) {
        return try ClosetAIModule.liftSubject(uri: uri)
      }
      return uri // older iOS: caller keeps the original photo
    }

    AsyncFunction("generate") { (prompt: String) async throws -> String in
      return try await ClosetAIModule.generate(prompt: prompt)
    }
  }

  // MARK: - Beautify (Vision)

  @available(iOS 17.0, *)
  private static func liftSubject(uri: String) throws -> String {
    let input = try loadImage(uri)

    let request = VNGenerateForegroundInstanceMaskRequest()
    let handler = VNImageRequestHandler(ciImage: input)
    try handler.perform([request])

    guard let result = request.results?.first else {
      // No subject detected — return the original so the user still gets their photo.
      return uri
    }

    let maskedPixels = try result.generateMaskedImage(
      ofInstances: result.allInstances,
      from: handler,
      croppedToInstancesExtent: true
    )

    // Composite the cut-out subject over white for a catalogue-style flat image.
    let subject = CIImage(cvPixelBuffer: maskedPixels)
    let white = CIImage(color: .white).cropped(to: subject.extent)
    let flat = subject.composited(over: white)

    let context = CIContext()
    guard let cgImage = context.createCGImage(flat, from: flat.extent) else {
      throw Exception(name: "BeautifyError", description: "Could not render the cleaned image.")
    }
    guard let jpeg = UIImage(cgImage: cgImage).jpegData(compressionQuality: 0.9) else {
      throw Exception(name: "BeautifyError", description: "Could not encode the cleaned image.")
    }

    let outURL = FileManager.default.temporaryDirectory
      .appendingPathComponent("beautified-\(UUID().uuidString).jpg")
    try jpeg.write(to: outURL)
    return outURL.absoluteString
  }

  /// Accepts a `data:` URL, a `file://` URL, or a bare file path.
  private static func loadImage(_ uri: String) throws -> CIImage {
    if uri.hasPrefix("data:") {
      guard let commaIndex = uri.firstIndex(of: ","),
            let data = Data(base64Encoded: String(uri[uri.index(after: commaIndex)...])),
            let image = CIImage(data: data) else {
        throw Exception(name: "BeautifyError", description: "Could not decode the image data URL.")
      }
      return image
    }

    let url = uri.hasPrefix("file://") ? (URL(string: uri) ?? URL(fileURLWithPath: uri))
                                       : URL(fileURLWithPath: uri)
    guard let image = CIImage(contentsOf: url) else {
      throw Exception(name: "BeautifyError", description: "Could not load the image at \(uri).")
    }
    return image
  }

  // MARK: - Stylist text (Foundation Models)

  private static func generate(prompt: String) async throws -> String {
    #if canImport(FoundationModels)
    if #available(iOS 26.0, *) {
      let model = SystemLanguageModel.default
      guard case .available = model.availability else {
        return "" // device/OS supports the API but the model isn't ready → caller falls back
      }
      let session = LanguageModelSession()
      let response = try await session.respond(to: prompt)
      return response.content
    }
    #endif
    return "" // no Foundation Models → caller uses heuristics
  }
}
