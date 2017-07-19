//
//  DataRequest.swift
//  RedPepper
//
//  Created by An Phan on 10/20/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import Foundation
import Alamofire
import SwiftyJSON

extension DataRequest {
    public static func SwiftyJSONResponseSerializer() -> DataResponseSerializer<JSON> {
        return DataResponseSerializer {
            _, response, data, error in
            
            guard error == nil else {
                return .failure(error!)
            }
            
            if let response = response, response.statusCode == 204 {
                return .success(JSON.null)
            }
            
            guard let validData = data, validData.count > 0 else {
                let failureReason = "JSON could not be serialized. Input data was nil or zero length."
                let userInfo = [NSLocalizedFailureReasonErrorKey: failureReason]
                let code = response?.statusCode ?? 0
                let domain = response?.url?.absoluteString ?? ""
                let e = NSError(domain: domain, code: code, userInfo: userInfo)
                return .failure(e)
            }
            
            do {
                let json = try JSONSerialization.jsonObject(with: validData, options: .allowFragments)
                return .success(JSON(json))
            } catch {
                return .failure(error as NSError)
            }
        }
    }
    
    public func responseSwiftyJSON(_ completionHandler: @escaping (JSON?, NSError?) -> Void) -> Self {
        return response(responseSerializer: DataRequest.SwiftyJSONResponseSerializer(), completionHandler: {
            response in
            let method = response.request?.httpMethod ?? ""
            let domain = response.request?.url?.absoluteString ?? ""
            let responseStatus = response.response?.statusCode ?? 0
            
            switch response.result {
            case .success(let json):
                guard case 200 ..< 300 = responseStatus else {
                    debugPrint("Request error: %@ domain[%@] statusCode[%d]", getVaList([method, domain, responseStatus]))
                    
                    var message = "API Returned a non-200 response"
                    if json["message"].exists() {
                        message = json["message"].stringValue
                    }
                    
                    completionHandler(nil, NSError(domain: domain, code: responseStatus, userInfo: [NSLocalizedDescriptionKey: message]))
                    return
                }
                
                if let errorMessage = json["errorMessage"].string {
                    debugPrint("Request error: %@ domain[%@] statusCode[%d] errorMessage[%@]", getVaList([method, domain, responseStatus, errorMessage]))
                    completionHandler(json, NSError(domain: domain, code: responseStatus, userInfo: [NSLocalizedDescriptionKey: errorMessage]))
                    return
                }
                
                debugPrint("Request success: %@ domain[%@]", getVaList([method, domain]))
                completionHandler(json, nil)
                
            case .failure(let error):
                let errorString = String(describing: error)
                debugPrint("Request error: %@ domain[%@] statusCode[%d] errorMessage[%@]", getVaList([method, domain, responseStatus, errorString]))
                completionHandler(nil, NSError(domain: domain, code: responseStatus, userInfo: [NSLocalizedDescriptionKey: errorString]))
            }
        })
    }
}
