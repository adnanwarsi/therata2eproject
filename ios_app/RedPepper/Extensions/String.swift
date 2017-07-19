//
//  String.swift

import Foundation
import UIKit

extension String {
    var isPhoneNumber: Bool {
        let charcter  = CharacterSet(charactersIn: "+0123456789").inverted
        var filtered:String!
        let inputString: [String] = self.components(separatedBy: charcter)
        filtered = inputString.joined(separator: "")
        
        return self == filtered
    }
    
    func isValidEmail() -> Bool {
        let emailRegEx = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}"
        let emailTest = NSPredicate(format:"SELF MATCHES %@", emailRegEx)
        let result = emailTest.evaluate(with: self)
        
        return result
    }
    
    func trim() -> String {
        return trimmingCharacters(in: CharacterSet.whitespaces)
    }
    
    func replace(_ target: String, withString: String) -> String {
        return self.replacingOccurrences(of: target, with: withString,
            options: NSString.CompareOptions.literal, range: nil)
    }
    
    func toDateTime() -> Date? {
        // Create Date Formatter
        let dateFormatter = DateFormatter()
        
        // Specify Format of String to Parse
        dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
        
        // Parse into NSDate
        if let dateFromString = dateFormatter.date(from: self) {
            // Return Parsed Date
            return dateFromString
        }
        else {
            dateFormatter.dateFormat = "yyyy-MM-dd"
            if let dateFromString = dateFormatter.date(from: self) {
                // Return Parsed Date
                return dateFromString
            }
        }
        
        return nil
    }
    
    func monthYearStringToDate() -> Date {
        //Create Date Formatter
        let dateFormatter = DateFormatter()
        
        //Specify Format of String to Parse
        dateFormatter.dateFormat = "MMM yyyy"
        
        //Parse into NSDate
        if let dateFromString = dateFormatter.date(from: self) {
            //Return Parsed Date
            return dateFromString
        }
        
        return Date()
    }
    
    // Mon, 04 Apr 2016 09:00 AM WIB ==> "EEE, dd MMM yyyy HH:mm a Z"
    func weatherDate() -> Date {
        //Create Date Formatter
        let dateFormatter = DateFormatter()
        
        //Specify Format of String to Parse
        dateFormatter.dateFormat = "EEE, dd MMM yyyy HH:mm a Z"
        
        //Parse into NSDate
        if let dateFromString = dateFormatter.date(from: self) {
            //Return Parsed Date
            return dateFromString
        }
        
        return Date()
    }
    
    func dayOfWeek() -> String {
        switch self {
        case "Mon":
            return "Monday"
        case "Tue":
            return "Tuesday"
        case "Wed":
            return "Wednesday"
        case "Thu":
            return "Thursday"
        case "Fri":
            return "Friday"
        case "Sat":
            return "Saturday"
        case "Sun":
            return "Sunday"
        default:
            return "Unknown"
        }
    }
    
    func heightWithConstrainedWidth(_ width: CGFloat, font: UIFont) -> CGFloat {
        let constraintRect = CGSize(width: width, height: CGFloat.greatestFiniteMagnitude)
        
        let boundingBox = self.boundingRect(with: constraintRect, options: NSStringDrawingOptions.usesLineFragmentOrigin, attributes: [NSFontAttributeName: font], context: nil)
        
        return boundingBox.height
    }
    
    var isAlphabetical: Bool {
        return range(of: "^[a-zA-Z]", options: .regularExpression) != nil
    }
    
    func htmlDecoded()->String {
        
        guard (self != "") else { return self }
        
        var newStr = self
        
        let entities = [
            "&quot;"    : "\"",
            "&amp;"     : "&",
            "&apos;"    : "'",
            "&lt;"      : "<",
            "&gt;"      : ">",
            ]
        
        for (name,value) in entities {
            newStr = newStr.replacingOccurrences(of: name, with: value)
        }
        return newStr
    }
    
    func convertToDictionary() -> [String: AnyObject]? {
        if let data = self.data(using: String.Encoding.utf8) {
            do {
                return try JSONSerialization.jsonObject(with: data, options: []) as? [String: AnyObject]
            } catch let error as NSError {
                print(error)
            }
        }
        
        return nil
    }
}
