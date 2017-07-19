//
//  NSDate.swift

import Foundation

extension Date {
    var monthFirstFormatter: DateFormatter {
        let formatter: DateFormatter = DateFormatter()
        formatter.dateFormat = "MM/dd/yyyy"
        
        return formatter
    }
    
    var yearFirstFormatter: DateFormatter {
        let formatter: DateFormatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        
        return formatter
    }
    
    var month3CharsFormatter: DateFormatter {
        let formatter: DateFormatter = DateFormatter()
        formatter.dateFormat = "dd MMM yyyy"
        
        return formatter
    }
    
    var month3CharYearFormatter: DateFormatter {
        let formatter: DateFormatter = DateFormatter()
        formatter.dateFormat = "MMM yyyy"
        
        return formatter
    }
    
    var monthFullCharMiddleFormatter: DateFormatter {
        let formatter: DateFormatter = DateFormatter()
        formatter.dateFormat = "dd MMMM yyyy"
        
        return formatter
    }
    
    var dayOfWeekFormatter: DateFormatter {
        let formatter: DateFormatter = DateFormatter()
        formatter.dateFormat = "EEEE"
        
        return formatter
    }
    
    var hourFromDateFormatter: DateFormatter {
        let formatter: DateFormatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        
        return formatter
    }
    
    func monthFirstDate() -> String {
        return monthFirstFormatter.string(from: self)
    }
    
    func yearFirstDate() -> String {
        return yearFirstFormatter.string(from: self)
    }
    
    func monthMiddleWith3Chars() -> String {
        return month3CharsFormatter.string(from: self)
    }
    
    func monthFirst3Chars() -> String {
        return month3CharYearFormatter.string(from: self)
    }
    
    func monthFullCharMiddle() -> String {
        return monthFullCharMiddleFormatter.string(from: self)
    }
    
    func dayOfWeek() -> String {
        return dayOfWeekFormatter.string(from: self)
    }
    
    func hourFromDate() -> String {
        return hourFromDateFormatter.string(from: self)
    }
}
