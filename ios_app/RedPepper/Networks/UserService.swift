//
//  UserService.swift
//  RedPepper
//
//  Created by An Phan on 10/26/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import Foundation
import Alamofire

typealias UserCompletionHandler = (_ userResponse: UserResponse?, _ error: NSError?) -> Void

class UserService: BaseService {
    static let sharedInstance = UserService()
    
    struct EndPoints {
        static let getUser  = "user/"
        static let feedback = "feedback/"
    }
    
    // Get user
    func getUserWithCompletionHandler(completionHandler: @escaping UserCompletionHandler) {
        _ = GET(EndPoints.getUser, params: nil).responseSwiftyJSON { (json, error) in
            if let json = json {
                debugPrint("json: \(json)")
                let userResp = UserResponse(json: json)
                DataManager.sharedInstance.currentUser = userResp.user
                if let name = userResp.user?.name {
                    AppState.UserAuth.lastUserName = name
                }
                
                completionHandler(userResp, nil)
            }
            else {
                // Failed
                debugPrint("error: \(error)")
                completionHandler(nil, error)
            }
        }
    }
    
    // Update user info
    func updateUserName(name: String?, email: String?, age: String?, gender: String?, householdSize: String?, empStatus: String?, cookingSkill: String?,
                        completionHandler: @escaping UserCompletionHandler) {
        var params = Parameters()
        if let email = email {
            params["email"] = email
        }
        if let name = name {
            params["name"] = name
        }
        if let gender = gender {
            params["gender"] = gender
        }
        if let size = householdSize {
            params["household_size"] = size
        }
        if let status = empStatus {
            params["employment_status"] = status
        }
        if let skill = cookingSkill {
            params["cooking_skills"] = skill
        }
        if let age = age {
            params["age"] = age
        }
        
        _ = POST(EndPoints.getUser, params: params).responseSwiftyJSON { (json, error) in
            if let json = json {
                debugPrint("json: \(json)")
                
                // Fake response
                let response = UserResponse(json: json)
                DataManager.sharedInstance.currentUser = response.user
                if let name = response.user?.name {
                    AppState.UserAuth.lastUserName = name
                }
                
                if json["result"].stringValue == "success" {
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
    
    func sendFeedback(content: String, rating: String, category: String, completionHandler: @escaping UserCompletionHandler) {
        let params = ["feedback": content, "rating": rating, "category": category]
        _ = POST(EndPoints.feedback, params: params).responseSwiftyJSON { (json, error) in
            if let json = json {
                debugPrint("json: \(json)")
                
                // Fake response
                let response = UserResponse(json: json)
                
                if json["result"].stringValue == "success" {
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
}
