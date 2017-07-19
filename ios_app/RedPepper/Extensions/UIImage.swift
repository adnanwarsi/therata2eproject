//
//  UIImage.swift

import UIKit

extension UIImage {
    func convertImagetoJPEGData() -> Data {
        return UIImageJPEGRepresentation(self, 0.7)!
    }
    
    func convertImagetoPNGData() -> Data {
        return UIImagePNGRepresentation(self)!
    }
}
