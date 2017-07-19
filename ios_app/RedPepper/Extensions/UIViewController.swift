//
//  UIViewController.swift

import Foundation
import UIKit
import RNActivityView

extension UIViewController {
    
    func showOkeyMessage(_ title: String?, message: String?) {
        
        let alertViewController = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alertViewController.addAction(UIAlertAction(title: "OK", style: .cancel) { (alertAction) -> Void in })
        
        present(alertViewController, animated: true, completion: nil)
    }
    
    func showAlertWithActions(_ title: String?, message: String?, actions: [UIAlertAction]?) {
        
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        if let uActios = actions {
            for action in uActios {
                alert.addAction(action)
            }
        }
        else {
            alert.addAction(UIAlertAction(title: NSLocalizedString("OK", comment: ""), style: .default, handler: { (alertAction) -> Void in }))
        }
        
        present(alert, animated: true, completion: nil)
    }
    
    func showYesNoWithActions(_ title: String?, message: String?, actions: [UIAlertAction]?) {
        
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        if let uAction = actions {
            for action in uAction {
                alert.addAction(action)
            }
            alert.addAction(UIAlertAction(title: NSLocalizedString("No", comment: ""), style: .default, handler: { (alertAction) -> Void in }))
        }
        else {
            alert.addAction(UIAlertAction(title: NSLocalizedString("No", comment: ""), style: .default, handler: { (alertAction) -> Void in }))
        }
        
        present(alert, animated: true, completion: nil)
    }
    
    // MARK: - Progress
    
    func showLoading() {
        view.showActivityView()
    }
    
    func hideLoading() {
        view.hideActivityView()
    }
}
