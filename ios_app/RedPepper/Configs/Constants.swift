//
//  Constants.swift

import UIKit

struct Messages {
    
    // Camera
    static let cameraTitle         = "Camera"
    static let cameraDescription   = "Choose an option!"
    static let cameraTakePhoto     = "Take a Photo"
    static let cameraRoll          = "Choose from Camera Roll"
    
    // Alert
    static let alertOk     = "Ok"
    static let alertCancel = "Cancel"
    static let errorTitle  = "We're sorry"
    static let appName     = "Red Pepper"
}

struct Notifications {
    static let reloadMenuNotification = "com.therata2eproject.redpepper.reloadMenuNotification"
}

struct Domain {
    static let ErrorDomain = "com.therata2eproject.redpepper.error"
}

struct ScreenSize {
    static let screenWidth        = UIScreen.main.bounds.size.width
    static let screenHeight       = UIScreen.main.bounds.size.height
    static let maxScreenLength    = max(ScreenSize.screenWidth, ScreenSize.screenHeight)
    static let minScreenLength    = min(ScreenSize.screenWidth, ScreenSize.screenHeight)
}

struct DeviceType {
    static let iphone4OrLess    = UIDevice.current.userInterfaceIdiom == .phone && ScreenSize.maxScreenLength < 568.0
    static let iphone5          = UIDevice.current.userInterfaceIdiom == .phone && ScreenSize.maxScreenLength == 568.0
    static let iphone6          = UIDevice.current.userInterfaceIdiom == .phone && ScreenSize.maxScreenLength == 667.0
    static let iphone6P         = UIDevice.current.userInterfaceIdiom == .phone && ScreenSize.maxScreenLength == 736.0
    static let iPad             = UIDevice.current.userInterfaceIdiom == .pad && ScreenSize.maxScreenLength == 1024.0
}
