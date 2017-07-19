//
//  UIButton.swift

import UIKit

extension UIButton {
    func activated(_ activated: Bool) {
        isEnabled = activated
        if activated == false {
            setTitleColor(UIColor.rgbColor(red: 246, green: 246, blue: 246),
                          for: .disabled)
            backgroundColor = UIColor.rgbColor(red: 208, green: 208, blue: 208)
        }
        else {
            setTitleColor(UIColor.white, for: UIControlState())
            backgroundColor = UIColor.rgbColor(red: 248, green: 152, blue: 47)
        }
    }
}
