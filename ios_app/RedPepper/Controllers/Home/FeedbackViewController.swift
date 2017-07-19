//
//  FeedbackViewController.swift
//  RedPepper
//
//  Created by An Phan on 10/11/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import UIKit
import Cosmos
import TSMessages

class FeedbackViewController: BaseViewController {

    @IBOutlet weak var expBgView: UIView!
    @IBOutlet weak var expandButton: UIButton!
    @IBOutlet weak var textView: UITextView!
    @IBOutlet weak var placeholderLabel: UILabel!
    @IBOutlet weak var expTextField: UITextField!
    @IBOutlet weak var comosView: CosmosView!
    
    var picker: PickerView = PickerView.fromNib()
    fileprivate var desc = ""
    fileprivate var rating = 5.0
    fileprivate var category = "Experience on Alexa"
    
    // MARK: - View life cycle
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        NotificationCenter.default.addObserver(self, selector: #selector(setHome),
                                               name: NSNotification.Name(rawValue: "SetHomeVC"),
                                               object: nil)
        prepareView()
        
        comosView.didFinishTouchingCosmos = { rating in
            self.rating = rating
        }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
    
    fileprivate func prepareView() {
        let borderColor = UIColor.rgbColor(red: 204, green: 204, blue: 204)
        expBgView.addBorderWithColor(borderColor, width: 1)
        expandButton.addLeftBorderWithColor(borderColor, width: 1)
        textView.addBorderWithColor(borderColor, width: 1)
        
        textView.textContainerInset = UIEdgeInsets(top: 10, left: 10, bottom: 10, right: 10)
        
        // Gender picker
        expTextField.inputView = picker
        picker.textField = expTextField
        picker.titleLabel.text = "Choose category"
        picker.values = ["Experience on Alexa", "iOS app", "Logo & branding", "Other"]
        picker.didSelectedValue = { selectedValue in
            if !selectedValue.isEmpty {
                self.category = selectedValue
                self.expTextField.text = selectedValue
            }
        }
    }
    
    @IBAction func menuButtonTapped(_ sender: UIBarButtonItem) {
        
        // Dimiss keyboard (optional)
        view.endEditing(true)
        frostedViewController.view.endEditing(true)
        
        // Present the view contoller
        frostedViewController.presentMenuViewController()
    }
    
    func setHome() {
        let storyboardID = Storyboard.Identifiers.homeNavigationController
        self.frostedViewController.contentViewController = Storyboard.storyboard.instantiateViewController(withIdentifier: storyboardID)
    }
 
    @IBAction func submitButtonTapped(_ sender: UIButton) {
        guard !desc.isEmpty else {
            TSMessage.showNotification(withTitle: "Content can't be blank!", type: .error)
            return
        }
        
        showLoading()
        UserService.sharedInstance.sendFeedback(content: desc, rating: String(rating), category: category) { (response, error) in
            self.hideLoading()
            if let _ = error {
                TSMessage.showNotification(withTitle: "Your feedback can't sent. Please try again!", type: .error)
            }
            else {
                self.performSegue(withIdentifier: Storyboard.SegueID.presentThankVC, sender: nil)
            }
        }
    }
    
    @IBAction func expandButtonTapped(_ sender: UIButton) {
        expTextField.becomeFirstResponder()
    }
}

// MARK: - UITextViewDelegate

extension FeedbackViewController: UITextViewDelegate {
    func textViewDidChange(_ textView: UITextView) {
        desc = textView.text
        if desc.isEmpty {
            placeholderLabel.isHidden = false
        }
        else {
            placeholderLabel.isHidden = true
        }
    }
}

// MARK: - UIScrollViewDelegate

extension FeedbackViewController: UIScrollViewDelegate {
    func scrollViewWillBeginDragging(_ scrollView: UIScrollView) {
        textView.resignFirstResponder()
    }
}
