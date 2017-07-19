//
//  UIColorExtension.swift

/**
* Custom category of UIColor to load the custom colors according to the selected themes.
*/

import UIKit

extension UIColor {
    
    convenience init(hexString: String) {
        let hex = hexString.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int = UInt32()
        Scanner(string: hex).scanHexInt32(&int)
        let a, r, g, b: UInt32
        switch hex.characters.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(red: CGFloat(r) / 255, green: CGFloat(g) / 255, blue: CGFloat(b) / 255, alpha: CGFloat(a) / 255)
    }
    
    /// useful macros
    class func rgbColor(red r: Float, green g: Float, blue b: Float) -> UIColor {
        return UIColor(red: CGFloat(r/255.0), green: CGFloat(g/255.0), blue: CGFloat(b/255.0), alpha: 1.0)
    }
    
    class func rgbaColor(red r: Float, green g: Float, blue b: Float, alpha a: CGFloat) -> UIColor {
        return UIColor(red: CGFloat(r/255.0), green: CGFloat(g/255.0), blue: CGFloat(b/255.0), alpha: a)
    }
    
    /**
    * Main color of the application
    * @return UIColor color to use
    */
    class func mainColor() -> UIColor {
        return UIColor.rgbColor(red: 111.0, green: 214.0, blue: 167.0)
    }
    
    // MARK - Class colors
    /**
    * Color for the class of kettlebell
    * @return UIColor color to use
    */
    class func kettlebellBackgroundColor() -> UIColor {
        return UIColor.rgbColor(red: 224.0, green: 90.0, blue: 62.0)
    }
    
    /**
    * Color for the class of lifter
    * @return UIColor color to use
    */
    class func lifterBackgroundColor() -> UIColor {
        return UIColor.rgbColor(red: 94.0, green: 200.0, blue: 231.0)
    }
}
