//
//  BaseService.swift

import Foundation
import Alamofire

class BaseService {
 
    // MARK: - Request methods
    
    func GET(_ endpoint:String, params: [String : Any]?) -> Alamofire.DataRequest {
        return sendRequest(.get, endpoint:endpoint, params: params)
    }
    
    func POST(_ endpoint:String, params: [String : Any]?) -> Alamofire.DataRequest {
        return sendRequest(.post, endpoint:endpoint, params: params)
    }
    
    func PUT(_ endpoint:String, params: [String : Any]?) -> Alamofire.DataRequest {
        return sendRequest(.put, endpoint:endpoint, params: params)
    }
    
    func DELETE(_ endpoint:String, params: [String : Any]?) -> Alamofire.DataRequest {
        return sendRequest(.delete, endpoint:endpoint, params: params)
    }
    
    // MARK: - Private
    
    fileprivate func sendRequest(_ method: Alamofire.HTTPMethod, endpoint: String!, params:[String : Any]?) -> Alamofire.DataRequest {

        // Configure Alamofire shared manager header
        var header = ["Content-Type": "application/json", "Cache-Control": "no-cache"]
        if let token = AppState.UserAuth.authToken {
            header["token"] = token
            header["token_source"] = "facebook"
        }
        return Alamofire.request(path(endpoint), method: method, parameters: params, encoding: JSONEncoding.default, headers: header).validate()
    }
    
    fileprivate func path(_ endpoint: String) -> String {
        return  "\(AppConfig.Environment.hostPath)/\(endpoint)"
    }
}
