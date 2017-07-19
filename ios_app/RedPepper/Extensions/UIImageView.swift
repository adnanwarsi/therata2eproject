//
//  UIImageView.swift

import UIKit

extension UIImageView {
    
    // Rounded corner
    func roundify() {
        clipsToBounds = true
        layer.cornerRadius = frame.height / 2
    }
}
