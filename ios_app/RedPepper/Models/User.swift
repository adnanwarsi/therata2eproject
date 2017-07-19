//
//  User.swift
//  RedPepper
//
//  Created by An Phan on 10/26/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import Foundation
import SwiftyJSON

class User {
    var email = ""
    var name = ""
    var gender = ""
    var householdSize = ""
    var employmentStatus = ""
    var cookingSkills = ""
    var alexaUserID = ""
    var age = ""
    
    required init(json: JSON) {
        email           = json["email"].stringValue
        name            = json["name"].stringValue
        gender          = json["gender"].stringValue
        householdSize    = json["household_size"].stringValue
        employmentStatus = json["employment_status"].stringValue
        cookingSkills    = json["cooking_skills"].stringValue
        alexaUserID     = json["AlexaUserID"].stringValue
        age            = json["age"].stringValue
    }
}

class UserResponse: BaseResponse {
    var user: User?
    
    required init(json: JSON) {
        super.init(json: json)
        user = User(json: json["user_info"])
    }
}
