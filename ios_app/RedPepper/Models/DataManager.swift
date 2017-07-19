//
//  DataManager.swift
//  RedPepper
//
//  Created by An Phan on 10/21/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import Foundation

class DataManager {
    static let sharedInstance = DataManager()
    
    /// Current user
    var currentUser: User?
    
    /// List of current recipes
    var recipes = [Recipe]()
    
    func logoutUser() {
        recipes.removeAll()
        currentUser = nil
    }
}
