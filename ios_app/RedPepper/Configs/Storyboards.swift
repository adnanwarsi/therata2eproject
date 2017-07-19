//
//  Storyboards.swift

import UIKit

struct Storyboard {
    static let name = "Main"
    
    struct Identifiers {
        static let rootViewController = "RootViewController"
        static let homeViewController = "HomeViewController"
        static let signInViewController = "SignInViewController"
        static let homeNavigationController = "HomeNavigationController"
        static let menuViewController = "MenuTableViewController"
        static let createRecipeNavController = "CreateRecipeNavigationController"
        static let tutorialNavController = "TutorialNavController"
        static let feedbackNavController = "FeedbackNavController"
        static let faqNavController = "FAQNavController"
        static let accountNavController = "AccountNavController"
        static let walkThroughNavController = "WalkThroughNavController"
        static let faqViewController = "FAQViewController"
    }
    
    static var storyboard: UIStoryboard {
        get {
            return UIStoryboard(name: name, bundle: nil)
        }
    }
    
    struct SegueID {
        static let presentThankVC    = "presentThankVC"
    }
}
