//
//  AppState.swift

import Foundation
import UIKit

struct AppState {

    static func clearSessionUser() {
        UserAuth.lastEmail = nil
        UserAuth.authToken = nil
        UserAuth.lastUserId = nil
        UserAuth.lastUserName = nil
    }
    
    // Authentication
    struct UserAuth {
        static var defaults: UserDefaults! {
            return UserDefaults.standard
        }
        
        static let firstLaunchKey: String   = "AppState.UserAuth.firstLaunch"
        static let authTokenKey: String     = "AppState.UserAuth.authToken"
        static let lastEmailKey: String     = "AppState.UserAuth.lastEmail"
        static let lastUserIdKey: String    = "AppState.UserAuth.lastUserId"
        static let lastUserNameKey: String  = "AppState.UserAuth.lastUserName"
        
        static var isAuthenticated: Bool {
            return authToken?.isEmpty == false
        }
        
        // Current session user token
        static var authToken: String? {
            get {
                return defaults.object(forKey: authTokenKey) as! String?
            }
            set {
                if (newValue == nil) {
                    defaults.removeObject(forKey: authTokenKey)
                } else {
                    defaults.set(newValue, forKey: authTokenKey)
                }
                defaults.synchronize()
            }
        }
        
        // Current session user email
        static var lastEmail: String? {
            get {
            return defaults.object(forKey: lastEmailKey) as! String?
            }
            set {
                if (newValue == nil) {
                    defaults.removeObject(forKey: lastEmailKey)
                } else {
                    defaults.set(newValue, forKey: lastEmailKey)
                }
                defaults.synchronize()
            }
        }
        
        // Current session user id
        static var lastUserId: String? {
            get {
            return defaults.object(forKey: lastUserIdKey) as! String?
            }
            set {
                if (newValue == nil) {
                    defaults.removeObject(forKey: lastUserIdKey)
                } else {
                    defaults.set(newValue!, forKey: lastUserIdKey)
                }
                
                defaults.synchronize()
            }
        }
        
        // Current session user name
        static var lastUserName: String? {
            get {
                return defaults.object(forKey: lastUserNameKey) as! String?
            }
            set {
                if (newValue == nil) {
                    defaults.removeObject(forKey: lastUserNameKey)
                } else {
                    defaults.set(newValue, forKey: lastUserNameKey)
                }
                defaults.synchronize()
            }
        }
    }
    
    // Configs to showing the home page
    static func setHome() {
        let homeViewController = Storyboard.storyboard.instantiateViewController(withIdentifier: Storyboard.Identifiers.rootViewController)
        let applicationFrame = UIScreen.main.bounds
        let window = UIWindow(frame: applicationFrame)
        window.rootViewController = homeViewController
        window.makeKeyAndVisible()
        appDelegate.window = window
    }
    
    // Configs to showing the sign-in page
    static func setSignIn() {
        let signInVC = Storyboard.storyboard.instantiateViewController(withIdentifier: Storyboard.Identifiers.signInViewController)
        let applicationFrame = UIScreen.main.bounds
        let window = UIWindow(frame: applicationFrame)
        window.rootViewController = signInVC
        window.makeKeyAndVisible()
        appDelegate.window = window
    }
}

