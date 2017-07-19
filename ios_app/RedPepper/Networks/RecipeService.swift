//
//  RecipeService.swift
//  RedPepper
//
//  Created by An Phan on 10/18/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import Foundation

typealias RecipeCompletionHandler = (_ recipeResponse: RecipeResponse?, _ error: NSError?) -> Void

class RecipeService: BaseService {
    static let sharedInstance = RecipeService()
    
    struct EndPoints {
        static let getRecipes  = "kitchen-board"
        static let updateRecipe = "kitchen-board?recipe_url="
    }
    
    // Get list of user titles
    
    func getRecipesWithCompletionHandler(completionHandler: @escaping RecipeCompletionHandler) {
        _ = GET(EndPoints.getRecipes, params: nil).responseSwiftyJSON { (json, error) in
            if let json = json {
                debugPrint("json: \(json)")
                let response = RecipeResponse(json: json)
                DataManager.sharedInstance.recipes = response.recipes
                
                completionHandler(response, nil)
            }
            else {
                // Failed
                debugPrint("error: \(error)")
                completionHandler(nil, error)
            }
        }
    }
    
    // Add new recipe
    
    func addRecipeWithUrl(recipeUrl: String, completionHandler: @escaping RecipeCompletionHandler) {
        let endPoint = EndPoints.updateRecipe + recipeUrl
        let escapedEndPoint = endPoint.addingPercentEncoding(withAllowedCharacters:NSCharacterSet.urlQueryAllowed) ?? ""
        //do something with escaped string
        _ = POST(escapedEndPoint, params: nil).responseSwiftyJSON { (json, error) in
            if let json = json {
                debugPrint("json: \(json)")
                let response = RecipeResponse(json: json)
                
                if json["found"].stringValue == "yes" {
                    completionHandler(response, nil)
                }
                else {
                    completionHandler(nil, NSError(domain: Domain.ErrorDomain, code: -1000, userInfo: nil))
                }
            }
            else {
                // Failed
                debugPrint("error: \(error)")
                completionHandler(nil, error)
            }
        }
    }
    
    // Delete a recipe
    
    func deleteRecipeWithUrl(recipeUrl: String, completionHandler: @escaping RecipeCompletionHandler) {
        
        let endPoint = EndPoints.updateRecipe + recipeUrl
        _ = DELETE(endPoint, params: nil).responseSwiftyJSON { (json, error) in
            if let json = json {
                debugPrint("json: \(json)")
                let response = RecipeResponse(json: json)
                
                if json["removed"].stringValue == "yes" {
                    for (index, recipe) in DataManager.sharedInstance.recipes.enumerated() {
                        if recipe.url == recipeUrl {
                            DataManager.sharedInstance.recipes.remove(at: index)
                        }
                    }
                    completionHandler(response, nil)
                }
                else {
                    completionHandler(nil, NSError(domain: Domain.ErrorDomain, code: -1000, userInfo: nil))
                }
            }
            else {
                // Failed
                debugPrint("error: \(error)")
                completionHandler(nil, error)
            }
        }
    }
    
    // Moving recipe to the top of the list.
    
    func makeTopRecipeWithUrl(recipeUrl: String, completionHandler: @escaping RecipeCompletionHandler) {
        
        let endPoint = EndPoints.updateRecipe + recipeUrl
        _ = PUT(endPoint, params: nil).responseSwiftyJSON { (json, error) in
            if let json = json {
                debugPrint("json: \(json)")
                let response = RecipeResponse(json: json)
                
                if json["result"].stringValue == "success" {
                    DataManager.sharedInstance.recipes = response.recipes
                    completionHandler(response, nil)
                }
                else {
                    completionHandler(nil, NSError(domain: Domain.ErrorDomain,
                                                   code: -1000, userInfo: nil))
                }
            }
            else {
                // Failed
                debugPrint("error: \(error)")
                completionHandler(nil, error)
            }
        }
    }
}
