//
//  UIFontExtension.swift

/**
* Custom category of UIFont to load the custom fonts according to texts.
*/

import UIKit

extension UIFont {
    
    /// useful macros
    
    class func openSansRegular(size s: CGFloat) -> UIFont {
        return UIFont(name: "OpenSans", size: s)!
    }
    
    class func openSansBold(size s: CGFloat) -> UIFont {
        return UIFont(name: "OpenSans-Bold", size: s)!
    }
    
    class func raleWayRegular(size s: CGFloat) -> UIFont {
        return UIFont(name: "Raleway", size: s)!
    }
    
    class func raleWayBold(size s: CGFloat) -> UIFont {
        return UIFont(name: "Raleway-Bold", size: s)!
    }
    
    class func raleWaySemiBold(size s: CGFloat) -> UIFont {
        return UIFont(name: "Raleway-SemiBold", size: s)!
    }
}
