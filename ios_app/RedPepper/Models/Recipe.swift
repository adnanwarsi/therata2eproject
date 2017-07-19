//
//  Recipe.swift
//  RedPepper
//
//  Created by An Phan on 10/18/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import Foundation
import SwiftyJSON

class Recipe {
    var reviewCount = 0
    var desc = ""
    var ratingScale = 0
    var aggregateRating = 0.0
    var image = ""
    var author = ""
    var url = ""
    var timestamp: Date?
    var cookingTime = ""
    var name = ""
    var source = ""
    
    required init(json: JSON) {
        reviewCount         = json["reviewCount"].intValue
        desc                = json["description"].stringValue
        ratingScale         = json["rating_scale"].intValue
        image               = json["image"].stringValue
        aggregateRating     = json["aggregateRating"].doubleValue
        url                 = json["url"].stringValue
        timestamp           = json["timestamp"].stringValue.toDateTime()
        cookingTime         = json["cookingtime"].stringValue
        name                = json["name"].stringValue
        source              = json["source"].stringValue
    }
}

class RecipeResponse: BaseResponse {
    var recipes = [Recipe]()
    var recipe: Recipe?
    
    required init(json: JSON) {
        super.init(json: json)
        
        if let feedsJSON = json["recipes"].array {
            for feedJSON in feedsJSON {
                recipes.append(Recipe(json: feedJSON))
            }
        }
        else {
            recipe = Recipe(json: json["recipe"])
        }
    }
}
