//
//  AccountTableViewController.swift
//  RedPepper
//
//  Created by An Phan on 10/11/16.
//  Copyright © 2016 An Phan. All rights reserved.
//

import UIKit
import TPKeyboardAvoiding
import TSMessages
import Kingfisher

class AccountViewController: BaseViewController {

    let titles = ["Age", "Gender", "Household Size", "Profession", "Cooking Skills"]
    
    @IBOutlet weak var tableView: TPKeyboardAvoidingTableView!
    @IBOutlet weak var usernameTextField: UITextField!
    @IBOutlet weak var avatarImageView: UIImageView!
    
    // Five pickers
    var agePicker: PickerView = PickerView.fromNib()
    var genderPicker: PickerView = PickerView.fromNib()
    var houseSizePicker: PickerView = PickerView.fromNib()
    var empStatusPicker: PickerView = PickerView.fromNib()
    var skillPicker: PickerView = PickerView.fromNib()
    var pickers = [PickerView]()
    
    // Selected values
    var selectedAge: String?
    var selectedGender: String?
    var selectedSize: String?
    var selectedStatus: String?
    var selectedSkill: String?
    
    // MARK: - View life cycle
    
    override func viewDidLoad() {
        super.viewDidLoad()

        pickers = [agePicker, genderPicker, houseSizePicker, empStatusPicker, skillPicker]
        prepareNavigationBar()
        preparePicker()
        prepareData()
    }
    
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        var title = ""
        var loadUrl = ""
        if segue.identifier == "presentAboutVCSegue" {
            title = "About"
            loadUrl = AppConfig.ExternalURLs.about
        }
        else if segue.identifier == "presentToUVCSegue" {
            title = "Terms of Services"
            loadUrl = AppConfig.ExternalURLs.terms
        }
        else if segue.identifier == "presentPrivacyVCSegue" {
            title = "Privacy Policy"
            loadUrl = AppConfig.ExternalURLs.privacyPolicy
        }
        
        if let desNC = segue.destination as? UINavigationController {
            let desVC = desNC.topViewController as! WebViewController
            desVC.isPresenting = true
            desVC.loadUrl = loadUrl
            desVC.title = title
        }
    }
    
    // MARK: - Private methods
    
    fileprivate func prepareData() {
        if let user = DataManager.sharedInstance.currentUser {
            selectedAge = user.age
            selectedGender = user.gender
            selectedSize = user.householdSize
            selectedStatus = user.employmentStatus
            selectedSkill = user.cookingSkills
            
            // Display username
            usernameTextField.text = AppState.UserAuth.lastUserName
        }
        
        // Download and render user avatar
        if let userId = AppState.UserAuth.lastUserId,
            let url = URL(string: "http://graph.facebook.com/\(userId)/picture?width=750&height=388") {
            avatarImageView.kf.indicatorType = .activity
            avatarImageView.kf.setImage(with: url)
        }
    }
    
    fileprivate func preparePicker() {
        
        // Age picker
        agePicker.titleLabel.text = "Age"
        agePicker.values = ["", ""]
        var ages = [String]()
        for index in 10...99 {
            ages.append(String(index))
        }
        agePicker.values = ages
        
        // Gender picker
        genderPicker.titleLabel.text = "Gender"
        genderPicker.values = ["Male", "Female"]

        // Household size picker
        houseSizePicker.titleLabel.text = "Household Size"
        var houseHoldSizes = [String]()
        for index in 1...10 {
            houseHoldSizes.append(String(index))
        }
        houseSizePicker.values = houseHoldSizes
        
        // Profession picker
        empStatusPicker.titleLabel.text = "Profession"
        empStatusPicker.values = ["Home maker", "Business owner", "Employed"]
        
        // Cooking skill picker
        skillPicker.titleLabel.text = "Cooking Skills"
        skillPicker.values = ["Beginner", "Expert", "Master"]
    }
    
    fileprivate func prepareNavigationBar() {
        navigationController?.navigationBar.isTranslucent = true
        navigationController?.navigationBar.setBackgroundImage(UIImage(), for: .default)
        navigationController?.navigationBar.shadowImage = UIImage()
        navigationController?.navigationBar.tintColor = UIColor.white
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    @IBAction func menuButtonTapped(_ sender: UIBarButtonItem) {
        
        // Dimiss keyboard (optional)
        view.endEditing(true)
        frostedViewController.view.endEditing(true)
        
        // Present the view contoller
        frostedViewController.presentMenuViewController()
    }
    
    @IBAction func backToHomeButtonTapped(_ sender: UIButton) {
        let storyboardID = Storyboard.Identifiers.homeNavigationController
        frostedViewController.contentViewController = Storyboard.storyboard.instantiateViewController(withIdentifier: storyboardID)
        
        NotificationCenter.default.post(name: NSNotification.Name(rawValue: Notifications.reloadMenuNotification), object: 0)
    }
    
    @IBAction func saveButtonTapped(_ sender: UIButton) {
        guard let username = usernameTextField.text, !username.isEmpty else {
            TSMessage.showNotification(withTitle: "Name can't be blank!", type: .error)
            return
        }
        
        showLoading()
        UserService.sharedInstance.updateUserName(name: username, email: nil, age: selectedAge, gender: selectedGender, householdSize: selectedSize, empStatus: selectedStatus, cookingSkill: selectedSkill) { (userResponse, error) in
            self.hideLoading()
            if let _ = error {
                TSMessage.showNotification(withTitle: "Can't update your info. Please try again!", type: .error)
            }
            else {
                TSMessage.showNotification(withTitle: "Account updated", type: .success)
            }
        }
    }
}

// MARK: - Table view data source

extension AccountViewController: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return titles.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: AccountTableViewCell.cellID, for: indexPath) as! AccountTableViewCell
        cell.titleLabel?.text = titles[indexPath.row]
        if let textField = cell.textField {
            textField.placeholder = titles[indexPath.row]
            pickers[indexPath.row].textField = textField
            textField.inputView = pickers[indexPath.row]
            
            // Render user info
            switch indexPath.row {
            case 0:
                textField.text = selectedAge
            case 1:
                textField.text = selectedGender
            case 2:
                textField.text = selectedSize
            case 3:
                textField.text = selectedStatus
            case 4:
                textField.text = selectedSkill
            default:
                break
            }
            
            // Handle actions
            pickers[indexPath.row].didSelectedValue = { selectedValue in
                self.pickers[indexPath.row].textField?.text = selectedValue
                
                switch indexPath.row {
                case 0:
                    self.selectedAge = selectedValue
                case 1:
                    self.selectedGender = selectedValue
                case 2:
                    self.selectedSize = selectedValue
                case 3:
                    self.selectedStatus = selectedValue
                case 4:
                    self.selectedSkill = selectedValue
                default:
                    break
                }
            }
        }
        
        return cell
    }
}

// MARK: - UITableViewDelegate

extension AccountViewController: UITableViewDelegate {
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let cell = tableView.cellForRow(at: indexPath) as! AccountTableViewCell
        cell.textField?.becomeFirstResponder()
    }
}
