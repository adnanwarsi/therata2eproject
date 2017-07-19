//
//  BaseResponse.swift

import Foundation
import SwiftyJSON

class BaseResponse {
    var status: Bool?
    var message: String?
    var error: NSError?
    
    required init(json: JSON) {
        status = json["found"].bool
        message = json["message"].string
    }
}
